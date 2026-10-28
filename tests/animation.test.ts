import { createHash } from 'node:crypto';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHeroCanvas } from '../src/hooks/useHeroCanvas';
import { originalHTML } from './original-fixture';

// Compare drawing commands, not pixels: jsdom has no rasterizer. A seeded RNG
// makes the original random animation reproducible without altering its code.
function recordingContext() {
  const hash = createHash('sha256');
  let calls = 0;
  const record = (...values: unknown[]) => {
    hash.update(JSON.stringify(values));
    calls++;
  };
  const context = new Proxy<Record<string, unknown>>({}, {
    get(target, property: string) {
      if (property in target) return target[property];
      return (...args: unknown[]) => {
        record(property, ...args);
        if (property === 'createRadialGradient' || property === 'createLinearGradient') {
          return { addColorStop: (...stops: unknown[]) => record('addColorStop', ...stops) };
        }
        return undefined;
      };
    },
    set(target, property: string, value: unknown) {
      record('set', property, value);
      target[property] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { context, snapshot: () => ({ digest: hash.copy().digest('hex'), calls }) };
}

function seededRandom() {
  let seed = 0x168862;
  let calls = 0;
  return {
    random: () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      calls++;
      return seed / 0x100000000;
    },
    calls: () => calls,
  };
}

function fixture() {
  const hero = document.createElement('section');
  const canvas = document.createElement('canvas');
  let width = 1440;
  let height = 900;
  Object.defineProperties(hero, {
    offsetWidth: { get: () => width },
    offsetHeight: { get: () => height },
  });
  const recording = recordingContext();
  Object.defineProperty(canvas, 'getContext', { value: () => recording.context });
  let frameId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const request = vi.fn((callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  const cancel = vi.fn((id: number) => { frames.delete(id); });
  return {
    hero, canvas, recording, request, cancel, frames,
    resize() { width = 390; height = 464; },
    step() {
      const [entry] = frames.entries();
      if (!entry) throw new Error('Animation failed to schedule its next frame');
      frames.delete(entry[0]);
      entry[1](frameId * 16);
    },
  };
}

function activeCanvasSource(): string {
  const start = originalHTML.indexOf('(function(){', originalHTML.indexOf('HERO CANVAS ANIMATIONS'));
  const end = originalHTML.indexOf('})();', start) + '})();'.length;
  if (start < 0 || end < start) throw new Error('Missing original live hero canvas');
  return originalHTML.slice(start, end);
}

describe('original hero animation parity', () => {
  it('produces identical canvas operations and random calls through animation and resize', () => {
    const legacy = fixture();
    const legacyRandom = seededRandom();
    const random = vi.spyOn(Math, 'random').mockImplementation(legacyRandom.random);
    let resizeOriginal = () => undefined as void;
    new Function('document', 'window', 'requestAnimationFrame', 'setTimeout', activeCanvasSource())(
      { getElementById: (id: string) => id === 'heroCanvas' ? legacy.canvas : legacy.hero },
      { addEventListener: (_event: string, callback: () => void) => { resizeOriginal = callback; } },
      legacy.request, setTimeout,
    );
    expect(legacy.canvas.width).toBe(1440);
    expect(legacy.canvas.height).toBe(900);
    expect(legacy.frames.size).toBe(0);
    vi.advanceTimersByTime(99);
    expect(legacy.recording.snapshot().calls).toBe(0);
    vi.advanceTimersByTime(1);
    const expected = [];
    for (let frame = 0; frame < 720; frame++) {
      if (frame === 360) { legacy.resize(); resizeOriginal(); }
      legacy.step();
      expected.push(legacy.recording.snapshot());
    }
    const expectedRandomCalls = legacyRandom.calls();
    random.mockRestore();

    const migrated = fixture();
    const migratedRandom = seededRandom();
    vi.spyOn(Math, 'random').mockImplementation(migratedRandom.random);
    vi.stubGlobal('requestAnimationFrame', migrated.request);
    vi.stubGlobal('cancelAnimationFrame', migrated.cancel);
    const { unmount } = renderHook(() => useHeroCanvas(
      { current: migrated.hero }, { current: migrated.canvas },
    ));
    expect(migrated.canvas.width).toBe(1440);
    expect(migrated.canvas.height).toBe(900);
    expect(migrated.frames.size).toBe(0);
    act(() => { vi.advanceTimersByTime(99); });
    expect(migrated.recording.snapshot().calls).toBe(0);
    act(() => { vi.advanceTimersByTime(1); });
    for (let frame = 0; frame < 720; frame++) {
      if (frame === 360) {
        migrated.resize();
        window.dispatchEvent(new Event('resize'));
      }
      migrated.step();
      expect(migrated.recording.snapshot(), `drawing operations at frame ${frame}`).toEqual(expected[frame]);
    }
    expect(migratedRandom.calls()).toBe(expectedRandomCalls);
    expect(migrated.canvas.width).toBe(390);
    expect(migrated.canvas.height).toBe(464);
    unmount();
    expect(migrated.frames.size).toBe(0);
    expect(migrated.cancel).toHaveBeenCalledOnce();
    // Resize no longer changes the canvas after unmount.
    migrated.canvas.width = 123;
    window.dispatchEvent(new Event('resize'));
    expect(migrated.canvas.width).toBe(123);
  });

  it('cancels the initial start timer if unmounted before the 100ms delay', () => {
    const migrated = fixture();
    vi.stubGlobal('requestAnimationFrame', migrated.request);
    const { unmount } = renderHook(() => useHeroCanvas(
      { current: migrated.hero }, { current: migrated.canvas },
    ));
    unmount();
    act(() => { vi.advanceTimersByTime(100); });
    expect(migrated.recording.snapshot().calls).toBe(0);
    expect(migrated.request).not.toHaveBeenCalled();
  });
});
