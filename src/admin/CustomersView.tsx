import { useState } from 'react';
import { customers } from '../data/catalog';
import { useStore } from '../lib/store';
import { niceDate } from '../lib/format';
import { summaryOf } from './adminData';
import { StatusBadge } from './StatusBadge';
import { useOrderDrawer } from './useOrderDrawer';

export const CustomersView = () => {
  const { orders } = useStore();
  const { open } = useOrderDrawer();
  const [sel, setSel] = useState<string | null>(null);

  const countFor = (id: string) => orders.filter((o) => o.customer === id).length;
  const selected = customers.find((c) => c.id === sel);
  const history = selected
    ? orders.filter((o) => o.customer === selected.id).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 14, alignItems: 'start' }}>
      <div className="adm-table-wrap" style={{ overflow: 'hidden' }}>
        {customers.map((c) => {
          const n = countFor(c.id);
          return (
            <button
              key={c.id}
              type="button"
              className="adm-row"
              aria-pressed={sel === c.id}
              onClick={() => setSel(c.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                padding: '14px 16px',
                background: sel === c.id ? 'var(--a-sel)' : 'transparent',
              }}
            >
              <span style={{ minWidth: 0 }}>
                <strong>{c.name}</strong>
                <br />
                <span className="adm-small" style={{ overflowWrap: 'anywhere' }}>
                  {c.email} · {c.phone}
                </span>
              </span>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {n > 1 && (
                  <span className="adm-badge" style={{ background: '#E2EAD6', color: '#3D5226' }}>
                    Repeat
                  </span>
                )}
                <span className="adm-small" style={{ whiteSpace: 'nowrap' }}>
                  {n} order{n === 1 ? '' : 's'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <section className="adm-panel tight" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="adm-h2 lg">{selected ? `${selected.name} · order history` : 'Select a customer'}</h2>
        {history.map((o) => (
          <button key={o.ref} type="button" className="adm-row" onClick={() => open(o.ref)} style={{ alignItems: 'flex-start' }}>
            <span>
              {o.ref} · {niceDate(o.date)}
              <br />
              <span className="adm-small">{summaryOf(o)}</span>
            </span>
            <StatusBadge status={o.status} />
          </button>
        ))}
        {selected && history.length === 0 && <span className="adm-small">No orders yet.</span>}
        <p className="adm-small" style={{ margin: 0 }}>
          Communication history (emails sent by the system) appears here in production.
        </p>
      </section>
    </div>
  );
};
