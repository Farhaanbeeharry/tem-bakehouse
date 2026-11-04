import { useEffect, useRef } from 'react';

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** 0 → 1 progress of a tall section scrolling past its sticky viewport. */
export const sectionProgress = (el: Element) => {
  const r = el.getBoundingClientRect();
  return clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
};

/** Calls `tick` on every animation frame in which the page scrolled or resized. */
export const useScrollTick = (tick: () => void, deps: unknown[] = []) => {
  const ref = useRef(tick);
  ref.current = tick;
  useEffect(() => {
    let queued = 0;
    const run = () => {
      queued = 0;
      ref.current();
    };
    const on = () => {
      if (!queued) queued = requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(queued);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
