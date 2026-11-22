import { useState } from 'react';
import { FILLINGS, categories, flavourById, packPrice, products, slugify, type Diet, type PackEdit, type Product, type ProductEdit } from '../data/catalog';
import { deleteProduct, patchProduct, type ProductState } from '../lib/store';
import { ProductVisual } from '../components/ProductVisual';
import { Cookie } from '../components/Cookie';
import { PhotoField } from './PhotoField';

type Props = {
  /** null = a new product. */
  product: Product | null;
  state?: ProductState;
  onClose: () => void;
};

const newPackId = () => 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

/** Edit everything about a product, or create a new one. Saves to Supabase and updates the site live. */
export const ProductEditPanel = ({ product: p, state, onClose }: Props) => {
  const isNew = !p;
  const f = p?.cat === 'round' ? flavourById[p.flavour] : undefined;
  const edit = state?.edit ?? {};

  const [cat, setCat] = useState(p?.cat ?? 'round');
  const round = cat === 'round';
  const [name, setName] = useState(p?.name ?? '');
  const [price, setPrice] = useState(p ? String(p.price) : '');
  const [diet, setDiet] = useState<Diet>(p?.diet ?? 'regular');
  const [desc, setDesc] = useState(p?.desc ?? '');
  const [ingredients, setIngredients] = useState((round ? f?.ingredients : p?.ingredients) ?? '');
  const [fillings, setFillings] = useState<string[]>(f?.fillings ?? []);
  const [packs, setPacks] = useState<PackEdit[]>(() =>
    p ? p.packs.map((k) => ({ id: k.id, label: k.label, qty: k.qty, price: packPrice(p, k), pick: k.pick })) : [{ id: 'k1', label: 'One size', qty: 1, price: 0 }],
  );
  const [flavourPick, setFlavourPick] = useState(!!p?.flavourPick);
  const [custom, setCustom] = useState(!!p?.custom);
  const [photo, setPhoto] = useState<string | undefined>(edit.photo);
  const [photoBroken, setPhotoBroken] = useState<string | undefined>(edit.photoBroken);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const boxFee = p?.boxFee != null;
  const showPacks = !boxFee && !round;
  const priceLabel = round ? 'Price per cookie (Rs)' : boxFee ? 'Box fee (Rs) — cookie prices are added on top' : 'Starting price (Rs)';

  const setPack = (i: number, patch: Partial<PackEdit>) => setPacks((ks) => ks.map((k, j) => (j === i ? { ...k, ...patch } : k)));

  const save = async () => {
    const n = Number(price);
    if (!name.trim()) return setErr('Give it a name.');
    if (!showPacks && (!(n >= 0) || price === '')) return setErr('Enter a price.');
    if (showPacks && (!packs.length || packs.some((k) => !k.label.trim() || !(k.price > 0)))) return setErr('Each pack size needs a name and a price.');
    setErr('');
    setBusy(true);

    const id = p?.id ?? uniqueId(round ? 'round-' : 'custom-', name);
    const next: ProductEdit = {
      name: name.trim(),
      desc: desc.trim(),
      ingredients: ingredients.trim(),
      diet,
      photo,
      ...(round ? { fillings, photoBroken } : {}),
      // Round cookies: single = the cookie price, box of 4 = 4×. Other products keep their own pack prices.
      ...(showPacks ? { packs: packs.map((k) => ({ ...k, label: k.label.trim(), price: Number(k.price) })) } : {}),
      ...(isNew ? { def: { cat, flavourPick: round ? undefined : flavourPick, custom: round ? undefined : custom } } : edit.def ? { def: { ...edit.def, flavourPick, custom } } : {}),
    };
    const startPrice = showPacks ? Math.min(...packs.map((k) => Number(k.price))) : n;
    const e = await patchProduct(id, { price: startPrice, edit: next, ...(isNew ? { status: 'available', featured: false, enabled: true } : {}) });
    setBusy(false);
    if (e) return setErr(e);
    onClose();
  };

  const remove = async () => {
    if (!p || !window.confirm(`Delete ${p.name}? It disappears from the website. Past orders keep their details.`)) return;
    const e = await deleteProduct(p.id);
    if (e) return setErr(e);
    onClose();
  };

  return (
    <section
      className="adm-panel"
      aria-label={p ? `Edit ${p.name}` : 'New product'}
      style={{ marginTop: 14, border: '1.5px solid var(--a-burgundy)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 14 }}
    >
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <h2 className="adm-h2 lg">{p ? `Edit · ${p.name}` : 'New product'}</h2>
        <button type="button" className="adm-btn soft sm" onClick={onClose}>
          Close
        </button>
      </div>

      {isNew && (
        <label className="adm-label">
          Category
          <select className="adm-input" value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id === 'round' ? 'Round Cookies (a new flavour)' : c.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="adm-label">
        Name
        <input className="adm-input" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="adm-label">
        {priceLabel}
        <input className="adm-input" type="number" min={0} value={showPacks ? String(Math.min(...packs.map((k) => Number(k.price) || 0))) : price} disabled={showPacks} onChange={(e) => setPrice(e.target.value)} />
        {showPacks && <span className="adm-small">Set from the pack sizes below.</span>}
      </label>
      <label className="adm-label">
        Versions
        <select className="adm-input" value={diet} onChange={(e) => setDiet(e.target.value as Diet)}>
          <option value="regular">Regular only</option>
          <option value="both">Regular and gluten-free</option>
          <option value="gf">Gluten-free only</option>
        </select>
      </label>
      <label className="adm-label" style={{ gridColumn: '1 / -1' }}>
        Description
        <textarea className="adm-input" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
      </label>
      <label className="adm-label" style={{ gridColumn: '1 / -1' }}>
        Ingredients
        <textarea className="adm-input" rows={2} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
      </label>

      {showPacks && (
        <div className="adm-label" style={{ gridColumn: '1 / -1', gap: 8 }}>
          Pack sizes and prices
          {packs.map((k, i) => (
            <div key={k.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) auto', gap: 8, alignItems: 'center' }}>
              <input className="adm-input" aria-label="Pack name" placeholder="e.g. Box of 12" value={k.label} onChange={(e) => setPack(i, { label: e.target.value })} />
              <input className="adm-input" aria-label="Number of pieces" type="number" min={1} title="Pieces in the pack" value={k.qty} onChange={(e) => setPack(i, { qty: Number(e.target.value) || 1 })} />
              <input className="adm-input" aria-label="Price (Rs)" type="number" min={0} value={k.price} onChange={(e) => setPack(i, { price: Number(e.target.value) })} />
              <button type="button" className="adm-btn soft sm" aria-label={`Remove ${k.label}`} disabled={packs.length < 2} onClick={() => setPacks((ks) => ks.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
          <span className="adm-small">Name · pieces · price in Rs.{packs.some((k) => k.pick) ? ' Flavour picks per box stay as they are.' : ''}</span>
          <button type="button" className="adm-btn soft sm" style={{ alignSelf: 'flex-start' }} onClick={() => setPacks((ks) => [...ks, { id: newPackId(), label: '', qty: 1, price: 0 }])}>
            + Add a pack size
          </button>
        </div>
      )}
      {round && (
        <div className="adm-label" style={{ gridColumn: '1 / -1', gap: 6 }}>
          Fillings customers can add
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {FILLINGS.map((x) => (
              <label key={x.name} style={{ fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" className="adm-check" checked={fillings.includes(x.name)} onChange={() => setFillings((fs) => (fs.includes(x.name) ? fs.filter((y) => y !== x.name) : [...fs, x.name]))} />
                {x.name}
              </label>
            ))}
          </div>
          <span className="adm-small">The price above is for one cookie; a filling is added per cookie.</span>
        </div>
      )}
      {!round && (isNew || edit.def) && (
        <div className="adm-label" style={{ gap: 6 }}>
          Options
          <label style={{ fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" className="adm-check" checked={flavourPick} onChange={() => setFlavourPick(!flavourPick)} />
            Customer chooses a flavour
          </label>
          <label style={{ fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" className="adm-check" checked={custom} onChange={() => setCustom(!custom)} />
            Personalisation (occasion, message, instructions)
          </label>
        </div>
      )}

      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 14 }}>
        <PhotoField
          label={round ? 'Cookie photo (top view)' : 'Product photo'}
          hint={round ? 'Best: a square PNG with a transparent background, like the other cookies.' : 'Portrait photos (3:4) on a plain background look best.'}
          value={photo}
          folder={p?.id ?? 'new'}
          onChange={setPhoto}
          fallback={p ? <ProductVisual pid={p.id} flavour={p.flavour} flat /> : <Cookie flavour="plain" flat photo={false} />}
        />
        {round && (
          <PhotoField
            label="Broken cookie photo (optional)"
            hint="Shown as “the break” on the cookie page."
            value={photoBroken}
            folder={p?.id ?? 'new'}
            onChange={setPhotoBroken}
            fallback={<span className="adm-small">none</span>}
          />
        )}
      </div>

      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" className="adm-btn primary" style={{ padding: '10px 18px' }} disabled={busy} onClick={() => void save()}>
          {busy ? 'Saving…' : isNew ? 'Add to the website' : 'Save changes'}
        </button>
        {p?.added && (
          <button type="button" className="adm-btn soft" onClick={() => void remove()}>
            Delete product
          </button>
        )}
        {err ? (
          <span role="alert" className="adm-small" style={{ color: '#9B2C2C' }}>
            {err}
          </span>
        ) : (
          <span className="adm-small">Changes appear on the website straight away.</span>
        )}
      </div>
    </section>
  );
};

const uniqueId = (prefix: string, name: string) => {
  const base = prefix + slugify(name);
  let id = base;
  for (let i = 2; products.some((x) => x.id === id); i++) id = `${base}-${i}`;
  return id;
};
