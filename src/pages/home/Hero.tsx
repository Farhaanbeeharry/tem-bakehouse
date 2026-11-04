import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { asset } from '../../lib/assets';
import { useIsMobile, useReducedMotion } from '../../lib/shop';
import { sectionProgress, seg, useScrollTick } from '../../lib/scroll';

const CAPTIONS = [
  { k: '02 / THE BREAK', text: 'Break it open.', a: 0.3, b: 0.5, side: 'left' as const, top: '16%' },
  { k: '03 / INSIDE', text: 'Share it.', a: 0.5, b: 0.68, side: 'right' as const, top: '62%' },
  { k: '03 / INSIDE', text: 'Keep it.', a: 0.68, b: 0.84, side: 'left' as const, top: '64%' },
];
const RAIL = ['01 SURFACE', '02 THE BREAK', '03 INSIDE', '04 TEM'];
const RAIL_RANGES = [0, 0.3, 0.62, 0.86, 1.01];

type Seq = { N: number; imgs: (HTMLImageElement | undefined)[]; ok: boolean };

export const Hero = () => {
  const navigate = useNavigate();
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLLIElement | null)[]>([]);
  const seq = useRef<Seq | null>(null);
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const portrait = window.innerWidth < 820 || window.innerHeight > window.innerWidth;
    const device = portrait ? 'mobile' : 'desktop';
    const N = portrait ? 180 : 240;
    const S: Seq = { N, imgs: new Array(N), ok: false };
    seq.current = S;
    let alive = true;
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
        im.src = asset.heroFrame(device, i + 1);
      });
    load(0).then(async (ok) => {
      if (!alive || !ok) return;
      S.ok = true;
      setReady(true);
      const order: number[] = [];
      [32, 16, 8, 4, 2, 1].forEach((step) => {
        for (let i = 0; i < N; i += step) if (!order.includes(i)) order.push(i);
      });
      for (let k = 0; k < order.length && alive; k += 6) {
        await Promise.all(order.slice(k, k + 6).map(load));
        if (alive) setTick((t) => t + 1);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

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

  useScrollTick(() => {
    const root = rootRef.current;
    if (!root) return;
    const p = reduced ? 0 : sectionProgress(root);
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
  }, [ready, tick, reduced, mobile]);

  const scrollToFlavours = () => {
    const el = document.getElementById('flavours');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
  };

  return (
    <section
      ref={rootRef}
      data-dark="1"
      aria-label="TEM Bakehouse — Made for the Moment"
      style={{ position: 'relative', height: reduced ? '100vh' : mobile ? '440vh' : '560vh', background: '#3A0B14' }}
    >
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: 'radial-gradient(ellipse 80% 70% at 50% 46%,#8C2A3A 0%,#711D2C 44%,#3A0B14 100%)', color: '#F0EED9' }}>
        <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', opacity: 0, transition: 'opacity .6s' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(180deg,rgba(30,6,12,.35) 0%,rgba(30,6,12,0) 22%,rgba(30,6,12,0) 55%,rgba(30,6,12,.55) 100%)' }} />
        <svg ref={logoRef} viewBox="465 829 1119 392" fill="#F0EED9" aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '46%', width: 'min(56vw,720px)', height: 'auto', transform: 'translate(-50%,-50%)', opacity: 0, zIndex: 2, pointerEvents: 'none' }}>
          <polygon points="465,829 794,829 794,909 675,909 675,1221 585,1221 585,909 465,909" />
          <polygon points="852,829 1122,829 1122,909 942,909 942,985 1097,985 1097,1058 942,1058 942,1141 1127,1141 1127,1221 852,1221" />
          <polygon points="1185,829 1283,829 1384,1031 1485,829 1584,829 1584,1221 1494,1221 1494,994 1412,1154 1356,1154 1276,994 1276,1221 1185,1221" />
        </svg>
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
        {!ready && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: '#C7B593' }}>
            <span style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(240,238,217,.25)', borderTopColor: '#F0EED9', animation: 'temSpin 1s linear infinite' }} />
            PREHEATING THE OVEN
          </div>
        )}

        <div ref={titleRef} style={{ position: 'absolute', left: 'var(--gutter)', right: 'var(--gutter)', bottom: 'clamp(120px,17vh,180px)', zIndex: 3, willChange: 'transform,opacity' }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.26em', color: '#E5DCC5', marginBottom: 18 }}>
            <span>TEM BAKEHOUSE</span>
            <span style={{ width: 40, height: 1, background: '#C7B593' }} />
            <span>MAURITIUS</span>
          </div>
          <h1 className="display" style={{ fontWeight: 900, fontStretch: '118%', fontSize: 'clamp(52px,10.4vw,188px)', lineHeight: 0.82, textShadow: '0 10px 50px rgba(30,6,12,.45)' }}>
            Made for
            <br />
            the <em>moment.</em>
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

        <div ref={endRef} style={{ position: 'absolute', left: 0, right: 0, bottom: 'clamp(110px,18vh,190px)', textAlign: 'center', zIndex: 4, opacity: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(26px,3.2vw,46px)', color: '#F0EED9', pointerEvents: 'none' }}>
          Made for the Moment.
        </div>

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
  );
};
