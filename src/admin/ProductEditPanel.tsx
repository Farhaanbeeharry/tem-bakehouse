import { useState } from 'react';
import { categories, type Diet, type Product } from '../data/catalog';
import { ProductVisual } from '../components/ProductVisual';

type Props = {
  product: Product | null;
  onSavePrice: (price: number) => void;
  onClose: () => void;
};

export const ProductEditPanel = ({ product: p, onSavePrice, onClose }: Props) => {
  const [name, setName] = useState(p?.name ?? '');
  const [cat, setCat] = useState(p?.cat ?? categories[0].id);
  const [price, setPrice] = useState(p ? String(p.price) : '');
  const [diet, setDiet] = useState<Diet>(p?.diet ?? 'regular');
  const [desc, setDesc] = useState(p?.desc ?? '');
  const [custom, setCustom] = useState(!!p?.custom);
  const [flavourPick, setFlavourPick] = useState(!!p?.flavourPick);

  const save = () => {
    const n = Number(price);
    if (p && n > 0 && n !== p.price) onSavePrice(n);
    onClose();
  };

  return (
    <section
      className="adm-panel"
      aria-label={p ? `Edit ${p.name}` : 'New product'}
      style={{
        marginTop: 14,
        border: '1.5px solid var(--a-burgundy)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
        gap: 12,
      }}
    >
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <h2 className="adm-h2 lg">{p ? `Edit · ${p.name}` : 'New product'}</h2>
        <button type="button" className="adm-btn soft sm" onClick={onClose}>
          Close
        </button>
      </div>
      <label className="adm-label">
        Name
        <input className="adm-input" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="adm-label">
        Category
        <select className="adm-input" value={cat} onChange={(e) => setCat(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="adm-label">
        Base price (Rs)
        <input className="adm-input" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      <label className="adm-label">
        Versions
        <select className="adm-input" value={diet} onChange={(e) => setDiet(e.target.value as Diet)}>
          <option value="regular">Regular only</option>
          <option value="gf">Gluten-free only</option>
          <option value="both">Both</option>
        </select>
      </label>
      <label className="adm-label" style={{ gridColumn: '1 / -1' }}>
        Description
        <textarea className="adm-input" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
      </label>
      <div className="adm-label" style={{ gap: 6 }}>
        Pack sizes
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(p?.packs ?? []).map((k) => (
            <span key={k.id} style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--a-sand)', fontWeight: 500 }}>
              {k.label} · ×{k.mult}
            </span>
          ))}
          <span style={{ padding: '6px 10px', borderRadius: 8, border: '1px dashed var(--a-tan)', fontWeight: 500 }}>+ Add</span>
        </div>
      </div>
      <div className="adm-label" style={{ gap: 6 }}>
        Customisation
        <label style={{ fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" className="adm-check" checked={custom} onChange={() => setCustom(!custom)} />
          Occasion, message, instructions
        </label>
        <label style={{ fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" className="adm-check" checked={flavourPick} onChange={() => setFlavourPick(!flavourPick)} />
          Customer chooses flavour
        </label>
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
        {p ? (
          <div className="adm-hatch" style={{ aspectRatio: '1 / 1', padding: 14 }}>
            <ProductVisual pid={p.id} flavour={p.flavour} flat />
          </div>
        ) : (
          <div className="adm-hatch" style={{ aspectRatio: '1 / 1' }}>
            main
          </div>
        )}
        <div className="adm-hatch" style={{ aspectRatio: '1 / 1' }}>
          detail
        </div>
        <div
          className="adm-hatch"
          style={{ aspectRatio: '1 / 1', background: 'transparent', border: '1.5px dashed var(--a-tan)', fontSize: 12 }}
        >
          + Upload
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" className="adm-btn primary" style={{ padding: '10px 18px' }} onClick={save}>
          Save
        </button>
        <span className="adm-small">
          Status, featured, visibility and price save live; other fields are illustrative.
        </span>
      </div>
    </section>
  );
};
