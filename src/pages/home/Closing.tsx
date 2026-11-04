import { useRef, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageSlot } from '../../components/ImageSlot';
import { Cookie } from '../../components/Cookie';
import { Logo } from '../../components/Logo';
import { asset } from '../../lib/assets';
import { instagramLabel, instagramUrl } from '../../data/site';
import { useIsMobile, useReducedMotion } from '../../lib/shop';
import { clamp01, sectionProgress, seg, useScrollTick } from '../../lib/scroll';

const MOMENTS = [
  { id: 'birthday', title: 'Birthdays', text: 'A cookie cake with their name on it.', to: '/cookies?cat=cakes', flavour: 'red-velvet' },
  { id: 'gift', title: 'Gifts', text: 'A box of six says thank you.', to: '/cookies?cat=round', flavour: 'ferrero' },
  { id: 'gathering', title: 'Gatherings', text: 'Mini cookies and shots for the table.', to: '/cookies?cat=mini', flavour: 'pistachio' },
  { id: 'treat', title: 'Just because', text: 'One cookie, on an ordinary Tuesday.', to: '/cookies', flavour: 'choco-chips' },
];

export const Moments = () => {
  const navigate = useNavigate();
  const mobile = useIsMobile();
  const tilt = (e: MouseEvent<HTMLButtonElement>, on: boolean) => {
    const el = e.currentTarget;
    if (!on || mobile) {
      el.style.transform = '';
      return;
    }
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 12).toFixed(2)}deg) translateZ(10px)`;
  };
  return (
    <section aria-label="Made for every moment" style={{ padding: 'clamp(80px,10vw,140px) var(--gutter)', background: '#F0EED9' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
          <div>
            <div className="eyebrow">04 — Made for every moment</div>
            <h2 className="display" style={{ fontSize: 'clamp(40px,6vw,96px)' }}>
              What&apos;s the
              <br />
              <em style={{ color: '#711D2C' }}>moment?</em>
            </h2>
          </div>
          <p className="lede" style={{ fontSize: 14 }}>
            Ideas for using the menu. These are not fixed packages.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 18, perspective: 1200 }}>
          {MOMENTS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => navigate(m.to)}
              onMouseMove={(e) => tilt(e, true)}
              onMouseLeave={(e) => tilt(e, false)}
              style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14, transformStyle: 'preserve-3d', transition: 'transform .5s var(--ease)' }}
            >
              <ImageSlot
                src={asset.moment(m.id)}
                alt={m.title}
                fallback={
                  <div style={{ width: '56%' }}>
                    <Cookie flavour={m.flavour} />
                  </div>
                }
              >
                <span style={{ position: 'absolute', left: 16, bottom: 26, fontWeight: 900, fontStretch: '120%', fontSize: 64, lineHeight: 0.8, color: '#711D2C', transform: 'translateZ(40px)', textShadow: '0 2px 12px rgba(240,238,217,.5)' }}>
                  {m.title[0]}
                </span>
              </ImageSlot>
              <span style={{ fontWeight: 800, fontStretch: '110%', fontSize: 26, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{m.title}</span>
              <span style={{ fontSize: 14, color: '#6E5C4D' }}>{m.text}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

const COLS: { par: number; mt: string; tiles: [string, string, string][] }[] = [
  {
    par: 0.12,
    mt: '-8%',
    tiles: [
      ['3/4', asset.heroFrame('mobile', 1), 'Macro of a TEM Choco Chips cookie'],
      ['1/1', asset.category('round'), 'A stack of TEM round cookies'],
      ['4/5', asset.moment('treat'), 'A cookie and a coffee by the window'],
      ['1/1', asset.heroFrame('desktop', 96), 'Cookie breaking apart'],
      ['3/4', asset.category('cups'), 'Cookie cups filled with ganache'],
    ],
  },
  {
    par: -0.1,
    mt: '-30%',
    tiles: [
      ['4/5', asset.category('cakes'), 'A cookie cake with buttercream swirls'],
      ['3/4', asset.heroFrame('mobile', 95), 'Cookie halves with melted chocolate'],
      ['1/1', asset.moment('gift'), 'A gift box of six cookies'],
      ['4/5', asset.category('mini'), 'A box of mini cookies'],
      ['3/4', asset.heroFrame('mobile', 50), 'Whole Choco Chips cookie'],
    ],
  },
  {
    par: 0.18,
    mt: '-16%',
    tiles: [
      ['1/1', asset.heroFrame('desktop', 1), 'Chocolate chips close-up'],
      ['3/4', asset.category('sticks'), 'Cookie sticks dipped in chocolate'],
      ['4/5', asset.moment('birthday'), 'A birthday cookie cake'],
      ['3/4', asset.category('shots'), 'Cookie shots filled with milk'],
      ['1/1', asset.moment('gathering'), 'Mini cookies shared at the table'],
    ],
  },
];

export const InstaStrip = () => {
  const reduced = useReducedMotion();
  const cols = useRef<(HTMLDivElement | null)[]>([]);
  useScrollTick(() => {
    cols.current.forEach((el, i) => {
      if (!el?.parentElement) return;
      const r = el.parentElement.getBoundingClientRect();
      const d = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = reduced ? 'none' : `translate3d(0,${(d * COLS[i].par).toFixed(1)}px,0)`;
    });
  }, [reduced]);
  return (
    <section data-dark="1" aria-label="Gallery" style={{ padding: 'clamp(80px,10vw,140px) var(--gutter)', background: '#1E1310', color: '#F0EED9', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 48 }}>
          <div>
            <div className="eyebrow" style={{ color: '#C7B593' }}>
              05 — From the bakehouse
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(40px,6vw,96px)' }}>
              Fresh on
              <br />
              <em style={{ color: '#E5DCC5' }}>Instagram.</em>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/gallery" className="btn" style={{ border: '1px solid #F0EED9', color: '#F0EED9', fontWeight: 600, fontSize: 14 }}>
              Open gallery
            </Link>
            <a href={instagramUrl()} target="_blank" rel="noopener" className="btn btn-primary" style={{ fontSize: 14 }}>
              {instagramLabel()}
            </a>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 'clamp(8px,1.4vw,18px)', height: 'clamp(420px,70vw,820px)', overflow: 'hidden' }}>
          {COLS.map((c, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div
                ref={(el) => {
                  cols.current[i] = el;
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px,1.4vw,18px)', willChange: 'transform', marginTop: c.mt }}
              >
                {c.tiles.map(([ratio, src, alt], k) => (
                  <div key={k} style={{ aspectRatio: ratio, borderRadius: 18, overflow: 'hidden', background: '#3B2519' }}>
                    <img src={src} alt={alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const FinalCta = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const mobile = useIsMobile(820);
  const ref = useRef<HTMLElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  useScrollTick(() => {
    if (!ref.current) return;
    const p = reduced ? 1 : sectionProgress(ref.current);
    const e = 1 - Math.pow(1 - clamp01(p * 1.7), 3);
    if (logo.current) {
      logo.current.style.transform = `scale(${(3.4 - 2.4 * e).toFixed(3)})`;
      logo.current.style.opacity = String(clamp01(0.15 + e));
    }
    if (cta.current) {
      const k = reduced ? 1 : seg(p, 0.4, 0.65);
      cta.current.style.opacity = String(k);
      cta.current.style.transform = `translateY(${(1 - k) * 30}px)`;
    }
  }, [reduced]);
  return (
    <section ref={ref} data-dark="1" aria-label="Order now" style={{ position: 'relative', height: reduced ? 'auto' : '220vh', background: '#711D2C', color: '#F0EED9' }}>
      <div style={{ position: reduced ? 'relative' : 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(28px,5vh,48px)', padding: '0 20px' }}>
        <img src={mobile ? asset.heroFrame('mobile', 180) : asset.heroFrame('desktop', 240)} alt="" aria-hidden="true" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%,rgba(113,29,44,0) 0%,rgba(58,11,20,.55) 100%)', pointerEvents: 'none' }} />
        <div ref={logo} style={{ position: 'relative', width: 'min(78vw,980px)', willChange: 'transform', transformOrigin: '50% 50%' }}>
          <Logo style={{ width: '100%' }} />
        </div>
        <div ref={cta} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, textAlign: 'center' }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(28px,3.4vw,50px)', lineHeight: 1 }}>Your moment starts here.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" className="btn btn-cream" style={{ padding: '18px 34px', minHeight: 54, fontSize: 16 }} onClick={() => navigate('/cookies')}>
              Start an order request
            </button>
            <button type="button" className="btn btn-ghost-light" style={{ padding: '18px 28px', minHeight: 54, fontSize: 16 }} onClick={() => navigate('/how-to-order')}>
              How ordering works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
