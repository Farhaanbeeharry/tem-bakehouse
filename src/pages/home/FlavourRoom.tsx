import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CookieViewer } from '../../components/CookieViewer';
import { flavourById } from '../../data/catalog';
import { asset, probeFile, useImageExists } from '../../lib/assets';
import { fmt, dietLabel } from '../../lib/format';
import { useShop } from '../../lib/shop';
import { useProducts } from '../../lib/store';

type StageMode = 'model' | 'photo' | 'procedural';

const useStageMode = (flavour: string): StageMode | null => {
  const [model, setModel] = useState<{ id: string; ok: boolean } | null>(null);
  const photo = useImageExists(asset.productWhole(flavour));
  useEffect(() => {
    let alive = true;
    probeFile(asset.model(flavour)).then((ok) => alive && setModel({ id: flavour, ok }));
    return () => {
      alive = false;
    };
  }, [flavour]);
  if (!model || model.id !== flavour || photo === null) return null;
  if (model.ok) return 'model';
  return photo ? 'photo' : 'procedural';
};

export const FlavourRoom = () => {
  const navigate = useNavigate();
  const { addLine, showToast } = useShop();
  const P = useProducts();
  const featured = useMemo(() => P.filter((p) => p.cat === 'round' && p.featured && p.status === 'available'), [P]);
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState(false);
  const [spin, setSpin] = useState(0);
  const fi = featured.length ? ((idx % featured.length) + featured.length) % featured.length : 0;
  const fp = featured[fi];
  const flavour = fp?.flavour ?? 'choco-chips';
  const mode = useStageMode(flavour);
  if (!fp) return null;
  const ff = flavourById[fp.flavour];

  const pick = (i: number) => {
    if (i === fi) return;
    setSpin((s) => s + (i > fi ? 120 : -120));
    setIdx(i);
    setBroken(false);
  };

  const use3d = mode !== 'photo';

  return (
    <section id="flavours" aria-label="Featured cookies" style={{ padding: 'clamp(80px,10vw,140px) var(--gutter)', background: '#F0EED9' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
          <div>
            <div className="eyebrow">01 — The Flavour Room</div>
            <h2 className="display" style={{ fontSize: 'clamp(40px,6.4vw,104px)' }}>
              Turn it.
              <br />
              Break it.
              <br />
              <em style={{ color: '#711D2C' }}>Choose it.</em>
            </h2>
          </div>
          <p className="lede" style={{ maxWidth: '34ch' }}>
            A real-time 3D cookie you can turn, inspect and break open. Pick a flavour to change it.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', gap: 'clamp(24px,4vw,56px)', alignItems: 'center' }}>
          <div style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 32, background: 'radial-gradient(ellipse at 50% 40%,#F2EDDC 0%,#E5DCC5 55%,#D3C4A6 100%)', overflow: 'hidden' }}>
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: '-2%', right: '-2%', top: '6%', textAlign: 'center', fontWeight: 900, fontStretch: '125%', fontSize: 'clamp(64px,11vw,190px)', lineHeight: 0.8, letterSpacing: '-0.04em', textTransform: 'uppercase', color: 'transparent', WebkitTextStroke: '1.5px #C7B593', whiteSpace: 'nowrap', overflow: 'hidden' }}
            >
              {ff.name}
            </div>

            {mode === 'photo' && (
              <>
                <img
                  key={'w' + flavour}
                  src={asset.productWhole(flavour)}
                  alt={`${ff.name} cookie`}
                  style={{ position: 'absolute', left: '9%', top: '9%', width: '82%', height: '82%', objectFit: 'contain', opacity: broken ? 0 : 1, transform: `rotate(${spin}deg)`, transition: 'opacity .7s ease, transform 1.1s var(--ease)', filter: 'drop-shadow(0 34px 40px rgba(30,19,16,.35))' }}
                />
                <img
                  key={'b' + flavour}
                  src={asset.productBroken(flavour)}
                  alt={`${ff.name} cookie broken in half`}
                  style={{ position: 'absolute', left: '4%', top: '6%', width: '92%', height: '88%', objectFit: 'contain', opacity: broken ? 1 : 0, transform: `scale(${broken ? 1 : 0.92})`, transition: 'opacity .7s ease, transform 1.1s var(--ease)', filter: 'drop-shadow(0 34px 40px rgba(30,19,16,.35))' }}
                />
              </>
            )}
            {use3d && <CookieViewer flavour={flavour} broken={broken} onBreakChange={setBroken} />}

            <div style={{ position: 'absolute', left: 18, top: 16, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.16em', color: '#6E5C4D', pointerEvents: 'none' }}>
              {mode === 'photo' ? 'PHOTOGRAPHED · TAP “BREAK IT OPEN”' : mode ? 'DRAG TO TURN · DOUBLE-CLICK TO BREAK' : ''}
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
            <div role="list" style={{ borderTop: '1px solid #D9CDB4' }}>
              {featured.map((p, i) => (
                <div
                  key={p.id}
                  role="listitem"
                  onMouseEnter={() => pick(i)}
                  onClick={() => pick(i)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto',
                    alignItems: 'center',
                    gap: 16,
                    padding: `14px 4px 14px ${i === fi ? 18 : 4}px`,
                    borderBottom: '1px solid #D9CDB4',
                    cursor: 'pointer',
                    color: i === fi ? '#711D2C' : '#1E1310',
                    transition: 'color .3s, padding .4s var(--ease)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontWeight: 800, fontStretch: '110%', fontSize: 'clamp(22px,2.4vw,34px)', lineHeight: 1, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{p.diet === 'both' ? 'GF available' : p.diet === 'gf' ? 'GF' : ''}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: '#6E5C4D', maxWidth: '46ch' }}>{fp.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em' }}>{fmt(fp.price)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '6px 10px', borderRadius: 999, background: '#E5DCC5' }}>{dietLabel(fp.diet)}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    addLine(fp, { pack: 'p1', qty: 1 });
                    showToast(fp.name + ' added to your order request');
                  }}
                >
                  Add single to request
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/cookies/' + fp.id)}>
                  Details &amp; pack sizes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
