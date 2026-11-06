import { useState, type FormEvent } from 'react';
import { instagramLabel, instagramUrl, site, whatsappUrl } from '../data/site';
import { useStore } from '../lib/store';

export const ContactPage = () => {
  const { settings } = useStore();
  const c = settings.contact;
  const [f, setF] = useState({ name: '', email: '', msg: '' });
  const [sent, setSent] = useState(false);
  const wa = c?.whatsapp ? `https://wa.me/${c.whatsapp.replace(/\D/g, '')}` : whatsappUrl();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 20px', borderRadius: 18, textDecoration: 'none', fontWeight: 700 } as const;
  const sub = { fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 400 } as const;

  return (
    <main className="page page-narrow" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 'clamp(28px,5vw,72px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <h1 className="h-page">Say hello.</h1>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#6E5C4D', maxWidth: '40ch' }}>
          Have a question about flavours, allergies or a special occasion? Send us a message. We&apos;re always happy to talk cookies.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href={wa} target="_blank" rel="noopener" style={{ ...row, background: '#711D2C', color: '#F8F6EC' }}>
            WhatsApp <span style={sub}>{c?.whatsapp || site.whatsappNumber || 'number to be supplied'}</span>
          </a>
          <a href={instagramUrl()} target="_blank" rel="noopener" style={{ ...row, border: '1px solid #C7B593', color: '#1E1310' }}>
            Instagram <span style={sub}>{instagramLabel()}</span>
          </a>
          <a href={site.facebookUrl || 'https://facebook.com/'} target="_blank" rel="noopener" style={{ ...row, border: '1px solid #C7B593', color: '#1E1310' }}>
            Facebook <span style={sub}>{site.facebookUrl ? 'TEM Bakehouse' : 'page link to be supplied'}</span>
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: 16, border: '1.5px dashed #C7B593', borderRadius: 16, fontSize: 13, color: '#6E5C4D' }}>
            <strong style={{ color: '#1E1310' }}>Collection location</strong>
            <br />
            {c?.address || site.collectionLocation}
          </div>
          <div style={{ padding: 16, border: '1.5px dashed #C7B593', borderRadius: 16, fontSize: 13, color: '#6E5C4D' }}>
            <strong style={{ color: '#1E1310' }}>Hours</strong>
            <br />
            {c?.hours || site.hours || 'To be supplied'}
          </div>
        </div>
      </div>
      <form onSubmit={submit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, alignSelf: 'start' }}>
        {sent ? (
          <div style={{ padding: '40px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }} role="status">
            <strong className="h-card" style={{ fontSize: 23 }}>
              Thank you, {f.name.split(' ')[0] || 'friend'}.
            </strong>
            <span style={{ fontSize: 14, color: '#6E5C4D' }}>TEM will reply by email.</span>
          </div>
        ) : (
          <>
            <label className="field">
              Name
              <input className="input alt" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
            </label>
            <label className="field">
              Email
              <input className="input alt" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
            </label>
            <label className="field">
              Message
              <textarea className="input alt" rows={6} required value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} />
            </label>
            <button type="submit" className="btn btn-primary" style={{ minHeight: 52 }}>
              Send message
            </button>
          </>
        )}
      </form>
    </main>
  );
};
