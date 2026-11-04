import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Cookie } from '../components/Cookie';
import { ProductCard } from '../components/ProductCard';
import { categories, flavourById, flavours } from '../data/catalog';
import { asset, useImageExists } from '../lib/assets';
import { fmt } from '../lib/format';
import { useShop } from '../lib/shop';
import { useProducts } from '../lib/store';
import { NotFoundPage } from './NotFoundPage';

type View = 'whole' | 'broken' | 'crumb';

const Thumb = ({ src, label, on, onPick }: { src: string; label: string; on: boolean; onPick: () => void }) => {
  const ok = useImageExists(src);
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={!ok}
      aria-label={`Show ${label}`}
      aria-pressed={on}
      className={ok ? undefined : 'striped'}
      style={{ aspectRatio: '4 / 5', borderRadius: 16, border: `1.5px solid ${on ? '#711D2C' : 'transparent'}`, background: ok ? '#E5DCC5' : undefined, display: 'grid', placeItems: 'center', padding: 6, cursor: ok ? 'pointer' : 'default', overflow: 'hidden' }}
    >
      {ok ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#6E5C4D', textAlign: 'center' }}>detail · {label}</span>
      )}
    </button>
  );
};

export const ProductPage = () => {
  const { id } = useParams();
  const P = useProducts();
  const p = P.find((x) => x.id === id);
  if (!p) return <NotFoundPage />;
  return <ProductDetail key={p.id} id={p.id} />;
};

const ProductDetail = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const P = useProducts();
  const { addLine, setDrawerOpen, favs, toggleFav } = useShop();
  const p = P.find((x) => x.id === id)!;
  const [pd, setPd] = useState({ pack: p.packs[0].id, qty: 1, diet: (p.diet === 'gf' ? 'gf' : 'regular') as 'regular' | 'gf', flavour: p.flavour, occasion: '', message: '', instructions: '' });
  const [view, setView] = useState<View>('whole');
  const f = flavourById[pd.flavour];
  const soon = p.status !== 'available';
  const fav = favs.includes(p.id);
  const pk = p.packs.find((k) => k.id === pd.pack) ?? p.packs[0];
  const cat = categories.find((c) => c.id === p.cat)!;
  const recs = P.filter((x) => x.id !== p.id && x.status === 'available' && (x.cat !== p.cat || x.featured)).slice(0, 4);
  const set = (o: Partial<typeof pd>) => setPd((x) => ({ ...x, ...o }));
  const mainSrc = view === 'broken' ? asset.productBroken(f.id) : asset.productCrumb(f.id);

  const add = () => {
    if (soon) return;
    addLine(p, { pack: pk.id, qty: pd.qty, diet: pd.diet, flavour: pd.flavour, custom: p.custom ? { occasion: pd.occasion, message: pd.message, instructions: pd.instructions } : null });
    setDrawerOpen(true);
  };

  return (
    <main className="page" style={{ paddingTop: 'clamp(96px,10vw,120px)' }}>
      <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 8, fontSize: 13, color: '#6E5C4D', marginBottom: 24, flexWrap: 'wrap' }}>
        <Link to="/cookies" style={{ color: 'inherit' }}>
          Our Cookies
        </Link>
        <span>/</span>
        <Link to={'/cookies?cat=' + p.cat} style={{ color: 'inherit' }}>
          {cat.name}
        </Link>
        <span>/</span>
        <span style={{ color: '#1E1310' }} aria-current="page">
          {p.name}
        </span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 'clamp(28px,5vw,80px)', alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 28, background: '#E5DCC5', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            {view === 'whole' ? (
              <div key={f.id} style={{ width: '74%', transform: `rotate(${flavours.indexOf(f) * 40}deg)`, transition: 'transform 1s var(--ease)', animation: 'temFade .5s ease both' }}>
                <Cookie flavour={f.id} />
              </div>
            ) : (
              <img src={mainSrc} alt={`${f.name} ${view}`} style={{ width: view === 'crumb' ? '100%' : '88%', height: view === 'crumb' ? '100%' : '88%', objectFit: view === 'crumb' ? 'cover' : 'contain', animation: 'temFade .5s ease both' }} />
            )}
            {soon && (
              <div style={{ position: 'absolute', left: 18, bottom: 16, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6E5C4D' }}>PROVISIONAL VISUAL · awaiting product photo</div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <Thumb src={asset.productWhole(f.id)} label="whole" on={view === 'whole'} onPick={() => setView('whole')} />
            <Thumb src={asset.productBroken(f.id)} label="break" on={view === 'broken'} onPick={() => setView('broken')} />
            <Thumb src={asset.productCrumb(f.id)} label="inside" on={view === 'crumb'} onPick={() => setView('crumb')} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '.2em', color: '#711D2C' }}>
              {cat.name}
            </span>
            <h1 className="h-page" style={{ fontSize: 'clamp(33px,3.8vw,61px)', lineHeight: 0.9 }}>
              {p.name}
            </h1>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#6E5C4D', maxWidth: '48ch' }}>{p.desc}</p>
            <span className="h-card" style={{ fontSize: 25.6 }}>
              {fmt(p.price * pk.mult * pd.qty)}
            </span>
          </div>

          {soon && (
            <div style={{ padding: 20, borderRadius: 18, background: '#1E1310', color: '#F0EED9', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <strong className="h-card" style={{ fontSize: 17.9 }}>
                Coming soon
              </strong>
              <span style={{ fontSize: 14, color: '#E5DCC5' }}>This flavour isn&apos;t available to order yet. Save it to your favourites and check back.</span>
            </div>
          )}

          <fieldset style={{ border: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <legend style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Version</legend>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(
                [
                  ['regular', 'Regular'],
                  ['gf', 'Gluten-free'],
                ] as const
              ).map(([d, label]) => {
                const avail = p.diet === 'both' || p.diet === d;
                return (
                  <button key={d} type="button" disabled={!avail} className={`choice solid ${pd.diet === d ? 'on' : ''}`} onClick={() => set({ diet: d })}>
                    {avail ? label : label + ' — not available'}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 12, color: '#6E5C4D' }}>
              {p.diet === 'both' ? 'Available in both versions. Choose one per line.' : p.diet === 'gf' ? 'Gluten-free only.' : 'Regular only — no gluten-free version for this item.'}
            </span>
          </fieldset>

          {p.flavourPick && (
            <label className="field">
              Flavour
              <select className="input" value={pd.flavour} onChange={(e) => set({ flavour: e.target.value })}>
                {flavours.map((o) => (
                  <option key={o.id} value={o.id} disabled={o.status !== 'available'}>
                    {o.name + (o.status === 'soon' ? ' (coming soon)' : '')}
                  </option>
                ))}
              </select>
            </label>
          )}

          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Pack size</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8 }}>
              {p.packs.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className={`choice ${k.id === pk.id ? 'on' : ''}`}
                  aria-pressed={k.id === pk.id}
                  onClick={() => set({ pack: k.id })}
                  style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 64, background: k.id === pk.id ? '#F2E3DF' : '#F8F6EC' }}
                >
                  <strong style={{ fontSize: 14 }}>{k.label}</strong>
                  <span style={{ fontSize: 13, color: '#6E5C4D', fontWeight: 400 }}>{fmt(p.price * k.mult)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {p.custom && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20, borderRadius: 18, background: '#F8F6EC', border: '1px solid #D9CDB4' }}>
              <strong className="h-card" style={{ fontSize: 16.6 }}>
                Personalise it
              </strong>
              <label className="field">
                Occasion
                <select className="input alt" value={pd.occasion} onChange={(e) => set({ occasion: e.target.value })}>
                  <option value="">Choose…</option>
                  {['Birthday', 'Anniversary', 'Congratulations', 'Thank you', 'Other'].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>
                  Message on the cookie <span className="hint">{pd.message.length}/40</span>
                </span>
                <input className="input alt" maxLength={40} value={pd.message} onChange={(e) => set({ message: e.target.value })} placeholder="e.g. Happy 30th, Sam" />
              </label>
              <label className="field">
                Special instructions
                <textarea className="input alt" rows={3} value={pd.instructions} onChange={(e) => set({ instructions: e.target.value })} placeholder="Colours, theme, anything TEM should know" />
              </label>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="qty">
              <button type="button" aria-label="Decrease quantity" onClick={() => set({ qty: Math.max(1, pd.qty - 1) })}>
                −
              </button>
              <span aria-live="polite">{pd.qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => set({ qty: Math.min(20, pd.qty + 1) })}>
                +
              </button>
            </div>
            <button type="button" className="btn btn-primary" disabled={soon} onClick={add} style={{ flex: '1 1 220px', height: 52 }}>
              {soon ? 'Coming soon' : 'Add to Order Request'}
            </button>
            <button
              type="button"
              onClick={() => toggleFav(p.id)}
              aria-label={fav ? 'Remove from favourites' : 'Save to favourites'}
              aria-pressed={fav}
              style={{ width: 52, height: 52, borderRadius: 26, border: '1px solid #1E1310', background: 'transparent', color: '#711D2C', fontSize: 20, cursor: 'pointer' }}
            >
              {fav ? '♥' : '♡'}
            </button>
          </div>

          <div style={{ borderTop: '1px solid #D9CDB4' }}>
            <details className="faq">
              <summary>Ingredients &amp; allergens</summary>
              <p>Ingredient and allergen information will be supplied by TEM Bakehouse. If you have an allergy, contact TEM before submitting your request.</p>
            </details>
            <details className="faq">
              <summary>Gluten-free version</summary>
              <p>Availability is set per product by TEM Bakehouse. Preparation details for gluten-free products will be added once confirmed.</p>
            </details>
            <details className="faq">
              <summary>Collection &amp; ordering</summary>
              <p>Collection only for now. Adding this to your request doesn&apos;t confirm an order — TEM reviews every request and asks for a 50% deposit once accepted.</p>
            </details>
          </div>
        </div>
      </div>

      <section aria-label="Goes well with" style={{ marginTop: 96 }}>
        <h2 className="h-card" style={{ fontSize: 28.2, marginBottom: 24 }}>
          Goes well with
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,220px),1fr))', gap: 20 }}>
          {recs.map((x) => (
            <ProductCard key={x.id} p={x} />
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/cookies')}>
            ← Back to all cookies
          </button>
        </div>
      </section>
    </main>
  );
};
