import { useState } from 'react';
import { FILLINGS, categories, slugify, type CategoryEdit, type Extra } from '../data/catalog';
import { asset } from '../lib/assets';
import { patchSettings, useStore } from '../lib/store';
import { PhotoField } from './PhotoField';

/** Categories (name, blurb, photo, new ones) and filling prices. Saved in settings.catalog. */
export const CatalogExtras = () => {
  const { settings, ready } = useStore();
  const catalog = settings.catalog ?? {};
  const [open, setOpen] = useState<string | null>(null);

  const saveCategory = (c: CategoryEdit) => {
    const list = catalog.categories ?? [];
    const next = list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c];
    return patchSettings({ catalog: { ...catalog, categories: next } });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 14, marginTop: 18 }}>
      <section className="adm-panel" aria-label="Categories">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <h2 className="adm-h2 lg">Categories</h2>
          <button type="button" className="adm-btn sm" onClick={() => setOpen('new')}>
            + Category
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...categories.filter((c) => !c.hidden), ...(open === 'new' ? [null] : [])].map((c) =>
            open === (c?.id ?? 'new') ? (
              <CategoryForm key={c?.id ?? 'new'} id={c?.id} name={c?.name ?? ''} blurb={c?.blurb ?? ''} photo={c?.photo} added={!c || !!catalog.categories?.find((x) => x.id === c.id)?.added} onCancel={() => setOpen(null)} onSave={async (v) => { await saveCategory(v); setOpen(null); }} />
            ) : (
              c && (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                  <div style={{ minWidth: 0 }}>
                    <strong>{c.name}</strong>
                    <div className="adm-small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.blurb}
                    </div>
                  </div>
                  <button type="button" className="adm-btn soft sm" onClick={() => setOpen(c.id)}>
                    Edit
                  </button>
                </div>
              )
            ),
          )}
        </div>
      </section>

      <FillingsEditor
        // Start from the saved fillings once they have loaded; don't reset while editing.
        key={String(ready)}
        onSave={(fillings) => patchSettings({ catalog: { ...catalog, fillings } })}
      />
    </div>
  );
};

type FormProps = { id?: string; name: string; blurb: string; photo?: string; added: boolean; onSave: (c: CategoryEdit) => Promise<void>; onCancel: () => void };

const CategoryForm = ({ id, name: n0, blurb: b0, photo: p0, added, onSave, onCancel }: FormProps) => {
  const [name, setName] = useState(n0);
  const [blurb, setBlurb] = useState(b0);
  const [photo, setPhoto] = useState(p0);
  const cid = id ?? slugify(name);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderRadius: 12, background: 'var(--a-sand)' }}>
      <label className="adm-label">
        Name
        <input className="adm-input" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="adm-label">
        Short description
        <textarea className="adm-input" rows={2} value={blurb} onChange={(e) => setBlurb(e.target.value)} />
      </label>
      <PhotoField label="Photo" hint="Portrait (3:4) works best." value={photo} folder={'category-' + cid} onChange={setPhoto} fallback={id ? <img src={asset.category(id)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span className="adm-small">none</span>} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="adm-btn primary sm" disabled={!name.trim()} onClick={() => void onSave({ id: cid, name: name.trim(), blurb: blurb.trim(), photo, added })}>
          Save
        </button>
        <button type="button" className="adm-btn soft sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const FillingsEditor = ({ onSave }: { onSave: (f: Extra[]) => Promise<string | null> }) => {
  const [rows, setRows] = useState<Extra[]>(() => FILLINGS.map((f) => ({ ...f })));
  const [msg, setMsg] = useState('');
  const set = (i: number, patch: Partial<Extra>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const save = async () => {
    const clean = rows.filter((r) => r.name.trim()).map((r) => ({ name: r.name.trim(), price: Number(r.price) || 0 }));
    const e = await onSave(clean);
    setMsg(e ?? 'Saved.');
  };
  return (
    <section className="adm-panel" aria-label="Fillings">
      <h2 className="adm-h2 lg" style={{ marginBottom: 6 }}>
        Fillings for round cookies
      </h2>
      <p className="adm-small" style={{ margin: '0 0 10px' }}>
        Price per cookie. Choose which cookies take each filling when you edit the cookie.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) auto', gap: 8 }}>
            <input className="adm-input" aria-label="Filling name" value={r.name} onChange={(e) => set(i, { name: e.target.value })} />
            <input className="adm-input" aria-label={`${r.name} price (Rs)`} type="number" min={0} value={r.price} onChange={(e) => set(i, { price: Number(e.target.value) })} />
            <button type="button" className="adm-btn soft sm" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="adm-btn soft sm" onClick={() => setRows((rs) => [...rs, { name: '', price: 0 }])}>
          + Add filling
        </button>
        <button type="button" className="adm-btn primary sm" onClick={() => void save()}>
          Save fillings
        </button>
        {msg && <span className="adm-small">{msg}</span>}
      </div>
    </section>
  );
};
