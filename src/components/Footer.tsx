import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { NAV_ITEMS } from './Header';
import { useSiteContact } from '../lib/contact';

const linkStyle = { color: '#E5DCC5', textDecoration: 'none' } as const;

export const Footer = ({ extraBottom }: { extraBottom: boolean }) => {
  const c = useSiteContact();
  // Only the channels TEM has filled in (back office → Settings → Store contact).
  const social = [
    ['Instagram', c.instagramUrl],
    ['Facebook', c.facebookUrl],
    ['TikTok', c.tiktokUrl],
    ['WhatsApp', c.whatsappUrl],
  ].filter(([, url]) => url);
  return (
    <footer style={{ background: '#1E1310', color: '#E5DCC5', padding: `clamp(56px,8vw,96px) var(--gutter) ${extraBottom ? '100px' : '32px'}` }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,180px),1fr))', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, gridColumn: 'span 2', minWidth: 0 }}>
          <Logo style={{ width: 120, color: '#F0EED9' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22 }}>Made for the Moment.</span>
          <span style={{ fontSize: 13, color: '#C7B593' }}>TEM Bakehouse · Mauritius</span>
        </div>
        <nav aria-label="Footer" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
          {NAV_ITEMS.map((n) => (
            <Link key={n.to} to={n.to} style={linkStyle}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
          <Link to="/policies/order" style={linkStyle}>
            Order Policy
          </Link>
          <Link to="/policies/media" style={linkStyle}>
            Photo &amp; Media Policy
          </Link>
          {social.map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noopener" style={linkStyle}>
              {label}
            </a>
          ))}
        </div>
      </div>
      <div
        style={{
          maxWidth: 1320,
          margin: '48px auto 0',
          paddingTop: 20,
          borderTop: '1px solid #3B2519',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: '#8A7A6A',
        }}
      >
        <span>© {new Date().getFullYear()} TEM Bakehouse</span>
        <a
          className="dev-credit"
          href="https://stylotech.mu"
          target="_blank"
          rel="noopener"
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 12, letterSpacing: '.02em', color: 'inherit', textDecoration: 'none' }}
        >
          <span>Designed and developed by</span>
          <img src="/stylotech-logo.webp" alt="StyloTech" width="67" height="18" loading="lazy" style={{ display: 'block', height: 18, width: 'auto' }} />
        </a>
      </div>
    </footer>
  );
};
