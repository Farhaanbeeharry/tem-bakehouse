import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { StatusBadge } from '../components/StatusBadge';
import { DEMO_CUSTOMER_ID, DONE_STATUSES, statuses } from '../data/catalog';
import { fmt, niceDate } from '../lib/format';
import { useShop } from '../lib/shop';
import { estimateOf, useProducts, useStore, type Order } from '../lib/store';
import { OrderDetail } from './account/OrderDetail';

const TABS = [
  ['overview', 'Overview'],
  ['orders', 'My Orders'],
  ['favs', 'Favourites'],
  ['profile', 'Profile'],
] as const;

const OrderRow = ({ o }: { o: Order }) => {
  const S = statuses[o.status];
  const summary = o.items.map((l) => l.qty + '× ' + l.name).join(', ');
  return (
    <Link
      to={'/account/orders/' + o.ref}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', gap: 14, alignItems: 'center', padding: '20px 22px', borderRadius: 20, background: '#F8F6EC', border: `1px solid ${S.act ? '#711D2C' : '#D9CDB4'}`, color: '#1E1310', textDecoration: 'none' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <strong style={{ fontSize: 16 }}>{o.ref}</strong>
        <span style={{ fontSize: 13, color: '#6E5C4D' }}>Requested {niceDate(o.created)}</span>
      </div>
      <span style={{ fontSize: 14 }}>{summary.length > 60 ? summary.slice(0, 58) + '…' : summary}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{o.total != null ? fmt(o.total) : 'Est. ' + fmt(o.estimate ?? estimateOf(o.items))}</span>
        <span style={{ fontSize: 12, color: '#6E5C4D' }}>For {niceDate(o.date)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
        <StatusBadge status={o.status} />
        <span style={{ fontSize: 12, color: '#6E5C4D' }}>{S.act ? 'Action needed' : S.who === 'TEM' ? 'With TEM' : ''}</span>
      </div>
    </Link>
  );
};

export const AccountPage = () => {
  const { ref } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser, openAuth, favs, showToast, verifyBanner, setVerifyBanner } = useShop();
  const { orders } = useStore();
  const P = useProducts();
  const [profile, setProfile] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });

  if (!user) {
    return (
      <main className="page page-narrow" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
        <h1 className="h-page">Every order, in one place.</h1>
        <p className="lede" style={{ maxWidth: '44ch' }}>
          Sign in to track your requests, submit deposits and reorder your favourites.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => openAuth('login')}>
            Sign in
          </button>
          <button type="button" className="btn btn-outline" onClick={() => openAuth('register')}>
            Create account
          </button>
        </div>
      </main>
    );
  }

  const tab = ref ? 'orders' : (params.get('tab') ?? 'overview');
  const mine = orders.filter((o) => o.customer === DEMO_CUSTOMER_ID).sort((a, b) => (b.created + b.ref).localeCompare(a.created + a.ref));
  // Only the signed-in customer's own orders, never someone else's by reference.
  const detail = ref ? mine.find((o) => o.ref === ref) : undefined;
  const active = mine.filter((o) => !DONE_STATUSES.includes(o.status));
  const needsAction = mine.filter((o) => statuses[o.status].act);

  return (
    <main className="page page-narrow" style={{ paddingTop: 'clamp(96px,10vw,120px)', paddingBottom: 120 }}>
      {verifyBanner && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '14px 18px', borderRadius: 16, background: '#F6E6C8', color: '#7A4E0E', fontSize: 14, marginBottom: 24 }}>
          <span>
            Verify your email — we sent a link to <strong>{user.email}</strong>.
          </span>
          <button type="button" className="link-btn" style={{ fontWeight: 700 }} onClick={() => setVerifyBanner(false)}>
            Dismiss
          </button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <h1 className="h-page" style={{ fontSize: 'clamp(31px,3.8vw,56px)', lineHeight: 0.9 }}>
            Hello, {user.name.split(' ')[0]}.
          </h1>
        </div>
        <button
          type="button"
          className="btn btn-sm"
          style={{ border: '1px solid #C7B593', background: 'transparent', color: '#1E1310', fontWeight: 500 }}
          onClick={() => {
            setUser(null);
            navigate('/');
          }}
        >
          Sign out
        </button>
      </div>

      <div role="tablist" className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', overflowY: 'hidden', boxShadow: 'inset 0 -1px 0 #D9CDB4', marginBottom: 32 }}>
        {TABS.map(([id, label]) => {
          const on = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => (ref ? navigate('/account?tab=' + id) : setParams({ tab: id }))}
              style={{ flex: '0 0 auto', border: 'none', background: 'transparent', padding: '14px 16px', fontSize: 15, fontWeight: 600, cursor: 'pointer', color: on ? '#1E1310' : '#6E5C4D', boxShadow: `inset 0 -2px 0 ${on ? '#711D2C' : 'transparent'}`, minHeight: 48 }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {ref && detail && <OrderDetail o={detail} />}
      {ref && !detail && (
        <p className="lede">
          We couldn&apos;t find order {ref}. <Link to="/account?tab=orders">See all orders</Link>
        </p>
      )}

      {!ref && tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 20 }}>
          {needsAction.map((o) => (
            <Link key={o.ref} to={'/account/orders/' + o.ref} style={{ borderRadius: 24, background: '#711D2C', color: '#F0EED9', padding: 26, display: 'flex', flexDirection: 'column', gap: 12, textDecoration: 'none' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.16em', color: '#F1C9C9' }}>ACTION NEEDED · {o.ref}</span>
              <strong className="h-card" style={{ fontSize: 21.8 }}>
                {statuses[o.status].label}
              </strong>
              <span style={{ fontSize: 14, color: '#E5DCC5' }}>{statuses[o.status].next}</span>
              <span style={{ fontSize: 14, fontWeight: 700, textDecoration: 'underline' }}>Open order →</span>
            </Link>
          ))}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.16em', color: '#6E5C4D' }}>IN PROGRESS</span>
            {active.slice(0, 4).map((o) => (
              <Link key={o.ref} to={'/account/orders/' + o.ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #E5DCC5', color: '#1E1310', textDecoration: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <strong style={{ fontSize: 15 }}>{o.ref}</strong>
                  <span style={{ fontSize: 13, color: '#6E5C4D' }}>For {niceDate(o.date)}</span>
                </div>
                <StatusBadge status={o.status} />
              </Link>
            ))}
            {active.length === 0 && <p style={{ margin: 0, fontSize: 14, color: '#6E5C4D' }}>No orders in progress.</p>}
          </div>
          <Link to="/cookies" style={{ borderRadius: 24, border: '1.5px dashed #C7B593', padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, minHeight: 160, color: '#1E1310', textDecoration: 'none' }}>
            <strong className="h-card" style={{ fontSize: 20.5 }}>
              Start a new request
            </strong>
            <span style={{ fontSize: 14, color: '#6E5C4D' }}>Browse the menu →</span>
          </Link>
        </div>
      )}

      {!ref && tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mine.map((o) => (
            <OrderRow key={o.ref} o={o} />
          ))}
          {mine.length === 0 && (
            <div className="h-card" style={{ padding: '60px 0', textAlign: 'center', fontSize: 20.5 }}>
              No orders yet. <Link to="/cookies">Make the first one.</Link>
            </div>
          )}
        </div>
      )}

      {!ref && tab === 'favs' && (
        <>
          <div className="product-grid">
            {P.filter((p) => favs.includes(p.id)).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
          {favs.length === 0 && (
            <div style={{ padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <p className="h-card" style={{ fontSize: 21.8 }}>
                No favourites yet.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#6E5C4D' }}>Tap ♡ on any cookie to keep it here for next time.</p>
              <Link to="/cookies" className="btn btn-primary btn-sm">
                Browse cookies
              </Link>
            </div>
          )}
        </>
      )}

      {!ref && tab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 24, alignItems: 'start' }}>
          <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 className="h-card" style={{ fontSize: 19.2 }}>
              Contact details
            </h3>
            <label className="field">
              Full name
              <input className="input alt" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </label>
            <label className="field">
              Email
              <input className="input" value={user.email} readOnly />
            </label>
            <label className="field">
              Phone / WhatsApp
              <input className="input alt" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+230" />
            </label>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ minHeight: 48 }}
              onClick={() => {
                setUser({ ...user, name: profile.name.trim() || user.name, phone: profile.phone });
                showToast('Profile saved');
              }}
            >
              Save changes
            </button>
          </section>
          <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 className="h-card" style={{ fontSize: 19.2 }}>
              Saved addresses
            </h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#6E5C4D' }}>Delivery isn&apos;t available yet. Addresses saved here will be offered at checkout once TEM turns delivery on.</p>
            <button type="button" disabled style={{ border: '1.5px dashed #C7B593', background: 'transparent', borderRadius: 14, minHeight: 56, fontSize: 14, fontWeight: 600, color: '#8A7A6A' }}>
              + Add an address
            </button>
            <h3 className="h-card" style={{ fontSize: 19.2, marginTop: 10 }}>
              Security
            </h3>
            <button type="button" className="btn btn-outline btn-sm" style={{ minHeight: 46 }} onClick={() => openAuth('reset')}>
              Change password
            </button>
            <label className="check" style={{ fontSize: 14, alignItems: 'center' }}>
              <input type="checkbox" defaultChecked />
              Email me about order updates
            </label>
          </section>
        </div>
      )}
    </main>
  );
};
