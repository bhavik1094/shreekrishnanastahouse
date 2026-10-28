import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

export function positionIndicator(container: HTMLElement, selected: string, indicator: string, instant: boolean) {
  const active = container.querySelector<HTMLElement>(selected);
  const glass = container.querySelector<HTMLElement>(indicator);
  if (!active || !glass) return;
  if (instant || glass.dataset.ready !== '1') {
    glass.style.transition = 'none';
    glass.style.transform = `translateX(${active.offsetLeft}px)`;
    glass.style.width = `${active.offsetWidth}px`;
    void glass.offsetWidth;
    glass.style.transition = '';
    glass.dataset.ready = '1';
    return;
  }
  glass.style.transform = `translateX(${active.offsetLeft}px)`;
  glass.style.width = `${active.offsetWidth}px`;
}

export function useGlassIndicator<T extends HTMLElement>(
  ref: RefObject<T | null>, value: string, selected: string, indicator: string, resnapOnLoad = false,
) {
  const initialized = useRef(false);
  useLayoutEffect(() => {
    if (ref.current) positionIndicator(ref.current, selected, indicator, !initialized.current);
    initialized.current = true;
  }, [value, ref, selected, indicator]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const snap = () => { if (ref.current) positionIndicator(ref.current, selected, indicator, true); };
    const resize = () => { clearTimeout(timer); timer = setTimeout(snap, 120); };
    window.addEventListener('resize', resize);
    if (resnapOnLoad) window.addEventListener('load', snap);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('load', snap);
    };
  }, [ref, selected, indicator, resnapOnLoad]);
}
