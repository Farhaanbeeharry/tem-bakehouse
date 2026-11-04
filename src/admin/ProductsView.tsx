import { useState } from 'react';
import { categories, products } from '../data/catalog';
import { setStore, useStore, type ProductState } from '../lib/store';
import { fmt } from '../lib/format';
import { Cookie } from '../components/Cookie';
import { ProductEditPanel } from './ProductEditPanel';

const dietShort = (d: string) => (d === 'both' ? 'Regular + GF' : d === 'gf' ? 'GF only' : 'Regular');

const patchProduct = (id: string, patch: Partial<ProductState>) =>
  setStore((s) => {
    const base = products.find((p) => p.id === id);
    const existing = s.products.find((x) => x.id === id);
    const next: ProductState = {
      ...(existing ?? { id, status: base?.status ?? 'available', featured: !!base?.featured, enabled: true }),
      ...patch,
    };
    return {
      ...s,
      products: existing ? s.products.map((x) => (x.id === id ? next : x)) : [...s.products, next],
    };
  });

export const ProductsView = () => {
  const { products: states } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [catNote, setCatNote] = useState(false);

  const list = products.map((p) => {
    const st = states.find((x) => x.id === p.id);
    return {
      ...p,
      basePrice: p.price,
      price: st?.price ?? p.price,
      status: st?.status ?? p.status,
      featured: st?.featured ?? !!p.featured,
      enabled: st?.enabled ?? true,
    };
  });
  const editProduct = editing && editing !== 'new' ? list.find((p) => p.id === editing) ?? null : null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <span className="adm-muted">
          {list.length} products · {categories.length} categories
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="adm-btn" onClick={() => setCatNote(!catNote)}>
            + Category
          </button>
          <button type="button" className="adm-btn primary" onClick={() => setEditing('new')}>
            + Product
          </button>
        </div>
      </div>
      {catNote && (
        <div className="adm-note" style={{ background: '#F6E6C8', marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <span>Prototype: this opens a “New category” form (name, description, image, display order).</span>
          <button type="button" className="adm-linkbtn" onClick={() => setCatNote(false)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table" style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Versions</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Visible</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} style={{ opacity: p.enabled ? 1 : 0.5 }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 32, height: 32, flex: '0 0 auto' }}>
                      <Cookie flavour={p.flavour} flat />
                    </span>
                    <strong>{p.name}</strong>
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>{categories.find((c) => c.id === p.cat)?.name ?? p.cat}</td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  {fmt(p.price)}
                  {p.price !== p.basePrice && <span className="adm-small"> (was {fmt(p.basePrice)})</span>}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>{dietShort(p.diet)}</td>
                <td style={{ padding: '10px 14px' }}>
                  <select
                    className="adm-input sm"
                    aria-label={`${p.name} status`}
                    value={p.status}
                    onChange={(e) => patchProduct(p.id, { status: e.target.value === 'soon' ? 'soon' : 'available' })}
                  >
                    <option value="available">Available</option>
                    <option value="soon">Coming soon</option>
                  </select>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <input
                    type="checkbox"
                    className="adm-check"
                    aria-label={`${p.name} featured`}
                    checked={p.featured}
                    onChange={() => patchProduct(p.id, { featured: !p.featured })}
                  />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <input
                    type="checkbox"
                    className="adm-check"
                    aria-label={`${p.name} visible`}
                    checked={p.enabled}
                    onChange={() => patchProduct(p.id, { enabled: !p.enabled })}
                  />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button type="button" className="adm-btn soft sm" onClick={() => setEditing(p.id)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductEditPanel
          key={editing}
          product={editProduct}
          onSavePrice={(price) => editProduct && patchProduct(editProduct.id, { price: price === editProduct.basePrice ? undefined : price })}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
};
