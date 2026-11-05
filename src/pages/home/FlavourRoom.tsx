import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CookieViewer } from '../../components/CookieViewer';
import { flavourById } from '../../data/catalog';
import { asset } from '../../lib/assets';
import { useProducts } from '../../lib/store';

/** Warm the HTTP cache for the flavour the visitor is most likely to pick next, once the stage is idle. */
const usePrefetchModel = (flavour: string | undefined) => {
  useEffect(() => {
    if (!flavour) return;
    const t = setTimeout(() => {
      const href = asset.model(flavour);
      if (document.head.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
      const l = document.createElement('link');
      l.rel = 'prefetch';
      l.href = href;
      document.head.appendChild(l);
    }, 2500);
    return () => clearTimeout(t);
  }, [flavour]);
};

export const FlavourRoom = () => {
  const navigate = useNavigate();
  const P = useProducts();
  const featured = useMemo(() => P.filter((p) => p.cat === 'round' && p.featured && p.status === 'available'), [P]);
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState(false);
  const fi = featured.length ? ((idx % featured.length) + featured.length) % featured.length : 0;
  const fp = featured[fi];
  const flavour = fp?.flavour ?? 'choco-chips';
  usePrefetchModel(featured.length > 1 ? featured[(fi + 1) % featured.length].flavour : undefined);
  const touch = useMemo(() => window.matchMedia('(hover: none)').matches, []);
  if (!fp) return null;
  const ff = flavourById[fp.flavour];

  const pick = (i: number) => {
    if (i === fi) return;
    setIdx(i);
    setBroken(false);
  };


  return (
    <section id="flavours" aria-label="Featured cookies" style={{ padding: 'clamp(80px,10vw,140px) var(--gutter)', background: '#F0EED9' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
          <div>
            <div className="eyebrow">01 — The Flavour Room</div>
            <h2 className="display" style={{ fontSize: 'clamp(36px,5.2vw,88px)' }}>
              Turn it, break it,
              <br />
              crave it &amp;
              <br />
              <em style={{ color: '#711D2C' }}>pick yours.</em>
            </h2>
          </div>
          <p className="lede" style={{ maxWidth: '34ch' }}>
            A real-time 3D cookie you can turn, inspect and break open. Click a flavour to change it.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', gap: 'clamp(24px,4vw,56px)', alignItems: 'center' }}>
          <div style={{ position: 'relative', aspectRatio: '1 / 1', width: '100%', maxWidth: 'max(320px, calc(100vh - 140px))', justifySelf: 'center', borderRadius: 32, background: 'radial-gradient(ellipse at 50% 40%,#F2EDDC 0%,#E5DCC5 55%,#D3C4A6 100%)', overflow: 'hidden' }}>
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: '-2%', right: '-2%', top: '6%', textAlign: 'center', fontWeight: 900, fontStretch: '125%', fontSize: 'clamp(64px,11vw,190px)', lineHeight: 0.8, letterSpacing: '-0.04em', textTransform: 'uppercase', color: 'transparent', WebkitTextStroke: '1.5px #C7B593', whiteSpace: 'nowrap', overflow: 'hidden' }}
            >
              {ff.name}
            </div>

            {<CookieViewer flavour={flavour} broken={broken} onBreakChange={setBroken} />}

            <div style={{ position: 'absolute', left: 18, top: 16, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.16em', color: '#6E5C4D', pointerEvents: 'none' }}>
              {touch ? 'DRAG TO TURN · TAP “BREAK IT OPEN”' : 'DRAG TO TURN · DOUBLE-CLICK TO BREAK'}
            </div>
            <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button type="button" className="btn btn-dark" style={{ padding: '13px 20px' }} onClick={() => setBroken((b) => !b)}>
                {broken ? 'Put it back' : 'Break it open'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  ['Previous flavour', '←', fi - 1],
                  ['Next flavour', '→', fi + 1],
                ].map(([label, glyph, to]) => (
                  <button
                    key={label as string}
                    type="button"
                    aria-label={label as string}
                    onClick={() => pick(((to as number) + featured.length) % featured.length)}
                    style={{ width: 48, height: 48, borderRadius: 24, border: '1px solid #1E1310', background: 'rgba(240,238,217,.7)', cursor: 'pointer', fontSize: 18, color: '#1E1310' }}
                  >
                    {glyph}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div role="group" aria-label="Choose a flavour" style={{ borderTop: '1px solid #D9CDB4' }}>
              {featured.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={i === fi}
                  onClick={() => pick(i)}
                  className="flavour-row"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    font: 'inherit',
                    display: 'grid',
                    gridTemplateColumns: '34px 1fr auto',
                    alignItems: 'center',
                    gap: 14,
                    padding: `9px 4px 9px ${i === fi ? 18 : 4}px`,
                    borderBottom: '1px solid #D9CDB4',
                    cursor: 'pointer',
                    color: i === fi ? '#711D2C' : '#1E1310',
                    transition: 'color .3s, padding .4s var(--ease)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontWeight: 800, fontStretch: '110%', fontSize: 'clamp(19px,1.9vw,28px)', lineHeight: 1, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{p.name}</span>
                  {p.diet !== 'regular' ? (
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', padding: '4px 8px', borderRadius: 999, background: '#E2EAD6', color: '#3D5226' }}>{p.diet === 'gf' ? 'GF' : 'GF available'}</span>
                  ) : (
                    <span />
                  )}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <span style={{ fontSize: 13, color: '#6E5C4D' }}>
                <strong style={{ color: '#3D5226' }}>GF available</strong> — this flavour can also be made gluten-free.
              </span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/cookies/' + fp.id)}>
                  Order {fp.name}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/cookies/build-box')}>
                  Build a box of 4
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
