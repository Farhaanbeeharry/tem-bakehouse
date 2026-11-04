import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Cookie } from '../components/Cookie';
import { categories } from '../data/catalog';
import { useProducts } from '../lib/store';

const DIETS = [
  ['all', 'All'],
  ['regular', 'Regular'],
  ['gf', 'Gluten-free'],
] as const;

export const MenuPage = () => {
  const [params, setParams] = useSearchParams();
  const P = useProducts();
  const cat = params.get('cat') ?? 'all';
  const diet = params.get('diet') ?? 'all';
  const q = params.get('q') ?? '';

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const needle = q.trim().toLowerCase();
  const dietOk = (d: string) => diet === 'all' || (diet === 'gf' ? d !== 'regular' : d !== 'gf');
  const list = P.filter((p) => (cat === 'all' || p.cat === cat) && dietOk(p.diet) && (!needle || (p.name + ' ' + p.cat).toLowerCase().includes(needle))).sort(
    (a, b) => (a.status === 'available' ? 0 : 1) - (b.status === 'available' ? 0 : 1),
  );

  return (
    <main className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            The menu
          </div>
          <h1 className="h-page">Our Cookies</h1>
        </div>
        <p className="lede" style={{ maxWidth: '42ch' }}>
          Every order is baked for your date. Gluten-free availability is marked per product.
        </p>
      </div>

      <div style={{ position: 'sticky', top: 68, zIndex: 20, background: '#F0EED9', padding: '14px 0', borderBottom: '1px solid #D9CDB4', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div role="tablist" aria-label="Categories" className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 2 }}>
          {[{ id: 'all', name: 'All' }, ...categories].map((c) => {
            const on = cat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => set('cat', c.id)}
                style={{ flex: '0 0 auto', border: `1px solid ${on ? '#1E1310' : '#C7B593'}`, background: on ? '#1E1310' : 'transparent', color: on ? '#F0EED9' : '#1E1310', borderRadius: 999, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44, transition: 'background .25s, color .25s' }}
              >
                {c.name} <span style={{ opacity: 0.6, fontWeight: 500 }}>{P.filter((p) => c.id === 'all' || p.cat === c.id).length}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div role="radiogroup" aria-label="Dietary filter" className="pill-tabs" style={{ flex: '0 0 auto' }}>
            {DIETS.map(([id, label]) => (
              <button key={id} type="button" role="radio" aria-checked={diet === id} className={diet === id ? 'on' : ''} onClick={() => set('diet', id)} style={{ padding: '9px 14px', fontSize: 13, minHeight: 38 }}>
                {label}
              </button>
            ))}
          </div>
          <label style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #D9CDB4', background: '#F8F6EC', borderRadius: 999, padding: '0 16px', minHeight: 46 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6E5C4D' }}>SEARCH</span>
            <input
              value={q}
              onChange={(e) => set('q', e.target.value)}
              placeholder="Pistachio, cake, mini…"
              aria-label="Search cookies"
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 15, outline: 'none', minWidth: 0, color: '#1E1310' }}
            />
          </label>
        </div>
      </div>

      <p style={{ margin: '18px 0 22px', fontSize: 13, color: '#6E5C4D' }}>
        {list.length} {list.length === 1 ? 'item' : 'items'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap: 'clamp(14px,2vw,28px)' }}>
        {list.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
      {list.length === 0 && (
        <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 120, opacity: 0.5 }}>
            <Cookie flavour="plain" />
          </div>
          <p className="h-card" style={{ fontSize: 21.8 }}>
            No cookies match that.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </button>
        </div>
      )}
    </main>
  );
};
