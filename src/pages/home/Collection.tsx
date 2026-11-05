import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageSlot } from '../../components/ImageSlot';
import { Cookie } from '../../components/Cookie';
import { categories } from '../../data/catalog';
import { asset } from '../../lib/assets';
import { useIsMobile, useReducedMotion } from '../../lib/shop';
import { sectionProgress, useScrollTick } from '../../lib/scroll';

const CAT_FLAVOUR: Record<string, string> = { round: 'choco-chips', box: 'pinky', mini: 'pistachio', cups: 'double-choco', cakes: 'red-velvet', sticks: 'plain', shots: 'ferrero' };

export const Collection = () => {
  const navigate = useNavigate();
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const flat = mobile || reduced;
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useScrollTick(() => {
    const c = ref.current, tr = track.current;
    if (!c || !tr) return;
    if (flat) {
      tr.style.transform = 'none';
      tr.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => (card.style.transform = 'none'));
      return;
    }
    const p = sectionProgress(c);
    const last = tr.lastElementChild as HTMLElement | null;
    const pad = parseFloat(getComputedStyle(tr).paddingLeft) || 0;
    const max = last ? Math.max(0, last.offsetLeft + last.offsetWidth + pad - window.innerWidth) : 0;
    tr.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    tr.querySelectorAll<HTMLElement>('[data-card]').forEach((card) => {
      const r = card.getBoundingClientRect();
      const d = (r.left + r.width / 2 - window.innerWidth / 2) / window.innerWidth;
      card.style.transformOrigin = d > 0 ? 'left center' : 'right center';
      card.style.transform = `rotateY(${(-d * 24).toFixed(2)}deg) scale(${(1 - Math.min(0.5, Math.abs(d)) * 0.12).toFixed(3)})`;
    });
  }, [flat]);

  const cardW = mobile ? 'min(78vw, 380px)' : 'max(220px, min(clamp(260px,30vw,440px), calc((100vh - 450px) * 0.75)))';

  return (
    <section ref={ref} aria-label="Our Collection" style={{ position: 'relative', height: flat ? 'auto' : '420vh', background: '#F0EED9' }}>
      <div style={{ position: flat ? 'relative' : 'sticky', top: 0, height: flat ? 'auto' : '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(16px,3.5vh,40px)', padding: flat ? '96px 0' : '88px 0 16px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, flexWrap: 'wrap', padding: '0 var(--gutter)' }}>
          <div>
            <div className="eyebrow">02 — Our Collection</div>
            <h2 className="display" style={{ fontSize: flat ? 'clamp(40px,6vw,96px)' : 'clamp(36px,min(6vw,8vh),96px)' }}>
              Our
              <br />
              <em style={{ color: '#711D2C' }}>Collection.</em>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', color: '#6E5C4D' }}>
            <span>{flat ? 'SWIPE' : 'KEEP SCROLLING'}</span>
            {!flat && (
              <span style={{ width: 120, height: 2, background: '#D9CDB4', position: 'relative', overflow: 'hidden' }}>
                <span ref={bar} style={{ position: 'absolute', inset: 0, background: '#711D2C', transformOrigin: 'left', transform: 'scaleX(0)' }} />
              </span>
            )}
          </div>
        </div>
        <div
          ref={track}
          className="no-scrollbar"
          style={{ display: 'flex', gap: 'clamp(14px,2vw,28px)', padding: '20px var(--gutter)', willChange: 'transform', overflowX: flat ? 'auto' : 'visible', scrollSnapType: 'x mandatory', perspective: 1600, scrollPaddingInline: 'var(--gutter)' }}
        >
          {categories.map((c, i) => (
            <button
              key={c.id}
              type="button"
              data-card="1"
              onClick={() => navigate('/cookies?cat=' + c.id)}
              style={{ all: 'unset', cursor: 'pointer', flex: '0 0 auto', width: cardW, scrollSnapAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, transformStyle: 'preserve-3d', willChange: 'transform' }}
            >
              <ImageSlot
                src={asset.category(c.id)}
                alt={c.name}
                ratio="3 / 4"
                radius={26}
                dark
                fallback={
                  <div style={{ width: '62%', transform: `rotate(${i * 23}deg)` }}>
                    <Cookie flavour={CAT_FLAVOUR[c.id]} />
                  </div>
                }
              >
                <span style={{ position: 'absolute', left: 18, top: 14, fontWeight: 900, fontStretch: '120%', fontSize: `calc(${cardW} * 0.32)`, lineHeight: 0.8, letterSpacing: '-0.05em', color: 'transparent', WebkitTextStroke: '1.5px rgba(240,238,217,.55)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </ImageSlot>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontWeight: 800, fontStretch: '110%', fontSize: 'clamp(22px,2.2vw,32px)', letterSpacing: '-0.02em', textTransform: 'uppercase', color: '#1E1310' }}>{c.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#711D2C', whiteSpace: 'nowrap' }}>View →</span>
              </div>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: '#6E5C4D', maxWidth: '34ch', whiteSpace: 'normal' }}>{c.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
