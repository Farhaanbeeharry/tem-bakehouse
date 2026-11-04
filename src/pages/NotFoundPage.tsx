import { Link } from 'react-router-dom';
import { Cookie } from '../components/Cookie';

export const NotFoundPage = () => (
  <main className="page page-narrow" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center' }}>
    <div style={{ width: 140, transform: 'rotate(-18deg)', opacity: 0.7 }}>
      <Cookie flavour="plain" />
    </div>
    <h1 className="h-page">Crumbs.</h1>
    <p className="lede">That page has been eaten. Let&apos;s get you back to the cookies.</p>
    <Link to="/cookies" className="btn btn-primary">
      Our cookies
    </Link>
  </main>
);
