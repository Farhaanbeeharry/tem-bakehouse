import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore, type Order } from '../lib/store';
import { niceDate } from '../lib/format';
import { FilterChips } from './FilterChips';
import { NEEDS_YOU, ORDER_GROUPS, countIn, customerOf, nextAction, statusDef, summaryOf, totalText } from './adminData';
import { StatusBadge } from './StatusBadge';
import { useOrderDrawer } from './useOrderDrawer';

const csvCell = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';

const downloadCsv = (rows: Order[]) => {
  const head = ['ref', 'customer', 'created', 'date', 'slot', 'location', 'status', 'total', 'deposit_paid', 'balance_paid'].join(',');
  const lines = rows.map((o) =>
    [o.ref, customerOf(o).name, o.created, o.date, o.slot, o.location ?? '', statusDef(o.status).label, o.total ?? '', o.depositPaid, o.balancePaid]
      .map(csvCell)
      .join(','),
  );
  const url = URL.createObjectURL(new Blob([[head, ...lines].join('\n')], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tem-orders.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const OrdersView = () => {
  const { orders } = useStore();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const { open } = useOrderDrawer();

  const groupId = params.get('group') ?? 'all';
  const group = ORDER_GROUPS.find((g) => g.id === groupId) ?? ORDER_GROUPS[0];
  const setGroup = (id: string) =>
    setParams((p) => {
      const next = new URLSearchParams(p);
      if (id === 'all') next.delete('group');
      else next.set('group', id);
      return next;
    });

  const needle = q.trim().toLowerCase();
  const rows = orders
    .filter((o) => !group.statuses || group.statuses.includes(o.status))
    .filter((o) => !needle || `${o.ref} ${customerOf(o).name}`.toLowerCase().includes(needle))
    .sort((a, b) => a.date.localeCompare(b.date));

  const chips = ORDER_GROUPS.map((g) => ({ id: g.id, label: g.label, n: g.statuses ? countIn(orders, g.statuses) : orders.length }));

  return (
    <>
      <div className="adm-toolbar adm-noprint">
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          <FilterChips chips={chips} value={group.id} onChange={setGroup} label="Filter orders by stage" />
        </div>
        <input
          className="adm-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ref or customer"
          aria-label="Search orders"
          style={{ flex: '0 1 240px', minHeight: 40, padding: '10px 12px', background: 'var(--a-paper)' }}
        />
        <button type="button" className="adm-btn" onClick={() => downloadCsv(rows)}>
          Download CSV
        </button>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table" style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>For</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Next action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr
                key={o.ref}
                className={'click' + (NEEDS_YOU.includes(o.status) ? ' attn' : '')}
                onClick={() => open(o.ref)}
              >
                <td className="ref">
                  <a
                    href={`?order=${o.ref}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      open(o.ref);
                    }}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {o.ref}
                  </a>
                </td>
                <td>{customerOf(o).name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {niceDate(o.date)} · {o.slot}
                  {o.location && <span className="adm-small" style={{ display: 'block' }}>{o.location}</span>}
                </td>
                <td className="adm-muted" style={{ maxWidth: 260 }}>
                  {summaryOf(o)}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{totalText(o)}</td>
                <td>
                  <StatusBadge status={o.status} dot />
                </td>
                <td style={{ fontSize: 13, color: 'var(--a-burgundy)', fontWeight: 600 }}>{nextAction(o.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="adm-empty">No orders match.</p>}
      </div>
    </>
  );
};
