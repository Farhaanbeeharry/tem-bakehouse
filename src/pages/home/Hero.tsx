import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { asset, holdHeavyAssets } from '../../lib/assets';
import { useIsMobile, useReducedMotion } from '../../lib/shop';
import { sectionProgress, seg, useScrollTick } from '../../lib/scroll';

const CAPTIONS = [
  { k: '02 / THE BREAK', text: 'Break it open.', a: 0.3, b: 0.5, side: 'left' as const, top: '16%' },
  { k: '03 / SHARE', text: 'Share it.', a: 0.5, b: 0.68, side: 'right' as const, top: '62%' },
  { k: '04 / SAVOUR', text: 'Savour it.', a: 0.68, b: 0.84, side: 'left' as const, top: '64%' },
];
const RAIL = ['01 SURFACE', '02 THE BREAK', '03 SHARE', '04 SAVOUR', '05 TEM'];
const RAIL_RANGES = [0, 0.3, 0.5, 0.68, 0.86, 1.01];

type Seq = { N: number; imgs: (HTMLImageElement | undefined)[]; ok: boolean };

/**
 * The hero plays as steps, not as a scrub: the title, each caption and the closing logo.
 * One scroll gesture (wheel, swipe or key) plays the frames to the next step.
 * Values are animation positions (0–1) where that step's text is fully on screen.
 */
const STEPS = [0, 0.4, 0.59, 0.76, 1];
const LAST = STEPS.length - 1;
const STEP_MS = 1150;
/** Scroll distance per step while the hero is pinned, in viewport heights. */
const STEP_VH = 0.6;

/** Only every STRIDE-th exported frame is loaded; the cross-fade in draw() covers the gaps. */
const STRIDE = 2;
/** Parallel frame downloads. */
const LANES = 6;
/** Longest a step waits for its frames before playing anyway. */
const WAIT_MS = 4000;
/** The loader never holds the page longer than this, even if some frames fail. */
const LOADER_MAX_MS = 45000;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Events from an open drawer, dialog or menu belong to it, not to the hero. */
const inOverlay = (el: EventTarget | null) => el instanceof Element && !!el.closest('[role="dialog"]');

const typing = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName));

export const Hero = () => {
  const navigate = useNavigate();
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<SVGSVGElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLLIElement | null)[]>([]);
  const seq = useRef<Seq | null>(null);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  // Loader: the page stays covered and still until every hero frame is in.
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const loadedRef = useRef(false);
  useEffect(() => {
    loadedRef.current = loaded;
    if (!loaded) return;
    const t = window.setTimeout(() => setLoaderGone(true), 800);
    return () => window.clearTimeout(t);
  }, [loaded]);

  useEffect(() => {
    const portrait = window.innerWidth < 820 || window.innerHeight > window.innerWidth;
    const device = portrait ? 'mobile' : 'desktop';
    const N = (portrait ? 180 : 240) / STRIDE;
    const S: Seq = { N, imgs: new Array(N), ok: false };
    seq.current = S;
    let alive = true;
    const releaseHeavy = holdHeavyAssets();
    const load = (i: number) =>
      new Promise<boolean>((res) => {
        if (S.imgs[i]) return res(true);
        const im = new Image();
        im.decoding = 'async';
        im.onload = () => {
          S.imgs[i] = im;
          res(true);
        };
        im.onerror = () => res(false);
        im.src = asset.heroFrame(device, i * STRIDE + 1);
      });
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let finished = false;
    const finish = () => {
      if (!alive || finished) return;
      finished = true;
      releaseHeavy();
      setProgress(1);
      setLoaded(true);
      setTick((t) => t + 1);
    };
    const safety = window.setTimeout(finish, LOADER_MAX_MS);
    (async () => {
      const first = await load(0);
      if (!alive) return;
      if (first) {
        S.ok = true;
        setReady(true);
      }
      // Reduced motion shows only the first frame, so there's nothing more to wait for.
      if (still || !first) return finish();
      let next = 1, done = 1;
      const lane = async () => {
        while (alive && next < N) {
          await load(next++);
          done++;
          if (alive) setProgress(done / N);
        }
      };
      await Promise.all(Array.from({ length: LANES }, lane));
      finish();
    })();
    return () => {
      alive = false;
      releaseHeavy();
      window.clearTimeout(safety);
    };
  }, []);

  // Hold the page at the top while loading.
  useEffect(() => {
    if (loaded) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => {
      html.style.overflow = prev;
    };
  }, [loaded]);

  const draw = (p: number) => {
    const S = seq.current, c = canvasRef.current;
    if (!S || !S.ok || !c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    const f = p * (S.N - 1), i0 = Math.floor(f), t = f - i0;
    const near = (i: number) => {
      for (let d = 0; d < S.N; d++) {
        if (S.imgs[i - d]) return S.imgs[i - d];
        if (S.imgs[i + d]) return S.imgs[i + d];
      }
      return undefined;
    };
    const a = near(i0), b = S.imgs[Math.min(S.N - 1, i0 + 1)];
    if (!a) return;
    const ctx = c.getContext('2d')!;
    const paint = (img: HTMLImageElement, alpha: number) => {
      const k = Math.max(w / img.width, h / img.height), dw = img.width * k, dh = img.height * k;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };
    paint(a, 1);
    if (b && b !== a && t > 0.02) paint(b, t);
    ctx.globalAlpha = 1;
    c.style.opacity = '1';
  };

  const ctl = useRef({ step: 0, p: 0, busy: false, raf: 0, synced: false, lockUntil: 0, lastWheel: 0, lastAbs: 0, touchY: 0 });

  const apply = (p: number) => {
    const tk = seg(p, 0.03, 0.15);
    if (titleRef.current) {
      titleRef.current.style.opacity = String(1 - tk);
      titleRef.current.style.transform = `translateY(${-tk * 90}px)`;
    }
    CAPTIONS.forEach((c, i) => {
      const el = capRefs.current[i];
      if (!el) return;
      const o = Math.min(seg(p, c.a, c.a + 0.05), 1 - seg(p, c.b - 0.05, c.b));
      el.style.opacity = String(Math.max(0, o));
      el.style.transform = `translateY(${(1 - seg(p, c.a, c.a + 0.08)) * 40 - seg(p, c.b - 0.05, c.b) * 30}px)`;
    });
    railRefs.current.forEach((el, i) => {
      if (el) el.style.opacity = p >= RAIL_RANGES[i] && p < RAIL_RANGES[i + 1] ? '1' : '0.35';
    });
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    if (endRef.current) endRef.current.style.opacity = String(seg(p, 0.88, 0.97));
    if (logoRef.current) {
      const e = seg(p, 0.84, 0.94);
      logoRef.current.style.opacity = String(e);
      logoRef.current.style.transform = `translate(-50%,-50%) scale(${(1.08 - 0.08 * e).toFixed(3)})`;
    }
    draw(p);
  };

  const pin = () => {
    const root = rootRef.current!;
    const top = root.getBoundingClientRect().top + window.scrollY;
    return { top, len: Math.max(1, root.offsetHeight - window.innerHeight) };
  };
  const inHero = () => {
    if (!rootRef.current) return false;
    const { top, len } = pin();
    return window.scrollY >= top - 2 && window.scrollY <= top + len + 2;
  };

  /** True once every frame between animation positions a and b is loaded. */
  const framesReady = (a: number, b: number) => {
    const S = seq.current;
    if (!S || !S.ok) return false;
    const lo = Math.floor(Math.min(a, b) * (S.N - 1)), hi = Math.ceil(Math.max(a, b) * (S.N - 1));
    for (let i = lo; i <= hi; i++) if (!S.imgs[i]) return false;
    return true;
  };

  /** Plays the sequence to step k, and moves the scroll position with it so the page stays in sync. */
  const goTo = (k: number, moveScroll = true) => {
    const c = ctl.current;
    k = Math.max(0, Math.min(LAST, k));
    const from = c.p, to = STEPS[k];
    c.step = k;
    c.busy = true;
    cancelAnimationFrame(c.raf);
    // On a slow connection, hold the page until this step's frames are in, so it plays smoothly instead of jumping.
    const asked = performance.now();
    const waitThenPlay = () => {
      if (reduced || framesReady(from, to) || performance.now() - asked > WAIT_MS) play(k, from, to, moveScroll);
      else c.raf = requestAnimationFrame(waitThenPlay);
    };
    waitThenPlay();
  };

  const play = (k: number, from: number, to: number, moveScroll: boolean) => {
    const c = ctl.current;
    const { top, len } = pin();
    const sFrom = window.scrollY, sTo = top + (k / LAST) * len;
    const dur = reduced ? 0 : STEP_MS * Math.min(1.5, Math.max(0.75, Math.abs(to - from) / 0.2));
    const t0 = performance.now();
    c.lockUntil = t0 + dur;
    const frame = (now: number) => {
      const t = dur ? Math.min(1, (now - t0) / dur) : 1, e = ease(t);
      c.p = from + (to - from) * e;
      if (moveScroll) window.scrollTo(0, sFrom + (sTo - sFrom) * e);
      apply(c.p);
      if (t < 1) c.raf = requestAnimationFrame(frame);
      else {
        c.busy = false;
        c.raf = 0;
      }
    };
    c.raf = requestAnimationFrame(frame);
  };
  const goToRef = useRef(goTo);
  goToRef.current = goTo;

  useEffect(() => {
    if (reduced) return;
    const c = ctl.current;
    const onWheel = (e: WheelEvent) => {
      if (!loadedRef.current) {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey || inOverlay(e.target) || !inHero()) return;
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      const now = performance.now(), abs = Math.abs(e.deltaY);
      // A new gesture starts after a pause or with a clear jump in speed; anything else is momentum from the last one.
      const fresh = now - c.lastWheel > 180 || abs > c.lastAbs * 1.6 + 4;
      c.lastWheel = now;
      c.lastAbs = abs;
      const next = c.step + dir;
      if (c.busy || now < c.lockUntil || !fresh) {
        e.preventDefault();
        return;
      }
      if (next < 0 || next > LAST) return; // past the last step: scroll on into the page
      e.preventDefault();
      goToRef.current(next);
    };
    const onTouchStart = (e: TouchEvent) => {
      c.touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!loadedRef.current) {
        e.preventDefault();
        return;
      }
      if (inOverlay(e.target) || !inHero()) return;
      const dir = Math.sign(c.touchY - e.touches[0].clientY);
      const next = c.step + dir;
      if (c.busy || (dir && next >= 0 && next <= LAST)) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!loadedRef.current) return;
      if (inOverlay(e.target) || !inHero() || c.busy) return;
      const dy = c.touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 30) return;
      const next = c.step + Math.sign(dy);
      if (next >= 0 && next <= LAST) goToRef.current(next);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!loadedRef.current) {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) e.preventDefault();
        return;
      }
      if (typing(e.target) || inOverlay(e.target) || document.querySelector('[role="dialog"]') || e.altKey || e.ctrlKey || e.metaKey || !inHero()) return;
      const dir = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey) ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey) ? -1 : 0;
      const next = c.step + dir;
      if (!dir || next < 0 || next > LAST) return;
      e.preventDefault();
      if (!c.busy) goToRef.current(next);
    };
    // Capture phase on window runs before page and extension listeners further down, so they can't swallow the gesture.
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
    window.addEventListener('keydown', onKey, { capture: true });
    return () => {
      cancelAnimationFrame(c.raf);
      window.removeEventListener('wheel', onWheel, { capture: true });
      window.removeEventListener('touchstart', onTouchStart, { capture: true });
      window.removeEventListener('touchmove', onTouchMove, { capture: true });
      window.removeEventListener('touchend', onTouchEnd, { capture: true });
      window.removeEventListener('keydown', onKey, { capture: true });
    };
  }, [reduced]);

  // Keeps the step in sync with scrolling we didn't drive (scrollbar, links, restored position), and redraws as frames arrive.
  useScrollTick(() => {
    const root = rootRef.current;
    if (!root) return;
    const c = ctl.current;
    if (reduced) {
      c.p = 0;
      apply(0);
      return;
    }
    if (c.busy) return;
    const k = Math.round(sectionProgress(root) * LAST);
    if (!c.synced) {
      c.synced = true;
      c.step = k;
      c.p = STEPS[k];
    } else if (k !== c.step) {
      goTo(k, false);
      return;
    }
    apply(c.p);
  }, [ready, tick, reduced, mobile]);

  const scrollToFlavours = () => {
    const el = document.getElementById('flavours');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
  };

  return (
    <>
    {!loaderGone && (
      <div
        role="status"
        aria-live="polite"
        aria-label={loaded ? 'Loaded' : `Loading, ${Math.round(progress * 100)}%`}
        style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'grid', placeItems: 'center', background: 'radial-gradient(ellipse 80% 70% at 50% 46%,#8C2A3A 0%,#711D2C 44%,#3A0B14 100%)', color: '#F0EED9', opacity: loaded ? 0 : 1, visibility: loaded ? 'hidden' : 'visible', transition: 'opacity .7s var(--ease), visibility 0s linear .7s' }}
      >
        <div style={{ width: 'min(64vw,340px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <Logo fill="#F0EED9" style={{ width: '62%', animation: 'temFade .8s ease both' }} />
          <div style={{ width: '100%', height: 2, background: 'rgba(240,238,217,.2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#F0EED9', transformOrigin: 'left', transform: `scaleX(${progress})`, transition: 'transform .25s linear' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: '#E5DCC5' }}>
            <span>PREHEATING THE OVEN</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
        </div>
      </div>
    )}
    <section
      ref={rootRef}
      data-dark="1"
      aria-label="TEM Bakehouse — Made for the Moment"
      style={{ position: 'relative', height: reduced ? '100vh' : `${100 + LAST * STEP_VH * 100}vh`, background: '#3A0B14' }}
    >
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: 'radial-gradient(ellipse 80% 70% at 50% 46%,#8C2A3A 0%,#711D2C 44%,#3A0B14 100%)', color: '#F0EED9' }}>
        <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', opacity: 0, transition: 'opacity .6s' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(180deg,rgba(30,6,12,.35) 0%,rgba(30,6,12,0) 22%,rgba(30,6,12,0) 55%,rgba(30,6,12,.55) 100%)' }} />
        <div ref={logoRef} aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '48%', width: 'min(56vw,720px)', transform: 'translate(-50%,-50%)', opacity: 0, zIndex: 2, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 'min(2.2vw,28px)' }}>
          <svg viewBox="465 829 1119 392" fill="#F0EED9" style={{ display: 'block', width: '100%', height: 'auto' }}>
            <polygon points="465,829 794,829 794,909 675,909 675,1221 585,1221 585,909 465,909" />
            <polygon points="852,829 1122,829 1122,909 942,909 942,985 1097,985 1097,1058 942,1058 942,1141 1127,1141 1127,1221 852,1221" />
            <polygon points="1185,829 1283,829 1384,1031 1485,829 1584,829 1584,1221 1494,1221 1494,994 1412,1154 1356,1154 1276,994 1276,1221 1185,1221" />
          </svg>
          {/* Stretched to exactly the width of the TEM wordmark above it. */}
          <svg ref={endRef} viewBox="0 0 1119 150" style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible', opacity: 0 }}>
            <text x="0" y="118" textLength="1119" lengthAdjust="spacingAndGlyphs" fill="#F0EED9" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 150 }}>
              Made for the Moment.
            </text>
          </svg>
        </div>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.22,
            mixBlendMode: 'overlay',
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        <div ref={titleRef} style={{ position: 'absolute', left: 'var(--gutter)', right: 'var(--gutter)', bottom: 'clamp(120px,17vh,180px)', zIndex: 3, willChange: 'transform,opacity' }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.26em', color: '#E5DCC5', marginBottom: 18 }}>
            <span>TEM BAKEHOUSE</span>
            <span style={{ width: 40, height: 1, background: '#C7B593' }} />
            <span>MAURITIUS</span>
          </div>
          <h1 className="display" style={{ fontWeight: 900, fontStretch: '118%', fontSize: 'clamp(44px,min(8.4vw,13vh),150px)', lineHeight: 0.86, textShadow: '0 10px 50px rgba(30,6,12,.45)' }}>
            Break it open.
            <br />
            Share it.
            <br />
            <em>Savour it.</em>
          </h1>
        </div>

        {CAPTIONS.map((c, i) => (
          <div
            key={c.text}
            ref={(el) => {
              capRefs.current[i] = el;
            }}
            style={{
              position: 'absolute',
              left: c.side === 'left' ? 'clamp(16px,5vw,72px)' : 'auto',
              right: c.side === 'right' ? 'clamp(16px,7vw,110px)' : 'auto',
              top: c.top,
              zIndex: 4,
              opacity: 0,
              textAlign: c.side,
              pointerEvents: 'none',
              willChange: 'opacity,transform',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.24em', color: '#E5DCC5', marginBottom: 10 }}>{c.k}</div>
            <div className="display" style={{ fontSize: 'clamp(40px,6.4vw,112px)', color: '#F0EED9', textShadow: '0 8px 40px rgba(30,6,12,.5)' }}>
              {c.text}
            </div>
          </div>
        ))}

        {!mobile && (
          <ol aria-hidden="true" style={{ position: 'absolute', right: 'clamp(16px,3vw,40px)', top: '50%', transform: 'translateY(-50%)', listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14, zIndex: 5, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', color: '#F0EED9', textAlign: 'right' }}>
            {RAIL.map((r, i) => (
              <li
                key={r}
                ref={(el) => {
                  railRefs.current[i] = el;
                }}
                style={{ opacity: i === 0 ? 1 : 0.35, transition: 'opacity .3s' }}
              >
                {r}
              </li>
            ))}
          </ol>
        )}

        <div style={{ position: 'absolute', left: 'var(--gutter)', right: 'var(--gutter)', bottom: 'clamp(24px,5vh,44px)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', zIndex: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', color: '#E5DCC5' }}>
            <span>SCROLL TO BREAK IT</span>
            <span style={{ width: 140, height: 1, background: 'rgba(240,238,217,.25)', position: 'relative', overflow: 'hidden' }}>
              <span ref={barRef} style={{ position: 'absolute', inset: 0, background: '#F0EED9', transformOrigin: 'left', transform: 'scaleX(0)' }} />
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-cream" style={{ padding: '16px 30px', minHeight: 50 }} onClick={() => navigate('/cookies')}>
              Order Now
            </button>
            <button type="button" className="btn btn-ghost-light" style={{ padding: '16px 26px', minHeight: 50 }} onClick={scrollToFlavours}>
              Explore Our Cookies
            </button>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};
