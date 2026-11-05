import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header, NAV_ITEMS } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { AuthModal } from './AuthModal';
import { useIsMobile, useShop } from '../lib/shop';
import { useAccountNav } from '../lib/useAccountNav';
import { fmt } from '../lib/format';
import { products } from '../data/catalog';

const HOME_TITLE = 'TEM Bakehouse — Made for the Moment';
const TITLES: Record<string, string> = {
  '/cookies': 'Our Cookies',
  '/checkout': 'Request details',
  '/account': 'My account',
  '/how-to-order': 'How to Order',
  '/about': 'About',
  '/gallery': 'Gallery',
  '/contact': 'Contact',
  '/policies/order': 'Order Policy',
  '/policies/media': 'Photo & Media Policy',
};

const pageTitle = (path: string) => {
  if (path === '/') return HOME_TITLE;
  const product = path.startsWith('/cookies/') && products.find((p) => p.id === path.slice(9));
  const name = product ? product.name : TITLES[path] ?? (path.startsWith('/account') ? 'My account' : path.startsWith('/submitted') ? 'Request received' : null);
  return name ? `${name} · TEM Bakehouse` : 'Page not found · TEM Bakehouse';
};

export const StoreLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mobile = useIsMobile();
  const { cart, cartCount, estimate, drawerOpen, setDrawerOpen, auth, closeAuth, toast } = useShop();
  const goAccount = useAccountNav();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.title = pageTitle(pathname);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setDrawerOpen(false);
      closeAuth();
      setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setDrawerOpen, closeAuth]);

  // Keep the page behind the drawer, sign-in dialog and mobile menu still.
  const overlay = drawerOpen || !!auth || menuOpen;
  useEffect(() => {
    if (!overlay) return;
    const html = document.documentElement, prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev;
    };
  }, [overlay]);

  const showMobileBar = mobile && cart.length > 0 && !drawerOpen && !['/checkout'].includes(pathname) && !pathname.startsWith('/submitted');

  return (
    <div style={{ minHeight: '100vh', background: '#F0EED9' }}>
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((m) => !m)} />
      <div id="main">
        <Outlet />
      </div>
      <Footer extraBottom={showMobileBar} />

      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          style={{ position: 'fixed', inset: 0, zIndex: 45, background: '#4A1019', color: '#F0EED9', padding: '96px 24px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animation: 'temRise .45s var(--ease) both' }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {NAV_ITEMS.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)} className="h-card" style={{ color: 'inherit', textDecoration: 'none', fontSize: 30.7, lineHeight: 1.1, padding: '4px 0' }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                goAccount();
              }}
              className="btn"
              style={{ border: '1px solid rgba(245,238,227,0.5)', background: 'transparent', color: '#F0EED9', minHeight: 52 }}
            >
              My account
            </button>
            <button type="button" className="btn btn-cream" style={{ minHeight: 52 }} onClick={() => {
                setMenuOpen(false);
                navigate('/cookies');
              }}
            >
              Order Now
            </button>
          </div>
        </div>
      )}

      {showMobileBar && (
        <div style={{ position: 'fixed', left: 12, right: 12, bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', zIndex: 40 }}>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#711D2C', color: '#F8F6EC', borderRadius: 999, minHeight: 58, padding: '0 22px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 14px 30px rgba(74,15,28,0.35)' }}
          >
            <span>View order request · {cartCount}</span>
            <span>{fmt(estimate)}</span>
          </button>
        </div>
      )}

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: showMobileBar ? 84 : 24,
            transform: 'translateX(-50%)',
            zIndex: 95,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: '#1E1310',
            color: '#F0EED9',
            borderRadius: 999,
            padding: '12px 12px 12px 20px',
            fontSize: 14,
            boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            animation: 'temRise .4s var(--ease) both',
            maxWidth: 'calc(100vw - 24px)',
          }}
        >
          <span>{toast}</span>
          <button type="button" onClick={() => setDrawerOpen(true)} style={{ border: 'none', background: '#F0EED9', color: '#1E1310', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            View request
          </button>
        </div>
      )}

      <CartDrawer />
      <AuthModal />
    </div>
  );
};
