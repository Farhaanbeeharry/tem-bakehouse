import { Link, useParams } from 'react-router-dom';
import { MEDIA_POLICY, ORDER_POLICY } from '../data/policies';
import { NotFoundPage } from './NotFoundPage';

export const PolicyPage = () => {
  const { kind } = useParams();
  if (kind !== 'order' && kind !== 'media') return <NotFoundPage />;
  const isOrder = kind === 'order';
  const policy = isOrder ? ORDER_POLICY : MEDIA_POLICY;
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
        {policy.title}
      </h1>
      {policy.updated && <p style={{ margin: '0 0 8px', fontSize: 14, color: '#6E5C4D' }}>Last updated: {policy.updated}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '20px 0 0', fontSize: 16, lineHeight: 1.65, color: '#3B2519' }}>
        {policy.intro?.map((t) => (
          <p key={t} style={{ margin: 0 }}>
            {t}
          </p>
        ))}
      </div>
      <ol style={{ listStyle: 'none', margin: '32px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
        {policy.sections.map((s, i) => (
          <li key={s.title} style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 24, borderTop: '1px solid #D9CDB4' }}>
            <h2 className="h-card" style={{ margin: 0, fontSize: 22, display: 'flex', gap: 14, alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: '#711D2C', fontWeight: 500 }}>{String(i + 1).padStart(2, '0')}</span>
              {s.title}
            </h2>
            {s.paragraphs.map((t) => (
              <p key={t} style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: '#3B2519' }}>
                {t}
              </p>
            ))}
          </li>
        ))}
      </ol>
      <p style={{ margin: '48px 0 0', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 24, color: '#711D2C' }}>
        {isOrder ? 'Thank you for trusting TEM Bakehouse. Made for the moment.' : 'TEM Bakehouse · Since 2023 · Made for the moment.'}
      </p>
    </main>
  );
};
