import { Link, useParams } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';

const HEADINGS = ['Requests and review', 'Deposits', 'Changes to an order', 'Cancellations', 'Collection', 'Allergens'];

export const PolicyPage = () => {
  const { kind } = useParams();
  if (kind !== 'order' && kind !== 'media') return <NotFoundPage />;
  const isOrder = kind === 'order';
  const title = isOrder ? 'Order Policy' : 'Photo & Media Policy';
  return (
    <main className="page" style={{ maxWidth: 880 }}>
      <div className="pill-tabs" style={{ marginBottom: 32, maxWidth: 480 }}>
        <Link to="/policies/order" className={isOrder ? 'on' : ''} style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: '#1E1310', borderRadius: 999, padding: 11, fontSize: 14, fontWeight: 700, background: isOrder ? '#F8F6EC' : 'transparent' }}>
          Order Policy
        </Link>
        <Link to="/policies/media" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: '#1E1310', borderRadius: 999, padding: 11, fontSize: 14, fontWeight: 700, background: !isOrder ? '#F8F6EC' : 'transparent' }}>
          Photo &amp; Media Policy
        </Link>
      </div>
      <h1 className="h-page" style={{ marginBottom: 10, fontSize: 'clamp(33px,4.5vw,61px)' }}>
        {title}
      </h1>
      <p style={{ margin: '0 0 32px', fontSize: 14, color: '#6E5C4D' }}>Last updated: to be set by TEM</p>
      <div className="placeholder-box" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 28 }}>
        <span className="placeholder-tag">CLIENT-SUPPLIED CONTENT · EDITED IN ADMIN → CONTENT</span>
        <p style={{ margin: 0 }}>The full text of the {title} goes here, exactly as provided by TEM Bakehouse. {isOrder ? 'Terms covering deposits, changes, cancellations and refunds are not written by the design team.' : 'How TEM Bakehouse may photograph orders and share them on its website and social channels.'}</p>
        {isOrder && (
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {HEADINGS.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
};
