import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// jsdom has no drawing/layout engine. Keep animation setup alive, but never
// schedule frames or ask the network to render the original canvas/assets.
export function canvasContext(): CanvasRenderingContext2D {
  const gradient = { addColorStop: () => undefined };
  return new Proxy<Record<string, unknown>>({}, {
    get(target, key: string) {
      if (key in target) return target[key];
      if (key === 'createLinearGradient' || key === 'createRadialGradient') {
        return () => gradient;
      }
      if (key === 'measureText') return () => ({ width: 0 });
      return () => undefined;
    },
    set(target, key: string, value: unknown) {
      target[key] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
  // Wednesday, 13:34 in Paris; the local timestamp is shared by both runtimes.
  vi.setSystemTime(new Date('2026-10-28T12:34:00Z'));
  vi.spyOn(window, 'open').mockImplementation(() => null);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(() => canvasContext());
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('IntersectionObserver', class {
    readonly root = null;
    readonly rootMargin = '0px';
    readonly thresholds = [0];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
