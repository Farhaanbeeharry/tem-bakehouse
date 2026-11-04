import { useNavigate } from 'react-router-dom';
import type { StatusId } from '../data/catalog';
import { useStore } from '../lib/store';
import { fmt, isoDay, niceDate } from '../lib/format';
import { NEEDS_YOU, TONE_COLOR, countIn, customerOf, nextAction, outstandingBalance, statusDef } from './adminData';
import { StatusBadge } from './StatusBadge';
import { useOrderDrawer } from './useOrderDrawer';

export const OverviewView = () => {
  const { orders } = useStore();
  const navigate = useNavigate();
  const { open } = useOrderDrawer();

  const goGroup = (g: string) => navigate(g === 'all' ? '/admin/orders' : `/admin/orders?group=${g}`);
  const outstanding = outstandingBalance(orders);

  const kpis: { label: string; value: number | string; group: string; hot?: boolean }[] = [
    { label: 'Total requests', value: orders.length, group: 'all' },
    { label: 'Pending review', value: countIn(orders, ['pending_review']), group: 'review', hot: true },
    { label: 'Awaiting deposit', value: countIn(orders, ['deposit_required', 'payment_failed']), group: 'deposit' },
    { label: 'Deposits to verify', value: countIn(orders, ['deposit_submitted']), group: 'verify', hot: true },
    { label: 'Confirmed', value: countIn(orders, ['confirmed']), group: 'confirmed' },
    { label: 'In preparation', value: countIn(orders, ['in_preparation']), group: 'prep' },
    { label: 'Ready / upcoming', value: countIn(orders, ['ready']), group: 'ready' },
    { label: 'Completed', value: countIn(orders, ['collected', 'delivered']), group: 'done' },
    { label: 'Outstanding balances', value: fmt(outstanding), group: 'all' },
  ];

  const byStatus = new Map<StatusId, number>();
  orders.forEach((o) => byStatus.set(o.status, (byStatus.get(o.status) ?? 0) + 1));
  const dist = [...byStatus].map(([s, n]) => ({
    s,
    label: statusDef(s).label,
    n,
    pct: (n / orders.length) * 100,
    col: TONE_COLOR[statusDef(s).tone],
  }));

  const trendRaw = Array.from({ length: 14 }, (_, i) => {
    const d = isoDay(i - 13);
    return { iso: d, d: d.slice(8), n: orders.filter((o) => o.created === d).length };
  });
  const max = Math.max(1, ...trendRaw.map((t) => t.n));

  const queue = orders.filter((o) => NEEDS_YOU.includes(o.status));
  const today = isoDay(0);
  const weekOut = isoDay(7);
  const upcoming = orders
    .filter((o) => o.date >= today && o.date <= weekOut && ['confirmed', 'in_preparation', 'ready'].includes(o.status))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <div className="adm-kpis">
        {kpis.map((k) => (
          <button
            key={k.label}
            type="button"
            className={'adm-kpi' + (k.hot && k.value ? ' hot' : '')}
            onClick={() => goGroup(k.group)}
          >
            <span className="adm-kpi-label">{k.label}</span>
            <span className="adm-kpi-value">{k.value}</span>
          </button>
        ))}
      </div>

      <div className="adm-grid">
        <section className="adm-panel">
          <h2 className="adm-h2" style={{ marginBottom: 14 }}>
            Status distribution
          </h2>
          <div className="adm-dist-bar" role="img" aria-label="Orders by status">
            {dist.map((d) => (
              <span key={d.s} title={`${d.label}: ${d.n}`} style={{ width: `${d.pct}%`, background: d.col }} />
            ))}
          </div>
          <div className="adm-legend">
            {dist.map((d) => (
              <div key={d.s} className="adm-legend-item">
                <span className="adm-swatch" style={{ background: d.col }} />
                <span style={{ flex: 1 }}>{d.label}</span>
                <strong>{d.n}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="adm-panel">
          <h2 className="adm-h2" style={{ marginBottom: 14 }}>
            Requests · last 14 days
          </h2>
          <div className="adm-trend">
            {trendRaw.map((t, i) => (
              <div key={t.iso} className="adm-trend-col" title={`${niceDate(t.iso)}: ${t.n}`}>
                <span style={{ fontSize: 10, color: 'var(--a-muted)' }}>{t.n}</span>
                <span
                  className="adm-trend-bar"
                  style={{ height: `${(t.n / max) * 80}%`, background: i === 13 ? 'var(--a-burgundy)' : 'var(--a-tan)' }}
                />
                <span className="adm-mono" style={{ fontSize: 9, color: 'var(--a-faint)' }}>
                  {t.d}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="adm-panel">
          <h2 className="adm-h2" style={{ marginBottom: 10 }}>
            Needs you
          </h2>
          {queue.map((o) => (
            <button key={o.ref} type="button" className="adm-row" onClick={() => open(o.ref)}>
              <span className="adm-row-col">
                <strong>
                  {o.ref} · {customerOf(o).name}
                </strong>
                <span className="adm-small">{nextAction(o.status)}</span>
              </span>
              <StatusBadge status={o.status} />
            </button>
          ))}
          {queue.length === 0 && <p className="adm-muted" style={{ margin: 0 }}>All caught up.</p>}
        </section>

        <section className="adm-panel">
          <h2 className="adm-h2" style={{ marginBottom: 10 }}>
            Upcoming collections · 7 days
          </h2>
          {upcoming.map((o) => (
            <button key={o.ref} type="button" className="adm-row upcoming" onClick={() => open(o.ref)}>
              <span style={{ fontWeight: 700 }}>{niceDate(o.date)}</span>
              <span style={{ minWidth: 0 }}>
                {o.ref} · {customerOf(o).name}
                <br />
                <span className="adm-small">{o.slot}</span>
              </span>
              <StatusBadge status={o.status} />
            </button>
          ))}
          {upcoming.length === 0 && <p className="adm-muted" style={{ margin: 0 }}>Nothing scheduled this week.</p>}
        </section>
      </div>
    </>
  );
};
