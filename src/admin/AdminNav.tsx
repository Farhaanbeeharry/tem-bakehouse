import { Link, NavLink } from 'react-router-dom';
import { resetStore, useStore } from '../lib/store';
import { countIn } from './adminData';

const SECTIONS: { path: string; label: string }[] = [
  { path: '/admin', label: 'Overview' },
  { path: '/admin/orders', label: 'Orders' },
  { path: '/admin/calendar', label: 'Calendar' },
  { path: '/admin/payments', label: 'Payments' },
  { path: '/admin/products', label: 'Products' },
  { path: '/admin/customers', label: 'Customers' },
  { path: '/admin/content', label: 'Content' },
  { path: '/admin/settings', label: 'Settings' },
];

export const AdminNav = () => {
  const { orders } = useStore();
  const counts: Record<string, number> = {
    '/admin/orders': countIn(orders, ['pending_review', 'deposit_submitted']),
    '/admin/payments': countIn(orders, ['deposit_submitted']),
  };

  return (
    <nav className="adm-nav" aria-label="Back office">
      <Link to="/admin" className="adm-brand">
        <span className="adm-brand-mark">TEM</span>
        <span className="adm-brand-sub">BACK OFFICE</span>
      </Link>
      <div className="adm-nav-links">
        {SECTIONS.map((s) => (
          <NavLink key={s.path} to={s.path} end={s.path === '/admin'} className="adm-nav-link">
            <span>{s.label}</span>
            {!!counts[s.path] && (
              <span className="adm-count" aria-label={`${counts[s.path]} need attention`}>
                {counts[s.path]}
              </span>
            )}
          </NavLink>
        ))}
      </div>
      <div className="adm-nav-foot">
        <span className="adm-signed">
          Signed in as <strong>Owner</strong>
        </span>
        <Link to="/">View public site →</Link>
        <button type="button" className="adm-linkbtn" onClick={resetStore}>
          Reset demo data
        </button>
      </div>
    </nav>
  );
};
