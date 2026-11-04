import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useIsMobile, useShop } from '../lib/shop';
import { useAccountNav } from '../lib/useAccountNav';

export const NAV_ITEMS = [
  { label: 'Our Cookies', to: '/cookies' },
  { label: 'How to Order', to: '/how-to-order' },
  { label: 'About', to: '/about' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

type Props = { menuOpen: boolean; onToggleMenu: () => void };

export const Header = ({ menuOpen, onToggleMenu }: Props) => {
  const { pathname } = useLocation();
  const mobile = useIsMobile();
  const { cartCount, setDrawerOpen, user } = useShop();
  const goAccount = useAccountNav();
  const [overDark, setOverDark] = useState(pathname === '/');

  useEffect(() => {
    if (pathname !== '/') {
      setOverDark(false);
      return;
    }
    const check = () => {
      let dark = false;
      document.querySelectorAll('[data-dark]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < 70 && r.bottom > 70) dark = true;
      });
      setOverDark(dark);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [pathname]);

  const dark = overDark || menuOpen;
  const fg = dark ? '#F0EED9' : '#1E1310';

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: 'calc(14px + env(safe-area-inset-top, 0px)) var(--gutter) 14px',
        background: dark ? 'rgba(74,15,28,0)' : 'rgba(245,238,227,0.9)',
        color: fg,
        borderBottom: `1px solid ${dark ? 'rgba(245,238,227,0)' : '#D9CDB4'}`,
        backdropFilter: dark ? 'none' : 'blur(14px)',
        WebkitBackdropFilter: dark ? 'none' : 'blur(14px)',
        transition: 'background .4s ease, color .4s ease, border-color .4s ease',
      }}
    >
      <Link to="/" aria-label="TEM Bakehouse home" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit', textDecoration: 'none' }}>
        <Logo style={{ height: 20, width: 'auto' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.28em', opacity: 0.8 }}>BAKEHOUSE</span>
      </Link>

      {!mobile && (
        <nav aria-label="Main" style={{ display: 'flex', gap: 28, fontSize: 14, fontWeight: 500 }}>
          {NAV_ITEMS.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              style={({ isActive }) => ({
                color: 'inherit',
                textDecoration: 'none',
                padding: '6px 0',
                whiteSpace: 'nowrap',
                borderBottom: `1px solid ${isActive ? 'currentColor' : 'transparent'}`,
              })}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!mobile && (
          <button
            type="button"
            onClick={goAccount}
            style={{ all: 'unset', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '8px 12px', whiteSpace: 'nowrap' }}
          >
            {user ? 'My account' : 'Sign in'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label={`Open order request, ${cartCount} items`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: `1px solid ${fg}`,
            background: 'transparent',
            color: 'inherit',
            borderRadius: 999,
            padding: '9px 16px 9px 18px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span>{mobile ? 'Request' : 'Order request'}</span>
          <span
            style={{
              minWidth: 22,
              height: 22,
              borderRadius: 11,
              background: dark ? '#F0EED9' : '#711D2C',
              color: dark ? '#4A1019' : '#F8F6EC',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              padding: '0 6px',
            }}
          >
            {cartCount}
          </span>
        </button>
        {mobile && (
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{ width: 44, height: 44, borderRadius: 22, border: `1px solid ${fg}`, background: 'transparent', color: 'inherit', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            {menuOpen ? (
              <span style={{ fontSize: 20, lineHeight: 1 }}>×</span>
            ) : (
              <span style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ width: 16, height: 1.5, background: 'currentColor' }} />
                <span style={{ width: 16, height: 1.5, background: 'currentColor' }} />
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
