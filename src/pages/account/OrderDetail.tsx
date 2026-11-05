import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductVisual } from '../../components/ProductVisual';
import { StatusBadge } from '../../components/StatusBadge';
import { customText, lineMeta } from '../../components/CartDrawer';
import { DONE_STATUSES, flow, flowLabels, statuses, type StatusId } from '../../data/catalog';
import { whatsappUrl } from '../../data/site';
import { fmt, isoDay, niceDate, uid } from '../../lib/format';
import { useShop } from '../../lib/shop';
import { estimateOf, pushStatus, resetStore, updateOrder, useProducts, useStore, type Order } from '../../lib/store';

const IDX: Partial<Record<StatusId, number>> = { pending_review: 0, changes_requested: 0, awaiting_approval: 0, deposit_required: 1, payment_failed: 1, deposit_submitted: 2, confirmed: 3, in_preparation: 4, ready: 5, out_for_delivery: 5, collected: 6, delivered: 6 };

const BANNERS: Partial<Record<StatusId, [string, string, string, string]>> = {
  declined: ['Request declined.', "TEM couldn't accept this request. You can reorder for another date or message TEM.", '#F3DCD8', '#8A2320'],
  cancelled: ['Order cancelled.', 'Deposit handling follows the TEM Order Policy.', '#F3DCD8', '#8A2320'],
  expired: ['Request expired.', 'The response deadline passed. Submit a new request any time.', '#F3DCD8', '#8A2320'],
  payment_failed: ['Deposit not verified.', "TEM couldn't match your payment. Check the reference and submit again.", '#F3DCD8', '#8A2320'],
  changes_requested: ['TEM has a question.', "Check your email or WhatsApp for TEM's message.", '#F6E6C8', '#7A4E0E'],
};

const h3 = { margin: '0 0 14px', fontSize: 19.2 } as const;

export const OrderDetail = ({ o }: { o: Order }) => {
  const navigate = useNavigate();
  const { settings } = useStore();
  const P = useProducts();
  const { setCart, setDrawerOpen, showToast } = useShop();
  const [dep, setDep] = useState({ method: 'Bank transfer', ref: '', date: '', file: '', tried: false });
  const S = statuses[o.status];
  const stopped = ['declined', 'cancelled', 'expired'].includes(o.status);
  const cur = stopped ? -1 : (IDX[o.status] ?? 0);
  const when = (st: StatusId) => {
    const e = o.log.find((x) => x.s === st);
    return e ? niceDate(e.t) : '';
  };
  const total = o.total;
  const depAmt = total != null ? (total * settings.depositPct) / 100 : null;
  const est = o.estimate ?? estimateOf(o.items);
  const depState = o.depositPaid > 0 ? 'Verified' : o.status === 'deposit_submitted' ? 'Submitted — awaiting verification' : o.status === 'payment_failed' ? 'Could not be verified' : o.status === 'deposit_required' ? 'Requested' : 'Not yet requested';
  const payRows: [string, string, string][] = [
    ['Approved total', total != null ? fmt(total) : `To be confirmed by TEM Bakehouse (est. ${fmt(est)})`, '#1E1310'],
    [`Deposit (${settings.depositPct}%)`, depAmt != null ? fmt(depAmt) : '—', '#1E1310'],
    ['Deposit status', depState, o.depositPaid > 0 ? '#3D5226' : o.status === 'payment_failed' ? '#8A2320' : '#1E1310'],
    ['Balance outstanding', total != null ? fmt(total - o.depositPaid - o.balancePaid) : '—', '#1E1310'],
    ['Final payment', o.balancePaid > 0 ? 'Received ' + fmt(o.balancePaid) : total != null ? 'Due at collection' : '—', o.balancePaid > 0 ? '#3D5226' : '#1E1310'],
  ];
  const banner =
    o.status === 'ready'
      ? (['Ready when you are.', `Collect at ${o.slot} on ${niceDate(o.date)}. Please bring the remaining balance. Location: ${o.location ?? 'shared by TEM Bakehouse'}.`, '#E2EAD6', '#3D5226'] as const)
      : o.status === 'payment_failed' && o.failNote
        ? (['Deposit not verified.', o.failNote, '#F3DCD8', '#8A2320'] as const)
        : BANNERS[o.status];
  const upd = (fn: (x: Order) => Order) => updateOrder(o.ref, fn);

  const sims: [string, () => void][] = [];
  if (o.status === 'pending_review') {
    sims.push(['TEM accepts → request deposit', () => upd((x) => pushStatus({ ...x, total: x.estimate ?? est }, 'deposit_required'))]);
    sims.push(['TEM proposes a change', () => upd((x) => pushStatus({ ...x, proposal: 'Your date is fully booked. TEM can prepare this order for the following day at the same time, with the same items and price.' }, 'awaiting_approval'))]);
    sims.push(['TEM declines', () => upd((x) => pushStatus(x, 'declined'))]);
  }
  if (o.status === 'deposit_submitted') {
    sims.push(['TEM verifies deposit', () => upd((x) => pushStatus({ ...x, depositPaid: (x.total ?? 0) / 2 }, 'confirmed'))]);
    sims.push(['TEM rejects proof', () => upd((x) => pushStatus({ ...x, failNote: "The reference didn't match a received payment. Please check and resubmit." }, 'payment_failed'))]);
  }
  if (o.status === 'confirmed') sims.push(['Start preparing', () => upd((x) => pushStatus(x, 'in_preparation'))]);
  if (o.status === 'in_preparation') sims.push(['Mark ready for collection', () => upd((x) => pushStatus(x, 'ready'))]);
  if (o.status === 'ready') sims.push(['Record balance & collected', () => upd((x) => pushStatus({ ...x, balancePaid: (x.total ?? 0) - x.depositPaid }, 'collected'))]);
  if (!sims.length) sims.push(['Reset demo data', () => {
    resetStore();
    navigate('/account?tab=orders');
  }]);

  const submitDeposit = () => {
    if (!dep.ref.trim()) return setDep({ ...dep, tried: true });
    upd((x) => pushStatus({ ...x, payRef: dep.ref, payMethod: dep.method, proof: dep.file, payDate: dep.date }, 'deposit_submitted'));
    setDep({ method: 'Bank transfer', ref: '', date: '', file: '', tried: false });
  };

  const reorder = () => {
    const lines = o.items.flatMap((l) => {
      const p = P.find((x) => x.id === l.pid);
      if (!p || p.status !== 'available') return [];
      const pk = p.packs.find((k) => k.id === l.packId) ?? p.packs[0];
      return [{ ...l, key: uid(), unit: p.price * pk.mult }];
    });
    setCart((c) => [...c, ...lines]);
    setDrawerOpen(true);
    showToast('Added at current prices. Check availability and choose a new date.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Link to="/account?tab=orders" style={{ fontSize: 13, color: '#6E5C4D' }}>
        ← All orders
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.14em' }}>{o.ref}</span>
          <h2 className="h-page" style={{ fontSize: 'clamp(25.6px,3.2vw,41px)', lineHeight: 0.95 }}>
            {S.label}
          </h2>
          <span style={{ fontSize: 15, color: '#6E5C4D' }}>
            Collection{o.location ? ' · ' + o.location : ''} · {niceDate(o.date)} · {o.slot}
          </span>
        </div>
        <StatusBadge status={o.status} large />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 12 }}>
        {[
          ['WHERE IS MY ORDER?', S.now],
          ['WHAT HAPPENS NEXT?', S.next],
        ].map(([k, v]) => (
          <div key={k} style={{ padding: '18px 20px', borderRadius: 18, background: '#F8F6EC', border: '1px solid #D9CDB4', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', color: '#6E5C4D' }}>{k}</span>
            <span style={{ fontSize: 15, lineHeight: 1.45 }}>{v}</span>
          </div>
        ))}
        <div style={{ padding: '18px 20px', borderRadius: 18, background: S.act ? '#711D2C' : '#E5DCC5', color: S.act ? '#F8F6EC' : '#1E1310', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', opacity: 0.8 }}>DO I NEED TO DO ANYTHING?</span>
          <span style={{ fontSize: 15, lineHeight: 1.45, fontWeight: 600 }}>{S.act ? S.next : "Nothing right now. We'll email you when that changes."}</span>
        </div>
      </div>

      {banner && (
        <div role="status" style={{ padding: '18px 20px', borderRadius: 18, background: banner[2], color: banner[3], fontSize: 15, lineHeight: 1.5 }}>
          <strong>{banner[0]}</strong> {banner[1]}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 24, alignItems: 'start' }}>
        <section aria-label="Order progress" className="card">
          <h3 className="h-card" style={{ ...h3, marginBottom: 18 }}>
            Progress
          </h3>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {flow.map((st, i) => {
              const done = i < cur || (i === cur && i === 6), isCur = i === cur && i !== 6;
              return (
                <li key={st} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ width: 18, height: 18, borderRadius: 9, background: done ? '#3B2519' : isCur ? '#711D2C' : '#F8F6EC', border: `2px solid ${done ? '#3B2519' : isCur ? '#711D2C' : '#C7B593'}`, boxShadow: isCur ? '0 0 0 6px rgba(113,29,44,0.15)' : 'none', marginTop: 2, flex: '0 0 auto' }} />
                    <span style={{ width: 2, flex: 1, minHeight: 26, background: i === 6 ? 'transparent' : i < cur ? '#3B2519' : '#D9CDB4' }} />
                  </div>
                  <div style={{ paddingBottom: 18, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: isCur ? 700 : 500, color: done || isCur ? '#1E1310' : '#8A7A6A' }}>{flowLabels[i]}</span>
                    <span style={{ fontSize: 12, color: '#6E5C4D' }}>{when(st) || (isCur ? 'Now' : '')}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {o.status === 'awaiting_approval' && (
            <section style={{ padding: 24, borderRadius: 24, background: '#F6E6C8', color: '#4A300A', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 className="h-card" style={{ fontSize: 19.2 }}>
                TEM proposed a change
              </h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{o.proposal ?? 'TEM proposed revised details.'}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    upd((x) => {
                      const days = Math.max(3, Math.round((new Date(x.date).getTime() - Date.now()) / 864e5) + 1);
                      return pushStatus({ ...x, date: isoDay(days), total: x.total ?? x.estimate ?? est }, 'deposit_required');
                    })
                  }
                >
                  Approve revised details
                </button>
                <button type="button" className="btn btn-sm" style={{ border: '1px solid #4A300A', background: 'transparent', color: '#4A300A' }} onClick={() => upd((x) => pushStatus(x, 'cancelled'))}>
                  Decline &amp; contact TEM
                </button>
              </div>
            </section>
          )}

          {(o.status === 'deposit_required' || o.status === 'payment_failed') && (
            <section aria-label="Submit deposit" style={{ padding: 24, borderRadius: 24, background: '#1E1310', color: '#F0EED9', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <h3 className="h-card" style={{ fontSize: 19.2 }}>
                  Pay your deposit
                </h3>
                <strong className="h-card" style={{ fontSize: 23 }}>
                  {depAmt != null ? fmt(depAmt) : ''}
                </strong>
              </div>
              <div style={{ padding: 14, borderRadius: 14, background: 'rgba(245,238,227,0.08)', fontSize: 14, lineHeight: 1.55, color: '#E5DCC5' }}>
                <strong style={{ color: '#F0EED9' }}>Payment instructions</strong>
                <br />
                {settings.payment}
                <br />
                Reference: <strong style={{ color: '#F0EED9' }}>{o.ref}</strong>
              </div>
              <label className="field">
                Payment method
                <select className="input" style={{ background: '#2E1F16', color: '#F0EED9', borderColor: '#5A4838' }} value={dep.method} onChange={(e) => setDep({ ...dep, method: e.target.value })}>
                  <option>Bank transfer</option>
                  <option>Other (as instructed by TEM)</option>
                </select>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
                <label className="field">
                  Transaction reference
                  <input className="input" style={{ background: '#2E1F16', color: '#F0EED9', borderColor: dep.tried && !dep.ref.trim() ? '#E07A70' : '#5A4838' }} value={dep.ref} onChange={(e) => setDep({ ...dep, ref: e.target.value })} placeholder="From your bank" />
                </label>
                <label className="field">
                  Date paid
                  <input className="input" type="date" style={{ background: '#2E1F16', color: '#F0EED9', borderColor: '#5A4838', colorScheme: 'dark' }} value={dep.date} onChange={(e) => setDep({ ...dep, date: e.target.value })} />
                </label>
              </div>
              <label style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 20, borderRadius: 14, border: '1.5px dashed #6E5C4D', cursor: 'pointer', textAlign: 'center', fontSize: 14 }}>
                <input type="file" accept="image/*,.pdf" onChange={(e) => setDep({ ...dep, file: e.target.files?.[0]?.name ?? '' })} style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
                <strong>{dep.file ? 'Attached: ' + dep.file : 'Upload proof of payment'}</strong>
                <span style={{ fontSize: 12, color: '#C7B593' }}>Proof of payment · JPG, PNG or PDF · optional</span>
              </label>
              <button type="button" className="btn btn-cream" onClick={submitDeposit}>
                Submit payment details
              </button>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: '#C7B593' }}>Submitting details doesn&apos;t confirm your order. TEM verifies receipt first.</p>
            </section>
          )}

          <section aria-label="Payment" className="card">
            <h3 className="h-card" style={h3}>
              Payment
            </h3>
            {payRows.map(([k, v, c]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid #E5DCC5', fontSize: 14 }}>
                <span style={{ color: '#6E5C4D' }}>{k}</span>
                <strong style={{ color: c, textAlign: 'right' }}>{v}</strong>
              </div>
            ))}
          </section>

          <section aria-label="Items" className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 className="h-card" style={{ fontSize: 19.2 }}>
              Items
            </h3>
            {o.items.map((l) => (
              <div key={l.key} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, flex: '0 0 44px' }}>
                  <ProductVisual pid={l.pid} flavour={l.flavour} flat />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {l.qty} × {l.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#6E5C4D' }}>
                    {lineMeta(l)}
                    {customText(l) ? ` · “${customText(l)}”` : ''}
                  </span>
                </div>
                <span style={{ fontSize: 14 }}>{fmt(l.unit * l.qty)}</span>
              </div>
            ))}
            {DONE_STATUSES.includes(o.status) && (
              <button type="button" className="btn btn-outline" onClick={reorder}>
                Reorder these items
              </button>
            )}
          </section>

          <a href={whatsappUrl()} target="_blank" rel="noopener" className="btn" style={{ border: '1px solid #C7B593', color: '#1E1310', fontWeight: 600, fontSize: 14 }}>
            Message TEM on WhatsApp
          </a>
        </div>
      </div>

      <div style={{ padding: '16px 18px', borderRadius: 16, border: '1.5px dashed #711D2C', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#711D2C' }}>
          DEMO · simulate the bakery&apos;s side here, or open the <Link to={`/admin/orders?order=${o.ref}`}>admin back office</Link>
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {sims.map(([label, run]) => (
            <button key={label} type="button" className="btn btn-primary btn-sm" onClick={run}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
