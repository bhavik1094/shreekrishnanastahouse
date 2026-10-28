import { useEffect, type RefObject } from 'react';

export function useTabPeek(tabsRef: RefObject<HTMLDivElement | null>, wrapRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (window.innerWidth > 900) return;
    const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (motionPreference?.matches) return;
    const tabs = tabsRef.current;
    const wrap = wrapRef.current;
    if (!tabs || !wrap) return;
    let dismissed = false;
    let peeking = false;
    let fired = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const onScroll = () => {
      const atEnd = tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 4;
      wrap.classList.toggle('at-end', atEnd);
      if (!dismissed && !peeking && tabs.scrollLeft > 4) {
        dismissed = true;
        wrap.classList.remove('show-hint');
      }
    };
    const peek = () => {
      if (motionPreference?.matches) return;
      peeking = true;
      tabs.scrollTo({ left: Math.round(tabs.scrollWidth * 0.3), behavior: 'smooth' });
      timers.push(setTimeout(() => {
        tabs.scrollTo({ left: 0, behavior: motionPreference?.matches ? 'auto' : 'smooth' });
        timers.push(setTimeout(() => { peeking = false; }, 700));
      }, 700));
    };
    tabs.addEventListener('scroll', onScroll);
    let observer: IntersectionObserver | undefined;
    if (tabs.scrollWidth > tabs.clientWidth + 4) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !fired) {
            fired = true;
            wrap.classList.add('show-hint');
            timers.push(setTimeout(peek, 500));
            observer?.disconnect();
          }
        });
      }, { threshold: 0.6 });
      observer.observe(wrap);
    }
    return () => {
      tabs.removeEventListener('scroll', onScroll);
      observer?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [tabsRef, wrapRef]);
}
