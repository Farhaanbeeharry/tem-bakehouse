import { useState, type FormEvent, type ReactNode } from 'react';
import { signIn, signOut, useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

const Shell = ({ children }: { children: ReactNode }) => (
  <div className="adm" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
    <section className="adm-panel" style={{ width: 'min(400px, 100%)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h1 className="adm-h2 lg" style={{ margin: 0 }}>
        TEM Back office
      </h1>
      {children}
    </section>
  </div>
);

/** With Supabase, /admin is limited to profiles flagged is_admin. The browser-only demo stays open. */
export const AdminGate = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const { ready } = useStore();
  const [f, setF] = useState({ email: '', pw: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (!supabase) return <>{children}</>;
  if (loading) return null;

  if (!user) {
    const submit = async (e: FormEvent) => {
      e.preventDefault();
      setBusy(true);
      const error = await signIn(f.email, f.pw);
      setBusy(false);
      setErr(error ?? '');
    };
    return (
      <Shell>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label className="adm-small" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            Email
            <input className="adm-input" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
          </label>
          <label className="adm-small" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            Password
            <input className="adm-input" type="password" autoComplete="current-password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} required />
          </label>
          {err && (
            <div role="alert" className="adm-note" style={{ background: '#F3DCD8', color: '#8A2320' }}>
              {err}
            </div>
          )}
          <button type="submit" className="adm-btn primary" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </Shell>
    );
  }

  if (!user.isAdmin) {
    return (
      <Shell>
        <p style={{ margin: 0 }}>
          <strong>{user.email}</strong> doesn&apos;t have back-office access.
        </p>
        <button type="button" className="adm-btn" onClick={() => void signOut()}>
          Sign in with another account
        </button>
      </Shell>
    );
  }

  return ready ? <>{children}</> : null;
};
