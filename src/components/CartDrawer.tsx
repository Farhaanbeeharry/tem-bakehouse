import { useNavigate } from 'react-router-dom';
import { Cookie } from './Cookie';
import { ProductVisual } from './ProductVisual';
import { useIsMobile, useShop } from '../lib/shop';
import { useProducts } from '../lib/store';
import { fmt } from '../lib/format';
import type { OrderLine } from '../lib/store';

export const lineMeta = (l: OrderLine) => l.pack + ' · ' + (l.diet === 'gf' ? 'Gluten-free' : 'Regular');
export const customText = (l: OrderLine) => (l.custom ? [l.custom.occasion, l.custom.message].filter(Boolean).join(' · ') : '');

export const CartDrawer = () => {
  const { drawerOpen, setDrawerOpen, cart, setCart, cartCount, estimate, user, openAuth, addLine, showToast } = useShop();
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const P = useProducts();
  if (!drawerOpen) return null;

  const inCart = cart.map((l) => l.pid);
  const recs = P.filter((p) => p.status === 'available' && !inCart.includes(p.id) && !p.custom && !p.flavourPick && p.featured).slice(0, 2);

  const close = () => setDrawerOpen(false);
  const toCheckout = () => {
    close();
    if (!user) openAuth('register', true);
    else navigate('/checkout');
  };
  const browse = () => {
    close();
    navigate('/cookies');
  };

  return (
    <>
      <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(34,22,15,0.45)', zIndex: 80, animation: 'temFade .3s ease both' }} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your order request"
        style={{
          position: 'fixed',
          zIndex: 81,
          right: 0,
          bottom: 0,
          top: mobile ? 'auto' : 0,
          width: mobile ? '100%' : 'min(460px,100vw)',
          maxHeight: mobile ? '88vh' : '100vh',
          borderRadius: mobile ? '24px 24px 0 0' : 0,
          background: '#F0EED9',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-20px 0 60px rgba(34,22,15,0.25)',
          animation: 'temRise .5s var(--ease) both',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {mobile && <div style={{ width: 44, height: 4, borderRadius: 2, background: '#C7B593', margin: '10px auto 0' }} />}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #D9CDB4' }}>
          <div>
            <strong className="h-card" style={{ fontSize: 20.5 }}>
              Your order request
            </strong>
            <div style={{ fontSize: 13, color: '#6E5C4D', marginTop: 4 }}>{cartCount} items · not yet confirmed</div>
          </div>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close">
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cart.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 110, opacity: 0.6, transform: 'rotate(-18deg)' }}>
                <Cookie flavour="plain" />
              </div>
              <p className="h-card" style={{ lineHeight: 1.05 }}>
                Nothing here yet.
                <br />
                What&apos;s the moment?
              </p>
              <button type="button" className="btn btn-primary btn-sm" onClick={browse}>
                Browse cookies
              </button>
            </div>
          )}

          {cart.map((l) => {
            const ct = customText(l);
            return (
              <div key={l.key} style={{ display: 'flex', gap: 14, padding: 12, borderRadius: 18, background: '#F8F6EC', border: '1px solid #E5DCC5' }}>
                <div style={{ width: 72, flex: '0 0 72px', borderRadius: 14, background: '#E5DCC5', padding: 6, alignSelf: 'flex-start' }}>
                  <ProductVisual pid={l.pid} flavour={l.flavour} flat />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong style={{ fontSize: 15 }}>{l.name}</strong>
                    <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(l.unit * l.qty)}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#6E5C4D' }}>{lineMeta(l)}</span>
                  {ct && <span style={{ fontSize: 12, color: '#711D2C', fontStyle: 'italic' }}>“{ct}”</span>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #C7B593', borderRadius: 999, height: 36 }}>
                      <button
                        type="button"
                        aria-label={`Decrease ${l.name}`}
                        onClick={() => setCart((c) => c.map((x) => (x.key === l.key ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))}
                        style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: '#1E1310' }}
                      >
                        −
                      </button>
                      <span style={{ minWidth: 20, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{l.qty}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${l.name}`}
                        onClick={() => setCart((c) => c.map((x) => (x.key === l.key ? { ...x, qty: x.qty + 1 } : x)))}
                        style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: '#1E1310' }}
                      >
                        +
                      </button>
                    </div>
                    <button type="button" className="link-btn" onClick={() => setCart((c) => c.filter((x) => x.key !== l.key))} style={{ fontSize: 12, color: '#6E5C4D', padding: 8 }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {cart.length > 0 && recs.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', color: '#6E5C4D' }}>ADD A LITTLE EXTRA?</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {recs.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      addLine(p, { pack: p.packs[0].id });
                      showToast(p.name + ' added to your order request');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px dashed #C7B593', background: 'transparent', borderRadius: 14, padding: 8, cursor: 'pointer', textAlign: 'left', color: '#1E1310' }}
                  >
                    <div style={{ width: 40, flex: '0 0 40px' }}>
                      <ProductVisual pid={p.id} flavour={p.flavour} flat />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>+ {p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '18px 22px 22px', borderTop: '1px solid #D9CDB4', display: 'flex', flexDirection: 'column', gap: 10, background: '#F8F6EC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14 }}>Estimated total</span>
              <strong className="h-card">{fmt(estimate)}</strong>
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: '#6E5C4D' }}>
              TEM Bakehouse reviews every request and confirms the final price. A 50% deposit is requested only after acceptance.
            </p>
            <button type="button" className="btn btn-primary" style={{ minHeight: 54 }} onClick={toCheckout}>
              {user ? 'Continue to collection details' : 'Sign in to continue'}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
