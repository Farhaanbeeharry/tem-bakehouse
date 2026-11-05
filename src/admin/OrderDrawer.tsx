import { useEffect, useState } from 'react';
import type { StatusId } from '../data/catalog';
import { pushStatus, updateOrder, useStore, type Order, type OrderLine } from '../lib/store';
import { fmt, niceDate } from '../lib/format';
import { customerOf, estimate, isLive, statusDef } from './adminData';
import { OrderActions } from './OrderActions';
import { lineMeta } from '../components/CartDrawer';
import { StatusBadge } from './StatusBadge';

type Props = { order: Order; onClose: () => void };

const CANCELLABLE: StatusId[] = ['deposit_required', 'confirmed', 'in_preparation', 'awaiting_approval', 'payment_failed'];

const customText = (l: OrderLine) => {
  const c = l.custom;
  if (!c) return '';
  return [c.occasion, c.message && `“${c.message}”`, c.instructions].filter(Boolean).join(' · ');
};

const depositState = (o: Order) => {
  if (o.depositPaid) return 'Verified ' + fmt(o.depositPaid);
  return o.status === 'deposit_submitted' ? 'Submitted, unverified' : 'Not received';
};

export const OrderDrawer = ({ order: o, onClose }: Props) => {
  const { orders, settings } = useStore();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const c = customerOf(o);
  const phone = o.phone || c.phone;
  const dayLoad = orders.filter((x) => x.date === o.date && isLive(x)).length;
  const waDigits = phone.replace(/\D/g, '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pay = [
    { k: 'Approved total', v: o.total != null ? fmt(o.total) : 'Not set' },
    { k: 'Deposit', v: depositState(o) },
    { k: 'Balance paid', v: o.balancePaid ? fmt(o.balancePaid) : '—' },
    { k: 'Outstanding', v: o.total != null ? fmt(o.total - o.depositPaid - o.balancePaid) : '—' },
  ];

  return (
    <>
      <div className="adm-scrim adm-noprint" onClick={onClose} />
      <aside className="adm-drawer" role="dialog" aria-modal="true" aria-label={`Order ${o.ref}`}>
        <div className="adm-drawer-head">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="adm-mono" style={{ fontSize: 13, fontWeight: 600 }}>
              {o.ref}
            </span>
            <StatusBadge status={o.status} dot />
          </div>
          <div style={{ display: 'flex', gap: 6 }} className="adm-noprint">
            <button type="button" className="adm-btn soft" onClick={() => window.print()}>
              Print
            </button>
            <button type="button" className="adm-sq lg" aria-label="Close" onClick={onClose} autoFocus>
              ×
            </button>
          </div>
        </div>

        <div className="adm-drawer-body">
          <div className="adm-two">
            <div className="adm-tile">
              <span style={{ fontSize: 11 }} className="adm-muted">
                Customer
              </span>
              <br />
              <strong>{c.name}</strong>
              <br />
              <span className="adm-small">
                {c.email} · {phone}
              </span>
            </div>
            <div className="adm-tile">
              <span style={{ fontSize: 11 }} className="adm-muted">
                {o.method === 'delivery' ? 'Delivery' : 'Collection' + (o.location ? ' · ' + o.location : '')}
              </span>
              <br />
              <strong>{niceDate(o.date)}</strong>
              <br />
              <span className="adm-small">
                {o.slot} · {dayLoad}/{settings.dailyCapacity} orders that day
              </span>
            </div>
          </div>

          <section className="adm-sec" style={{ gap: 8 }}>
            <h3>Items</h3>
            {o.items.map((l) => {
              const ct = customText(l);
              return (
                <div key={l.key} className="adm-line">
                  <div>
                    <strong>
                      {l.qty} × {l.name}
                    </strong>
                    <br />
                    <span className="adm-small">
                      {lineMeta(l)}
                    </span>
                    {ct && (
                      <>
                        <br />
                        <span style={{ fontSize: 12, color: 'var(--a-burgundy)' }}>Personalisation: {ct}</span>
                      </>
                    )}
                  </div>
                  <span style={{ whiteSpace: 'nowrap' }}>{fmt(l.unit * l.qty)}</span>
                </div>
              );
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }} className="adm-muted">
              <span>Estimate from menu prices</span>
              <strong style={{ color: 'var(--a-ink)' }}>{fmt(estimate(o))}</strong>
            </div>
            {o.notes && (
              <div className="adm-note" style={{ background: '#F6E6C8' }}>
                <strong>Customer note:</strong> {o.notes}
              </div>
            )}
          </section>

          <OrderActions order={o} settings={settings} />

          <section className="adm-sec">
            <h3>Payments</h3>
            {pay.map((p) => (
              <div key={p.k} className="adm-kv">
                <span>{p.k}</span>
                <strong>{p.v}</strong>
              </div>
            ))}
          </section>

          <section className="adm-sec">
            <h3>
              <label htmlFor="adm-internal">Internal notes</label>
            </h3>
            <textarea
              id="adm-internal"
              className="adm-input"
              rows={3}
              value={o.internal || ''}
              onChange={(e) => {
                const v = e.target.value;
                updateOrder(o.ref, (x) => ({ ...x, internal: v }));
              }}
              placeholder="Only visible to staff"
              style={{ padding: 10 }}
            />
          </section>

          <section className="adm-sec">
            <h3>Activity</h3>
            {[...(o.log || [])].reverse().map((g, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>{statusDef(g.s).label}</span>
                <span className="adm-muted">{niceDate(g.t)}</span>
              </div>
            ))}
          </section>

          <div className="adm-btn-row adm-noprint">
            <a
              className="adm-btn soft"
              href={waDigits.length >= 8 ? `https://wa.me/${waDigits}` : 'https://wa.me/'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 600, color: 'var(--a-ink)' }}
            >
              WhatsApp customer
            </a>
            <a
              className="adm-btn soft"
              href={c.email.includes('@') ? `mailto:${c.email}?subject=${encodeURIComponent('Your TEM order ' + o.ref)}` : 'mailto:'}
              style={{ fontWeight: 600, color: 'var(--a-ink)' }}
            >
              Email customer
            </a>
            {CANCELLABLE.includes(o.status) && !confirmCancel && (
              <button type="button" className="adm-btn danger" onClick={() => setConfirmCancel(true)}>
                Cancel order
              </button>
            )}
          </div>
          {CANCELLABLE.includes(o.status) && confirmCancel && (
            <div className="adm-action adm-noprint" style={{ borderColor: 'var(--a-danger)' }}>
              <span style={{ fontSize: 13 }}>
                Cancel this order? Deposit handling must follow the Order Policy — the system does not refund or forfeit
                automatically.
              </span>
              <div className="adm-btn-row">
                <button type="button" className="adm-btn soft" onClick={() => setConfirmCancel(false)}>
                  Keep order
                </button>
                <button
                  type="button"
                  className="adm-btn danger"
                  onClick={() => {
                    updateOrder(o.ref, (x) => pushStatus(x, 'cancelled'));
                    setConfirmCancel(false);
                  }}
                >
                  Yes, cancel order
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
