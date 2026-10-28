import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MenuSection, PartyMenuSection } from '../src/components/Menu';
import { OrderProvider } from '../src/hooks/useOrder';
import { useHeroCanvas } from '../src/hooks/useHeroCanvas';
import { useTabPeek } from '../src/hooks/useTabPeek';
import i18n from '../src/i18n';

function animationFixture() {
  const hero = document.createElement('section');
  const canvas = document.createElement('canvas');
  Object.defineProperties(hero, {
    offsetWidth: { value: 1440 }, offsetHeight: { value: 900 },
  });
  let nextId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const request = vi.fn((callback: FrameRequestCallback) => {
    frames.set(++nextId, callback);
    return nextId;
  });
  const cancel = vi.fn((id: number) => { frames.delete(id); });
  vi.stubGlobal('requestAnimationFrame', request);
  vi.stubGlobal('cancelAnimationFrame', cancel);
  return { hero, canvas, frames, request, cancel };
}

describe('catalogue image delivery', () => {
  it('defers catalogue images and keeps a failed photo accessible, translated and orderable', async () => {
    await i18n.changeLanguage('fr');
    const { container } = render(<OrderProvider><MenuSection /><PartyMenuSection /></OrderProvider>);
    const photos = [...container.querySelectorAll('img')];
    expect(photos).toHaveLength(28);
    for (const photo of photos) {
      expect(photo).toHaveAttribute('loading', 'lazy');
      expect(photo).toHaveAttribute('decoding', 'async');
    }
    const photo = photos[0];
    if (!photo) throw new Error('Missing first catalogue photo');
    fireEvent.error(photo);
    expect(photo).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: i18n.t('products.1.name') })).toHaveTextContent('🫓');
    fireEvent.click(screen.getByRole('button', { name: i18n.t('menu.addItem', { name: i18n.t('products.1.name') }) }));
    expect(container.querySelector('#ctrl-1 .qty-n')).toHaveTextContent('1');
    await act(async () => { await i18n.changeLanguage('hi'); });
    expect(screen.getByRole('img', { name: i18n.t('products.1.name') })).toHaveTextContent('🫓');
    expect(container.querySelector('#ctrl-1 .qty-n')).toHaveTextContent('1');
  });
});

describe('optional mobile tab motion', () => {
  it('does not auto-scroll tabs when reduced motion is requested', () => {
    vi.stubGlobal('innerWidth', 390);
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const observer = vi.fn();
    vi.stubGlobal('IntersectionObserver', observer);
    const tabs = document.createElement('div');
    const wrap = document.createElement('div');
    Object.defineProperties(tabs, { clientWidth: { value: 200 }, scrollWidth: { value: 600 } });
    renderHook(() => useTabPeek({ current: tabs }, { current: wrap }));
    act(() => { vi.advanceTimersByTime(2000); });
    expect(observer).not.toHaveBeenCalled();
    expect(tabs.scrollTo).not.toHaveBeenCalled();
  });

  it('rechecks motion preference before a scheduled mobile peek begins', () => {
    vi.stubGlobal('innerWidth', 390);
    let reduced = false;
    vi.stubGlobal('matchMedia', vi.fn(() => ({ get matches() { return reduced; } })));
    let notify: IntersectionObserverCallback | undefined;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe() {}
      disconnect() {}
    });
    const tabs = document.createElement('div');
    const wrap = document.createElement('div');
    Object.defineProperties(tabs, { clientWidth: { value: 200 }, scrollWidth: { value: 600 } });
    renderHook(() => useTabPeek({ current: tabs }, { current: wrap }));
    if (!notify) throw new Error('Mobile tab observer not registered');
    const bounds = wrap.getBoundingClientRect();
    act(() => {
      notify?.([{
        target: wrap, isIntersecting: true, boundingClientRect: bounds,
        intersectionRatio: 1, intersectionRect: bounds, rootBounds: null, time: 0,
      }], {} as IntersectionObserver);
    });
    reduced = true;
    act(() => { vi.advanceTimersByTime(2000); });
    expect(tabs.scrollTo).not.toHaveBeenCalled();
  });
});

describe('hero effect playback', () => {
  it('pauses when the hero leaves view, resumes once, and releases its observer', () => {
    const fixture = animationFixture();
    let notify: IntersectionObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    const visibility = (isIntersecting: boolean) => {
      if (!notify) throw new Error('Hero observer not registered');
      const bounds = fixture.hero.getBoundingClientRect();
      notify([{
        target: fixture.hero, isIntersecting, boundingClientRect: bounds,
        intersectionRatio: isIntersecting ? 1 : 0, intersectionRect: bounds,
        rootBounds: null, time: 0,
      }], {} as IntersectionObserver);
    };
    const { unmount } = renderHook(() => useHeroCanvas({ current: fixture.hero }, { current: fixture.canvas }));
    expect(observe).toHaveBeenCalledWith(fixture.hero);
    act(() => { vi.advanceTimersByTime(100); });
    expect(fixture.frames.size).toBe(1);
    act(() => { visibility(false); });
    expect(fixture.frames.size).toBe(0);
    act(() => { visibility(true); visibility(true); });
    expect(fixture.frames.size).toBe(1);
    unmount();
    expect(fixture.frames.size).toBe(0);
    expect(disconnect).toHaveBeenCalledOnce();
    act(() => { visibility(true); });
    expect(fixture.frames.size).toBe(0);
  });

  it('avoids animation for reduced motion and responds to preference changes', () => {
    const fixture = animationFixture();
    let reduce = true;
    let onChange: (() => void) | undefined;
    const removeEventListener = vi.fn();
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      get matches() { return reduce; },
      addEventListener: (_event: string, callback: () => void) => { onChange = callback; },
      removeEventListener,
    })));
    const { unmount } = renderHook(() => useHeroCanvas({ current: fixture.hero }, { current: fixture.canvas }));
    act(() => { vi.advanceTimersByTime(100); });
    expect(fixture.request).not.toHaveBeenCalled();
    act(() => { reduce = false; onChange?.(); });
    expect(fixture.frames.size).toBe(1);
    act(() => { reduce = true; onChange?.(); });
    expect(fixture.frames.size).toBe(0);
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', onChange);
  });
});
