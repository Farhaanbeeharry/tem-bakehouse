import { useState, type FormEvent } from 'react';
import { useSiteContact } from '../lib/contact';
import { supabase } from '../lib/supabase';

export const ContactPage = () => {
  const c = useSiteContact();
  const [f, setF] = useState({ name: '', email: '', msg: '', website: '' });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    // Browser-only demo: nothing to send to.
    if (!supabase) return setSent(true);
    setBusy(true);
    setErr('');
    const { error } = await supabase.functions.invoke('contact-message', { body: { name: f.name, email: f.email, message: f.msg, website: f.website } });
    setBusy(false);
    if (error) {
      const detail = await (error as { context?: Response }).context?.json?.().catch(() => null);
      setErr(detail?.error ?? 'Your message couldn’t be sent. Please try again, or reach us on WhatsApp.');
      return;
    }
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
          {c.whatsappUrl && (
            <a href={c.whatsappUrl} target="_blank" rel="noopener" style={{ ...row, background: '#711D2C', color: '#F8F6EC' }}>
              WhatsApp <span style={sub}>{c.whatsapp}</span>
            </a>
          )}
          {c.instagramUrl && (
            <a href={c.instagramUrl} target="_blank" rel="noopener" style={{ ...row, border: '1px solid #C7B593', color: '#1E1310' }}>
              Instagram <span style={sub}>@{c.instagram}</span>
            </a>
          )}
          {c.facebookUrl && (
            <a href={c.facebookUrl} target="_blank" rel="noopener" style={{ ...row, border: '1px solid #C7B593', color: '#1E1310' }}>
              Facebook <span style={sub}>TEM Bakehouse</span>
            </a>
          )}
          {c.tiktokUrl && (
            <a href={c.tiktokUrl} target="_blank" rel="noopener" style={{ ...row, border: '1px solid #C7B593', color: '#1E1310' }}>
              TikTok <span style={sub}>@{c.tiktok}</span>
            </a>
          )}
          {c.email && (
            <a href={`mailto:${c.email}`} style={{ ...row, border: '1px solid #C7B593', color: '#1E1310' }}>
              Email <span style={sub}>{c.email}</span>
            </a>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: 16, border: '1.5px dashed #C7B593', borderRadius: 16, fontSize: 13, color: '#6E5C4D' }}>
            <strong style={{ color: '#1E1310' }}>Collection location</strong>
            <br />
            {c.address}
          </div>
          <div style={{ padding: 16, border: '1.5px dashed #C7B593', borderRadius: 16, fontSize: 13, color: '#6E5C4D' }}>
            <strong style={{ color: '#1E1310' }}>Hours</strong>
            <br />
            {c.hours || 'By appointment'}
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
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
            {err && (
              <p role="alert" style={{ margin: 0, fontSize: 14, color: '#9B2C2C' }}>
                {err}
              </p>
            )}
            <button type="submit" className="btn btn-primary" style={{ minHeight: 52 }} disabled={busy}>
              {busy ? 'Sending…' : 'Send message'}
            </button>
          </>
        )}
      </form>
    </main>
  );
};
