import { useState } from 'react';
import { categories, products } from '../data/catalog';
import { patchProduct, useStore } from '../lib/store';
import { fmt } from '../lib/format';
import { ProductVisual } from '../components/ProductVisual';
import { ProductEditPanel } from './ProductEditPanel';
import { CatalogExtras } from './CatalogExtras';

const dietShort = (d: string) => (d === 'both' ? 'Regular + GF' : d === 'gf' ? 'GF only' : 'Regular');

export const ProductsView = () => {
  const { products: states } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [cat, setCat] = useState('all');

  // `products` already includes the owner's edits (applyCatalog); status / featured / visible come from the store.
  const list = products.map((p) => {
    const st = states.find((x) => x.id === p.id);
    return { ...p, status: st?.status ?? p.status, featured: st?.featured ?? !!p.featured, enabled: st?.enabled ?? true };
  });
  const shown = cat === 'all' ? list : list.filter((p) => p.cat === cat);
  const editProduct = editing && editing !== 'new' ? (list.find((p) => p.id === editing) ?? null) : null;
  const open = (id: string) => {
    setEditing(id);
    requestAnimationFrame(() => document.getElementById('product-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <label className="adm-label" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          Show
          <select className="adm-input sm" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">All products ({list.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({list.filter((p) => p.cat === c.id).length})
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="adm-btn primary" onClick={() => open('new')}>
          + Product
        </button>
      </div>

      <div id="product-editor">
        {editing && <ProductEditPanel key={editing} product={editProduct} state={editProduct ? states.find((x) => x.id === editProduct.id) : undefined} onClose={() => setEditing(null)} />}
      </div>

      <div className="adm-table-wrap" style={{ marginTop: editing ? 14 : 0 }}>
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
            {shown.map((p) => (
              <tr key={p.id} style={{ opacity: p.enabled ? 1 : 0.5 }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 36, height: 36, flex: '0 0 auto' }}>
                      <ProductVisual pid={p.id} flavour={p.flavour} flat />
                    </span>
                    <strong>{p.name}</strong>
                    {p.added && <span className="adm-small">new</span>}
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>{categories.find((c) => c.id === p.cat)?.name ?? p.cat}</td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  {fmt(p.price)}
                  {p.boxFee != null && <span className="adm-small"> box fee + cookies</span>}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>{dietShort(p.diet)}</td>
                <td style={{ padding: '10px 14px' }}>
                  <select className="adm-input sm" aria-label={`${p.name} status`} value={p.status} onChange={(e) => patchProduct(p.id, { status: e.target.value === 'soon' ? 'soon' : 'available' })}>
                    <option value="available">Available</option>
                    <option value="soon">Coming soon</option>
                  </select>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <input type="checkbox" className="adm-check" aria-label={`${p.name} featured`} checked={p.featured} onChange={() => patchProduct(p.id, { featured: !p.featured })} />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <input type="checkbox" className="adm-check" aria-label={`${p.name} visible`} checked={p.enabled} onChange={() => patchProduct(p.id, { enabled: !p.enabled })} />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button type="button" className="adm-btn soft sm" onClick={() => open(p.id)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CatalogExtras />
    </>
  );
};
