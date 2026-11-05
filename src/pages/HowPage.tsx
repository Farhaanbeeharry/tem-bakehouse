import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { statuses, type StatusId } from '../data/catalog';

const STEPS = [
  ['Choose your cookies', 'Browse the menu, choose your type of cookies, pack size and add your personal touch.', 'Builds your order request'],
  ['Submit your request', 'Sign in, or sign in as Guest, choose a collection date and time, accept the policies and submit. You’ll get a reference number. Accepting the Order Policy is required.', 'Status: Pending Review'],
  ['TEM reviews it', 'TEM Bakehouse checks the date and items. If anything needs to change, you approve the revised details first.', 'Status: Pending Review → Deposit Required'],
  ['Pay the 50% deposit', 'Only once requested. Follow the payment instructions in your account and submit your payment details.', 'Status: Deposit Verification Pending'],
  ['Receive confirmation', 'Once your deposit is verified, your date is secured and your order is confirmed.', 'Status: Order Confirmed'],
  ['Collect & pay the balance', 'Collect from Terre Rouge or Port Louis at your chosen time and pay the remaining 50%. Delivery coming soon. This step will be updated when it launches.', 'Status: Ready for Collection → Collected'],
];

export const HowPage = () => {
  const guide = (Object.keys(statuses) as StatusId[]).filter((k) => k !== 'delivered' && k !== 'out_for_delivery');
  return (
    <main className="page" style={{ maxWidth: 1100 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>
        How to order
      </div>
      <h1 className="h-page" style={{ marginBottom: 20 }}>
        Six steps from
        <br />
        craving to collection.
      </h1>
      <p style={{ margin: '0 0 56px', maxWidth: '52ch', fontSize: 17, lineHeight: 1.6, color: '#6E5C4D' }}>
        Ordering from TEM Bakehouse is a conversation, not a checkout. Send us your request, and we&apos;ll review it and confirm every detail with you personally.
      </p>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {STEPS.map(([t, d, s], i) => (
          <li key={t} style={{ display: 'grid', gridTemplateColumns: 'clamp(64px,10vw,120px) 1fr', gap: 'clamp(16px,3vw,40px)', padding: '28px 0', borderTop: '1px solid #D9CDB4' }}>
            <span className="h-page" style={{ fontSize: 'clamp(36px,5.1vw,61px)', lineHeight: 0.8, color: '#711D2C' }}>
              {i + 1}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <strong className="h-card" style={{ fontSize: 'clamp(18px,1.9vw,25.6px)' }}>
                {t}
              </strong>
              <span style={{ fontSize: 16, lineHeight: 1.6, color: '#6E5C4D', maxWidth: '56ch' }}>{d}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#711D2C' }}>{s}</span>
            </div>
          </li>
        ))}
      </ol>
      <h2 className="h-card" style={{ margin: '72px 0 20px', fontSize: 30.7 }}>
        What each status means
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap: 10 }}>
        {guide.map((k) => (
          <div key={k} style={{ padding: 16, borderRadius: 16, background: '#F8F6EC', border: '1px solid #D9CDB4', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            <StatusBadge status={k} />
            <span style={{ fontSize: 14, lineHeight: 1.5, color: '#6E5C4D' }}>{statuses[k].now}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 56, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/cookies" className="btn btn-primary">
          Start a request
        </Link>
        <Link to="/policies/order" className="btn btn-outline">
          Read the Order Policy
        </Link>
      </div>
    </main>
  );
};
