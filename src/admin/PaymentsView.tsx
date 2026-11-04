import { useState } from 'react';
import { tones, type Tone } from '../data/catalog';
import { useStore, type Order } from '../lib/store';
import { fmt } from '../lib/format';
import { FilterChips } from './FilterChips';
import { customerOf } from './adminData';
import { useOrderDrawer } from './useOrderDrawer';

const remaining = (o: Order) => (o.total ?? 0) - o.depositPaid - o.balancePaid;

const TABS: { id: string; label: string; test: (o: Order) => boolean }[] = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'outstanding', label: 'Deposit requested', test: (o) => o.status === 'deposit_required' || o.status === 'payment_failed' },
  { id: 'submitted', label: 'Proof submitted', test: (o) => o.status === 'deposit_submitted' },
  { id: 'verified', label: 'Verified deposits', test: (o) => o.depositPaid > 0 && !o.balancePaid },
  { id: 'balance', label: 'Balance outstanding', test: (o) => o.depositPaid > 0 && remaining(o) > 0 },
  { id: 'complete', label: 'Fully paid', test: (o) => o.balancePaid > 0 },
];

const depositState = (o: Order): [string, Tone] => {
  if (o.depositPaid > 0) return ['Deposit verified', 'good'];
  if (o.status === 'deposit_submitted') return ['Proof submitted', 'warn'];
  if (o.status === 'payment_failed') return ['Verification failed', 'danger'];
  if (o.status === 'deposit_required') return ['Deposit outstanding', 'action'];
  return ['—', 'neutral'];
};

export const PaymentsView = () => {
  const { orders, settings } = useStore();
  const { open } = useOrderDrawer();
  const [tab, setTab] = useState('all');

  const base = orders.filter((o) => o.total != null && o.status !== 'declined');
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];
  const rows = base.filter(active.test);

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <FilterChips
          chips={TABS.map((t) => ({ id: t.id, label: t.label, n: base.filter(t.test).length }))}
          value={active.id}
          onChange={setTab}
          label="Filter payments"
        />
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table" style={{ minWidth: 760 }}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Deposit</th>
              <th>Balance</th>
              <th>Method · ref</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const total = o.total ?? 0;
              const [state, tone] = depositState(o);
              const t = tones[tone];
              return (
                <tr key={o.ref} className="click" onClick={() => open(o.ref)}>
                  <td className="ref">{o.ref}</td>
                  <td>{customerOf(o).name}</td>
                  <td>{fmt(total)}</td>
                  <td>{o.depositPaid ? fmt(o.depositPaid) : fmt((total * settings.depositPct) / 100) + ' due'}</td>
                  <td>{o.balancePaid ? 'Paid ' + fmt(o.balancePaid) : fmt(total - o.depositPaid)}</td>
                  <td className="adm-small">
                    {(o.payMethod || 'Bank transfer') + (o.payRef ? ' · ' + o.payRef : '')}
                  </td>
                  <td>
                    <span className="adm-badge" style={{ background: t.bg, color: t.fg }}>
                      {state}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="adm-empty">No payments in this view.</p>}
      </div>
    </>
  );
};
