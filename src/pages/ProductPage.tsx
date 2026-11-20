import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BoxVisual, SAMPLE_BOX } from '../components/BoxVisual';
import { Cookie } from '../components/Cookie';
import { ProductCard } from '../components/ProductCard';
import { useProductPhoto } from '../components/ProductVisual';
import { FILLINGS, PACKAGING_NOTE, categories, flavourById, flavours, packPrice, productFlavours, unitPrice } from '../data/catalog';
import { asset, useImageExists } from '../lib/assets';
import { fmt } from '../lib/format';
import { useShop } from '../lib/shop';
import { cookiePriceFrom, useProducts } from '../lib/store';
import { NotFoundPage } from './NotFoundPage';

type View = 'shape' | 'whole' | 'broken' | 'crumb';

const Thumb = ({ label, on, onPick, children }: { label: string; on: boolean; onPick: () => void; children: ReactNode }) => (
  <button
    type="button"
    onClick={onPick}
    aria-label={`Show ${label}`}
    aria-pressed={on}
    style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 16, border: `1.5px solid ${on ? '#711D2C' : 'transparent'}`, background: '#E5DCC5', display: 'grid', placeItems: 'center', padding: 0, cursor: 'pointer', overflow: 'hidden' }}
  >
    {children}
  </button>
);

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
  const [pd, setPd] = useState({ pack: p.packs[0].id, qty: 1, diet: (p.diet === 'gf' ? 'gf' : 'regular') as 'regular' | 'gf', flavour: p.flavour, occasion: '', message: '', instructions: '', filling: '', dip: '', style: '', box: [] as string[] });
  const [picked, setView] = useState<View | null>(null);
  const f = flavourById[pd.flavour];
  const photo = useProductPhoto(p.id);
  const brokenSrc = f.photoBroken ?? asset.productBroken(f.id);
  const brokenOk = useImageExists(brokenSrc);
  const crumbOk = useImageExists(asset.productCrumb(f.id));
  // A shaped product with its own photo shows just that photo, no cookie thumbnails underneath.
  const views: View[] = photo ? ['shape'] : ['whole', ...(brokenOk ? (['broken'] as const) : []), ...(crumbOk ? (['crumb'] as const) : [])];
  const view: View = picked && views.includes(picked) ? picked : views[0];
  const soon = p.status !== 'available';
  const fav = favs.includes(p.id);
  const pk = p.packs.find((k) => k.id === pd.pack) ?? p.packs[0];
  const cat = categories.find((c) => c.id === p.cat)!;
  const recs = P.filter((x) => x.id !== p.id && !x.hidden && x.status === 'available' && (x.cat !== p.cat || x.featured)).slice(0, 4);
  const set = (o: Partial<typeof pd>) => setPd((x) => ({ ...x, ...o }));
  const cookiePrice = cookiePriceFrom(P);
  // With Gluten-free chosen, only flavours that come in a GF version can be picked.
  const dietFlavours = (diet: 'regular' | 'gf') => productFlavours(p).filter((o) => diet === 'regular' || o.diet !== 'regular');
  const boxFlavours = dietFlavours(pd.diet);
  const gfNames = productFlavours(p).filter((o) => o.diet !== 'regular').map((o) => o.name);
  const pickN = pk.pick ?? 0;
  const boxLeft = p.boxOf ? p.boxOf - pd.box.length : 0;
  const pickLeft = pickN ? pickN - pd.box.length : 0;
  const fillingOptions = p.fillings ? FILLINGS.filter((x) => f.fillings.includes(x.name)) : [];
  const filling = fillingOptions.some((x) => x.name === pd.filling) ? pd.filling : '';
  const needsStyle = !!p.styles && !pd.style;
  const needsDip = !!p.dipChoice && !pd.dip;
  const blocked = soon || boxLeft > 0 || pickLeft > 0 || needsStyle || needsDip;
  const unit = unitPrice(p, pk, { filling, dip: pd.dip, box: pd.box }, cookiePrice);
  const ingredients = p.cat === 'round' ? f.ingredients : (p.ingredients ?? f.ingredients);
  const pickWord = ['', 'one', 'two', 'three', 'four', 'five'][pickN] ?? String(pickN);
  const setDiet = (diet: 'regular' | 'gf') => {
    const ok = dietFlavours(diet);
    set({
      diet,
      box: pd.box.filter((id) => ok.some((o) => o.id === id)),
      flavour: p.flavourPick && !ok.some((o) => o.id === pd.flavour) ? (ok[0]?.id ?? pd.flavour) : pd.flavour,
    });
  };
  const setPack = (id: string) => {
    const n = p.packs.find((k) => k.id === id)?.pick;
    set({ pack: id, ...(n != null ? { box: pd.box.slice(0, n) } : null) });
  };
  const togglePick = (id: string) => set({ box: pd.box.includes(id) ? pd.box.filter((x) => x !== id) : pickLeft > 0 ? [...pd.box, id] : pd.box });
  const boxAdd = (id: string) => boxLeft > 0 && set({ box: [...pd.box, id] });
  const boxRemove = (id: string) => {
    const i = pd.box.lastIndexOf(id);
    if (i >= 0) set({ box: pd.box.filter((_, k) => k !== i) });
  };

  const add = () => {
    if (blocked) return;
    const picks = p.boxOf || pickN;
    addLine(p, {
      pack: pk.id,
      qty: pd.qty,
      diet: pd.diet,
      flavour: picks ? pd.box[0] : pd.flavour,
      custom: p.custom ? { occasion: pd.occasion, message: pd.message, instructions: pd.instructions } : null,
      filling: p.fixedFilling ?? (filling || undefined),
      dip: pd.dip || undefined,
      style: pd.style || undefined,
      ...(picks ? { box: [...pd.box] } : null),
      unit,
    });
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
            {(p.boxOf || p.contents) && (pd.box.length > 0 || !photo) ? (
              <div style={{ position: 'absolute', inset: 0 }}>
                <BoxVisual
                  background="#E5DCC5"
                  slots={p.contents ?? (pd.box.length ? Array.from({ length: p.boxOf! }, (_, i) => pd.box[i]) : p.boxOf === 2 ? ['choco-chips', 'choco-chips'] : SAMPLE_BOX)}
                  label={pd.box.length ? `Your box: ${pd.box.length} of ${p.boxOf} chosen` : p.name}
                />
              </div>
            ) : view === 'shape' && photo ? (
              <img key="shape" src={photo} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'temFade .5s ease both' }} />
            ) : view === 'whole' && (
              <div key={f.id} style={{ width: '74%', transform: `rotate(${flavours.indexOf(f) * 40}deg)`, transition: 'transform 1s var(--ease)', animation: 'temFade .5s ease both' }}>
                <Cookie flavour={f.id} />
              </div>
            )}
            {view === 'broken' && <img key="broken" src={brokenSrc} alt={`${f.name} broken in half`} style={{ width: '88%', height: '88%', objectFit: 'contain', animation: 'temFade .5s ease both' }} />}
            {view === 'crumb' && <img key="crumb" src={asset.productCrumb(f.id)} alt={`Inside a ${f.name} cookie`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'temFade .5s ease both' }} />}
          </div>
          {!p.boxOf && !p.contents && views.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(3, views.length)},1fr)`, gap: 12 }}>
              {views.map((v) => (
                <Thumb key={v} label={v === 'whole' ? `${f.name} cookie` : v === 'broken' ? 'the break' : 'the inside'} on={view === v} onPick={() => setView(v)}>
                  {v === 'whole' && (
                    <div style={{ width: '78%' }}>
                      <Cookie flavour={f.id} flat />
                    </div>
                  )}
                  {v === 'broken' && <img src={brokenSrc} alt="" style={{ width: '92%', height: '92%', objectFit: 'contain' }} />}
                  {v === 'crumb' && <img src={asset.productCrumb(f.id)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                </Thumb>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '.2em', color: '#711D2C' }}>
              {cat.name}
            </span>
            <h1 className="h-page" style={{ fontSize: 'clamp(33px,3.8vw,61px)', lineHeight: 0.9 }}>
              {p.name}
            </h1>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#6E5C4D', maxWidth: '48ch' }}>
              {p.desc}
              {pickN > 0 && ` Choose ${pickWord} flavours per box.`}
            </p>
            <span className="h-card" style={{ fontSize: 25.6 }}>
              {soon ? 'Price to be announced' : fmt(unit * pd.qty)}
            </span>
            {p.boxFee != null && !soon && (
              <span style={{ fontSize: 13, color: '#6E5C4D' }}>
                {fmt(p.boxFee)} for the box, plus each cookie at its round-cookie price{boxLeft > 0 ? `. ${boxLeft} still to pick.` : '.'}
              </span>
            )}
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
                  <button key={d} type="button" disabled={!avail} className={`choice solid ${pd.diet === d ? 'on' : ''}`} onClick={() => setDiet(d)}>
                    {avail ? label : label + ' — not available'}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 12, color: '#6E5C4D' }}>
              {(p.boxOf || pickN) && p.diet !== 'regular'
                ? `A gluten-free box can include ${gfNames.join(', ')}.`
                : p.diet === 'both'
                  ? 'Available in both versions. Choose one per line.'
                  : p.diet === 'gf'
                    ? 'Gluten-free only.'
                    : 'Regular only — no gluten-free version for this item.'}
            </span>
          </fieldset>

          {p.flavourPick && (
            <label className="field">
              Flavour
              <select className="input" value={pd.flavour} onChange={(e) => set({ flavour: e.target.value })}>
                {dietFlavours(pd.diet).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {p.boxOf && (
            <fieldset style={{ border: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <legend style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', gap: 10 }}>
                Choose {p.boxOf} cookies
                <span aria-live="polite" style={{ fontWeight: 500, color: boxLeft ? '#711D2C' : '#3D5226' }}>
                  {boxLeft ? `${boxLeft} left to pick` : 'Box complete'}
                </span>
              </legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,230px),1fr))', gap: 8 }}>
                {boxFlavours.map((o) => {
                  const n = pd.box.filter((x) => x === o.id).length;
                  return (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 14, border: `1px solid ${n ? '#711D2C' : '#D9CDB4'}`, background: n ? '#F2E3DF' : '#F8F6EC' }}>
                      <div style={{ width: 34, flex: '0 0 34px' }}>
                        <Cookie flavour={o.id} flat />
                      </div>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>
                        {o.name}
                        {o.diet !== 'regular' && <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#3D5226' }}>GF available</span>}
                      </span>
                      <div className="qty" style={{ transform: 'scale(.86)', transformOrigin: 'right center' }}>
                        <button type="button" aria-label={`Remove one ${o.name}`} disabled={!n} onClick={() => boxRemove(o.id)}>
                          −
                        </button>
                        <span>{n}</span>
                        <button type="button" aria-label={`Add one ${o.name}`} disabled={!boxLeft} onClick={() => boxAdd(o.id)}>
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          )}

          {pickN > 0 && (
            <fieldset style={{ border: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <legend style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', gap: 10 }}>
                Choose {pickN} flavours
                <span aria-live="polite" style={{ fontWeight: 500, color: pickLeft ? '#711D2C' : '#3D5226' }}>
                  {pickLeft ? `${pickLeft} left to pick` : 'All set'}
                </span>
              </legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,180px),1fr))', gap: 8 }}>
                {boxFlavours.map((o) => {
                  const on = pd.box.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={on}
                      disabled={!on && !pickLeft}
                      onClick={() => togglePick(o.id)}
                      className={`choice ${on ? 'on' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', textAlign: 'left', background: on ? '#F2E3DF' : '#F8F6EC', opacity: !on && !pickLeft ? 0.5 : 1 }}
                    >
                      <span style={{ width: 30, flex: '0 0 30px' }}>
                        <Cookie flavour={o.id} flat />
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{o.name}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {p.styles && (
            <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
              <legend style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Cookie bites or sticks</legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
                {p.styles.map((x) => (
                  <button key={x} type="button" className={`choice ${pd.style === x ? 'on' : ''}`} aria-pressed={pd.style === x} onClick={() => set({ style: x })} style={{ minHeight: 52, background: pd.style === x ? '#F2E3DF' : '#F8F6EC' }}>
                    {x}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {p.dipChoice && (
            <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
              <legend style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Dipping (in the lid)</legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
                {p.dipChoice.map((x) => (
                  <button key={x} type="button" className={`choice ${pd.dip === x ? 'on' : ''}`} aria-pressed={pd.dip === x} onClick={() => set({ dip: x })} style={{ minHeight: 52, background: pd.dip === x ? '#F2E3DF' : '#F8F6EC' }}>
                    {x}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {fillingOptions.length > 0 && (
            <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
              <legend style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Add a filling <span style={{ fontWeight: 500, color: '#6E5C4D' }}>(optional, price per cookie)</span></legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
                {[{ name: '', price: 0 }, ...fillingOptions].map((x) => (
                  <button key={x.name || 'none'} type="button" className={`choice ${filling === x.name ? 'on' : ''}`} aria-pressed={filling === x.name} onClick={() => set({ filling: x.name })} style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 52, background: filling === x.name ? '#F2E3DF' : '#F8F6EC' }}>
                    <strong style={{ fontSize: 14 }}>{x.name || 'No filling'}</strong>
                    {x.price > 0 && <span style={{ fontSize: 13, color: '#6E5C4D', fontWeight: 400 }}>+ {fmt(x.price)}</span>}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {p.dips && (
            <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
              <legend style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Add a dip <span style={{ fontWeight: 500, color: '#6E5C4D' }}>(optional)</span></legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
                {[{ name: '', price: 0 }, ...p.dips].map((x) => (
                  <button key={x.name || 'none'} type="button" className={`choice ${pd.dip === x.name ? 'on' : ''}`} aria-pressed={pd.dip === x.name} onClick={() => set({ dip: x.name })} style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 52, background: pd.dip === x.name ? '#F2E3DF' : '#F8F6EC' }}>
                    <strong style={{ fontSize: 14 }}>{x.name || 'No dip'}</strong>
                    {x.price > 0 && <span style={{ fontSize: 13, color: '#6E5C4D', fontWeight: 400 }}>+ {fmt(x.price)}</span>}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {p.fixedFilling && (
            <div style={{ fontSize: 14 }}>
              <strong>Filling:</strong> {p.fixedFilling}
            </div>
          )}

          {p.packs.length > 1 && (
          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{p.cat === 'cakes' ? 'Size' : 'Pack size'}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8 }}>
              {p.packs.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className={`choice ${k.id === pk.id ? 'on' : ''}`}
                  aria-pressed={k.id === pk.id}
                  onClick={() => setPack(k.id)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 64, background: k.id === pk.id ? '#F2E3DF' : '#F8F6EC' }}
                >
                  <strong style={{ fontSize: 14 }}>{k.label}</strong>
                  <span style={{ fontSize: 13, color: '#6E5C4D', fontWeight: 400 }}>{fmt(packPrice(p, k))}</span>
                </button>
              ))}
            </div>
            {p.packNote && <span style={{ display: 'block', marginTop: 10, fontSize: 12, color: '#6E5C4D' }}>{p.packNote}</span>}
          </fieldset>
          )}

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
            <button type="button" className="btn btn-primary" disabled={blocked} onClick={add} style={{ flex: '1 1 220px', height: 52 }}>
              {soon ? 'Coming soon' : boxLeft > 0 ? `Pick ${boxLeft} more` : pickLeft > 0 ? `Pick ${pickLeft} more flavour${pickLeft > 1 ? 's' : ''}` : needsStyle ? 'Choose bites or sticks' : needsDip ? 'Choose a dip' : 'Add to Order Request'}
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
              <summary>Cookie care</summary>
              <p>Every TEM cookie is baked fresh, with no preservatives, so it&apos;s at its best for two weeks. After that, the texture and taste begin to change.</p>
              <p>Not sure you&apos;ll finish them in time? Pop them in the freezer as soon as they arrive and they&apos;ll stay delicious for up to a month. Take one out whenever the moment calls for it.</p>
              {p.care ? (
                <p>{p.care}</p>
              ) : (
                <>
                  <p>
                    <strong>Reheat instructions</strong>
                  </p>
                  <ol>
                    <li>Preheat your oven to 150°C.</li>
                    <li>Place your frozen cookies on a baking tray. (If you want to thaw first, leave the cookie at room temperature for about 30 minutes before placing it in the oven.)</li>
                    <li>Warm them for 6 to 10 minutes, until soft and warm in the centre.</li>
                    <li>Let them rest for a minute, then enjoy.</li>
                  </ol>
                </>
              )}
            </details>
            <details className="faq">
              <summary>Ingredients &amp; allergens</summary>
              <p>
                <strong>Ingredients:</strong> {ingredients}
              </p>
              {p.fixedFilling && (
                <p>
                  <strong>Filling:</strong> {p.fixedFilling}
                </p>
              )}
              <p>Our regular cookies contain gluten, and some cookies in both ranges also contain nuts. If you have an allergy, please check the ingredients carefully before you order.</p>
              <p>Our gluten-free cookies are made with gluten-free ingredients and baked with the same care as our regular range, with no compromise on taste or texture. We want everyone to enjoy a TEM cookie moment. However, they are prepared in a kitchen that also handles gluten and nuts, so we can&apos;t guarantee they are free from traces. If you have coeliac disease or a serious allergy, please get in touch before ordering so we can talk it through.</p>
            </details>
            <details className="faq">
              <summary>Packaging</summary>
              <p>{PACKAGING_NOTE}</p>
            </details>
            <details className="faq">
              <summary>Collection &amp; delivery</summary>
              <p>For now, all orders are available for collection only. Delivery is on its way, and we&apos;ll announce it as soon as it launches. Thank you for your patience as we grow, one cookie at a time.</p>
            </details>
          </div>
        </div>
      </div>

      <section aria-label="Goes well with" style={{ marginTop: 96 }}>
        <h2 className="h-card" style={{ fontSize: 28.2, marginBottom: 24 }}>
          Goes well with
        </h2>
        <div className="product-grid">
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
