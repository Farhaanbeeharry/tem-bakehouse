import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductVisual } from '../components/ProductVisual';
import { customText, lineMeta } from '../components/CartDrawer';
import { COLLECTION_POINTS, DEMO_CUSTOMER_ID } from '../data/catalog';
import { fmt, isoDay, niceDate } from '../lib/format';
import { useShop } from '../lib/shop';
import { nextRef, setStore, useStore, type Order, type Settings } from '../lib/store';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

type Day = { iso: string; label: string; why: string } | null;

const buildMonth = (offset: number, settings: Settings, orders: Order[]) => {
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + offset);
  const y = base.getFullYear(), m = base.getMonth();
  const first = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    if (!['declined', 'cancelled', 'expired'].includes(o.status)) counts[o.date] = (counts[o.date] || 0) + 1;
  });
  const sampleFull = isoDay(7);
  const days: Day[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= n; d++) {
    const dt = new Date(y, m, d);
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const diff = Math.round((dt.getTime() - today.getTime()) / 864e5);
    let why = '';
    if (diff < 0) why = 'Past';
    else if (diff < settings.leadDays) why = `Needs ${settings.leadDays} days' notice`;
    else if (settings.closedWeekdays.includes(dt.getDay())) why = 'Closed';
    else if (settings.holidays.includes(iso)) why = 'Holiday closure';
    else if (iso === sampleFull || (counts[iso] || 0) >= settings.dailyCapacity) why = 'Fully booked';
    days.push({ iso, label: String(d), why });
  }
  return { days, label: base.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), anyOpen: days.some((x) => x && !x.why) };
};

const SectionTitle = ({ n, children }: { n: string; children: string }) => (
  <h2 className="h-card" style={{ display: 'flex', gap: 14, alignItems: 'baseline', fontSize: 21.8 }}>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#711D2C', fontWeight: 400 }}>{n}</span>
    {children}
  </h2>
);

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, setCart, estimate, user, guest, setGuest, openAuth, setDrawerOpen } = useShop();
  const { settings, orders } = useStore();
  const [calM, setCalM] = useState(0);
  const [ck, setCk] = useState({ location: '', date: '', slot: '', name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '', notes: '', a1: false, a2: false, tried: false });
  const cal = useMemo(() => buildMonth(calM, settings, orders), [calM, settings, orders]);
  const set = (o: Partial<typeof ck>) => setCk((x) => ({ ...x, ...o }));

  if ((!user && !guest) || cart.length === 0) {
    return (
      <main className="page page-narrow" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
        <h1 className="h-page">{cart.length === 0 ? 'Your request is empty.' : 'Sign in, or sign in as Guest.'}</h1>
        <p className="lede">{cart.length === 0 ? 'Add a few cookies first, then choose your collection date.' : 'Your selections are saved. Sign in to track your order from your account, or sign in as Guest.'}</p>
        {cart.length === 0 ? (
          <Link to="/cookies" className="btn btn-primary">
            Browse cookies
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={() => openAuth('login', true)}>
              Sign in
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setGuest(true)}>
              Sign in as Guest
            </button>
          </div>
        )}
      </main>
    );
  }

  const errs: string[] = [];
  if (!ck.location) errs.push('Choose a collection point');
  if (!ck.date) errs.push('Choose a collection date');
  if (ck.date && !ck.slot) errs.push('Choose a collection time');
  if (!ck.name.trim()) errs.push('Add your name');
  if (ck.phone.replace(/\D/g, '').length < 7) errs.push('Add a phone number TEM can reach you on');
  if (!user && !/.+@.+\..+/.test(ck.email)) errs.push('Add an email address for updates');
  if (!ck.a1) errs.push('Accept the Order Policy');

  const submit = () => {
    if (errs.length) return set({ tried: true });
    const ref = nextRef(orders);
    const order: Order = {
      ref,
      customer: DEMO_CUSTOMER_ID,
      created: isoDay(0),
      date: ck.date,
      slot: ck.slot,
      method: 'collection',
      location: ck.location,
      status: 'pending_review',
      items: cart,
      notes: ck.notes,
      estimate,
      total: null,
      depositPaid: 0,
      balancePaid: 0,
      log: [{ s: 'pending_review', t: isoDay(0) }],
      internal: '',
      contactName: ck.name,
      phone: ck.phone,
      email: user?.email ?? ck.email,
      mediaConsent: ck.a2,
    };
    setStore((s) => ({ ...s, orders: [order, ...s.orders] }));
    setCart(() => []);
    navigate('/submitted/' + ref);
  };

  const closedTxt = settings.closedWeekdays.map((d) => 'Closed ' + DAY_NAMES[d]).join(' · ');

  return (
    <main className="page page-narrow" style={{ paddingTop: 'clamp(96px,10vw,120px)', paddingBottom: 120 }}>
      <button type="button" className="link-btn" style={{ fontSize: 13, color: '#6E5C4D' }} onClick={() => setDrawerOpen(true)}>
        ← Back to your request
      </button>
      <h1 className="h-page" style={{ margin: '16px 0 8px', fontSize: 'clamp(31px,3.8vw,54px)' }}>
        Request details
      </h1>
      <p className="lede" style={{ marginBottom: 40 }}>
        Nothing is charged today. TEM Bakehouse reviews your request first.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: 'clamp(24px,4vw,56px)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <section aria-label="Collection" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <SectionTitle n="01">Collection</SectionTitle>
            <div role="radiogroup" aria-label="Collection point" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
              {COLLECTION_POINTS.map((pt) => {
                const on = ck.location === pt;
                return (
                  <button
                    key={pt}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set({ location: pt })}
                    style={{ textAlign: 'left', cursor: 'pointer', border: `1.5px solid ${on ? '#711D2C' : ck.tried && !ck.location ? '#B23A33' : '#D9CDB4'}`, background: on ? '#F2E3DF' : '#F8F6EC', color: '#1E1310', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    <strong style={{ fontSize: 15 }}>Collect · {pt}</strong>
                    <span style={{ fontSize: 13, color: '#6E5C4D' }}>Exact address shared on confirmation.</span>
                  </button>
                );
              })}
              <div aria-disabled="true" style={{ border: '1.5px dashed #C7B593', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 4, color: '#8A7A6A' }}>
                <strong style={{ fontSize: 15 }}>Delivery</strong>
                <span style={{ fontSize: 13 }}>Coming soon.</span>
              </div>
            </div>

            <div style={{ border: '1px solid #D9CDB4', background: '#F8F6EC', borderRadius: 20, padding: 'clamp(14px,2vw,22px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <button type="button" className="icon-btn" aria-label="Previous month" disabled={calM === 0} onClick={() => setCalM((m) => Math.max(0, m - 1))}>
                  ←
                </button>
                <strong className="h-card" style={{ fontSize: 16.6 }}>
                  {cal.label}
                </strong>
                <button type="button" className="icon-btn" aria-label="Next month" disabled={calM === 3} onClick={() => setCalM((m) => Math.min(3, m + 1))}>
                  →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6E5C4D', textAlign: 'center', marginBottom: 6 }}>
                {WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <div role="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
                {cal.days.map((d, i) => {
                  if (!d) return <span key={'e' + i} />;
                  const sel = ck.date === d.iso, ok = !d.why;
                  const struck = d.why === 'Fully booked' || d.why === 'Holiday closure';
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      title={d.why || 'Available'}
                      aria-label={`${niceDate(d.iso)}: ${d.why || 'available'}`}
                      aria-pressed={sel}
                      disabled={!ok}
                      onClick={() => set({ date: d.iso, slot: '' })}
                      style={{
                        aspectRatio: '1 / 1',
                        minHeight: 40,
                        borderRadius: 12,
                        border: `1px solid ${sel ? '#711D2C' : ok ? '#D9CDB4' : 'transparent'}`,
                        background: sel ? '#711D2C' : ok ? '#F8F6EC' : 'transparent',
                        color: sel ? '#F8F6EC' : ok ? '#1E1310' : '#B8A894',
                        textDecoration: struck ? 'line-through' : 'none',
                        cursor: ok ? 'pointer' : 'not-allowed',
                        fontSize: 14,
                        fontWeight: 600,
                        padding: 0,
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 14, fontSize: 12, color: '#6E5C4D' }}>
                <span>Minimum notice: {settings.leadDays} days</span>
                {closedTxt && <span>{closedTxt}</span>}
                <span>
                  <span style={{ textDecoration: 'line-through' }}>12</span> = fully booked or holiday
                </span>
              </div>
              {!cal.anyOpen && (
                <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: '#F6E6C8', color: '#7A4E0E', fontSize: 14 }}>
                  No collection dates left this month.{' '}
                  <button type="button" className="link-btn" style={{ fontWeight: 700 }} onClick={() => setCalM((m) => Math.min(3, m + 1))}>
                    See next month
                  </button>
                </div>
              )}
            </div>

            {ck.date && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <strong style={{ fontSize: 14 }}>Collection time on {niceDate(ck.date)}</strong>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {settings.slots.map((t) => {
                    const on = ck.slot === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set({ slot: t })}
                        style={{ border: `1.5px solid ${on ? '#711D2C' : '#D9CDB4'}`, background: on ? '#711D2C' : '#F8F6EC', color: on ? '#F8F6EC' : '#1E1310', borderRadius: 999, padding: '11px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <section aria-label="Your details" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SectionTitle n="02">Your details</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
              <label className="field">
                Full name
                <input className={`input ${ck.tried && !ck.name.trim() ? 'invalid' : ''}`} value={ck.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" />
              </label>
              <label className="field">
                Phone / WhatsApp
                <input
                  className={`input ${ck.tried && ck.phone.replace(/\D/g, '').length < 7 ? 'invalid' : ''}`}
                  value={ck.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+230"
                />
              </label>
            </div>
            {user ? (
              <label className="field">
                Email
                <input className="input" value={user.email} readOnly />
              </label>
            ) : (
              <label className="field">
                <span>
                  Email <span className="hint">Ordering as a guest — updates are sent here</span>
                </span>
                <input
                  className={`input ${ck.tried && !/.+@.+\..+/.test(ck.email) ? 'invalid' : ''}`}
                  type="email"
                  value={ck.email}
                  onChange={(e) => set({ email: e.target.value })}
                  autoComplete="email"
                  placeholder="you@example.mu"
                />
              </label>
            )}
            <label className="field">
              <span>
                Notes for TEM <span className="hint">Optional</span>
              </span>
              <textarea className="input" rows={3} value={ck.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Anything TEM should know about your request" />
            </label>
          </section>

          <section aria-label="Policies" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SectionTitle n="03">Policies</SectionTitle>
            <label className="check">
              <input type="checkbox" checked={ck.a1} onChange={() => set({ a1: !ck.a1 })} />
              <span>
                I have read and accept the{' '}
                <Link to="/policies/order" target="_blank">
                  Order Policy
                </Link>
                . <span style={{ color: '#711D2C' }}>(required)</span>
              </span>
            </label>
            <label className="check">
              <input type="checkbox" checked={ck.a2} onChange={() => set({ a2: !ck.a2 })} />
              <span>
                I have read and accept the{' '}
                <Link to="/policies/media" target="_blank">
                  Photo &amp; Media Policy
                </Link>
                .
              </span>
            </label>
            {ck.tried && errs.length > 0 && (
              <div role="alert" style={{ padding: '14px 16px', borderRadius: 14, background: '#F3DCD8', color: '#8A2320', fontSize: 14, lineHeight: 1.6 }}>
                <strong>Almost there:</strong>
                {errs.map((e) => (
                  <div key={e}>· {e}</div>
                ))}
              </div>
            )}
            <button type="button" className="btn btn-primary" style={{ minHeight: 56, fontSize: 16 }} onClick={submit}>
              Submit Order Request
            </button>
            <p style={{ margin: 0, fontSize: 12, color: '#6E5C4D' }}>Submitting sends your request for review. It is not a confirmed order.</p>
          </section>
        </div>

        <aside style={{ position: 'sticky', top: 90, borderRadius: 24, background: '#1E1310', color: '#F0EED9', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <strong className="h-card">Your request</strong>
          {cart.map((l) => (
            <div key={l.key} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, flex: '0 0 48px' }}>
                <ProductVisual pid={l.pid} flavour={l.flavour} flat />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {l.qty} × {l.name}
                </span>
                <span style={{ fontSize: 12, color: '#C7B593' }}>{lineMeta(l)}</span>
                {customText(l) && <span style={{ fontSize: 12, color: '#F1C9C9', fontStyle: 'italic' }}>“{customText(l)}”</span>}
              </div>
              <span style={{ fontSize: 14 }}>{fmt(l.unit * l.qty)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(245,238,227,0.18)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated total</span>
              <strong>{fmt(estimate)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C7B593', gap: 12 }}>
              <span>Deposit ({settings.depositPct}%) — later, once accepted</span>
              <span>≈ {fmt((estimate * settings.depositPct) / 100)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C7B593' }}>
              <span>Due today</span>
              <span>Rs 0</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: '#C7B593' }}>The final amount is approved by TEM Bakehouse after review.</p>
        </aside>
      </div>
    </main>
  );
};
