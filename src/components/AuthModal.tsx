import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookie } from './Cookie';
import { useIsMobile, useShop, type AuthMode } from '../lib/shop';

const TITLES: Record<AuthMode, [string, string]> = {
  login: ['Welcome back', 'Sign in'],
  register: ['Create your account', 'Create account & continue'],
  forgot: ['Reset password', 'Send reset link'],
  sent: ['Check your inbox', 'Open reset link (demo)'],
  reset: ['Choose a new password', 'Save new password'],
};

export const AuthModal = () => {
  const { auth: mode, authPending, openAuth, closeAuth, setUser, setGuest, showToast, cart, setVerifyBanner } = useShop();
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', email: '', pw: '' });
  const [err, setErr] = useState('');
  if (!mode) return null;

  const go = (m: AuthMode) => {
    setErr('');
    openAuth(m, authPending);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const emailOk = /.+@.+\..+/.test(f.email);
    if (mode === 'forgot') return emailOk ? go('sent') : setErr('Enter a valid email address.');
    if (mode === 'sent') {
      setF({ ...f, pw: '' });
      return go('reset');
    }
    if (mode === 'reset') {
      if (f.pw.length < 8) return setErr('Use at least 8 characters.');
      showToast('Password updated. You can sign in now.');
      return go('login');
    }
    if (mode === 'register' && !f.name.trim()) return setErr('Add your name.');
    if (!emailOk) return setErr('Enter a valid email address.');
    if (f.pw.length < 8) return setErr('Password needs at least 8 characters.');
    setUser({ name: f.name.trim() || 'Demo Customer', email: f.email, phone: '' });
    setVerifyBanner(mode === 'register');
    setF({ name: '', email: '', pw: '' });
    setErr('');
    closeAuth();
    showToast(authPending ? 'Signed in — your request is just as you left it.' : 'Signed in');
    if (authPending) navigate('/checkout');
  };

  const [title, cta] = TITLES[mode];

  const asGuest = () => {
    setGuest(true);
    setErr('');
    closeAuth();
    navigate('/checkout');
  };

  return (
    <>
      <div onClick={closeAuth} style={{ position: 'fixed', inset: 0, background: 'rgba(34,22,15,0.55)', zIndex: 90, animation: 'temFade .3s ease both' }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'fixed',
          zIndex: 91,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 'min(880px, calc(100vw - 24px))',
          maxHeight: 'calc(100vh - 24px)',
          overflow: 'auto',
          borderRadius: 28,
          background: '#F0EED9',
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1fr 1.15fr',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        }}
      >
        {!mobile && (
          <div style={{ position: 'relative', background: '#711D2C', color: '#F0EED9', padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24, overflow: 'hidden', minHeight: 480 }}>
            <div style={{ position: 'absolute', right: '-30%', bottom: '-20%', width: '110%', opacity: 0.9, transform: 'rotate(24deg)' }}>
              <Cookie flavour="red-velvet" />
            </div>
            <span className="h-card" style={{ position: 'relative', fontSize: 25.6 }}>
              TEM
            </span>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <strong className="h-card" style={{ fontSize: 23 }}>
                {authPending ? 'One step from your request.' : 'Every order, in one place.'}
              </strong>
              <span style={{ fontSize: 14, color: '#E5DCC5' }}>
                {authPending
                  ? 'Sign in, create an account, or sign in as a guest. Your selections stay exactly as they are.'
                  : 'Track requests, deposits and collections from your account.'}
              </span>
            </div>
          </div>
        )}
        <form onSubmit={submit} noValidate style={{ padding: 'clamp(24px,4vw,44px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong className="h-card" style={{ fontSize: 24.3 }}>
              {title}
            </strong>
            <button type="button" className="icon-btn" onClick={closeAuth} aria-label="Close">
              ×
            </button>
          </div>
          {authPending && cart.length > 0 && (
            <div style={{ padding: '12px 14px', borderRadius: 14, background: '#E5DCC5', fontSize: 14 }}>
              Your {cart.reduce((a, l) => a + l.qty, 0)} selected items are saved and waiting for you.
            </div>
          )}
          {(mode === 'login' || mode === 'register') && (
            <div className="pill-tabs">
              <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => go('login')}>
                Sign in
              </button>
              <button type="button" className={mode === 'register' ? 'on' : ''} onClick={() => go('register')}>
                Create account
              </button>
            </div>
          )}
          {mode === 'register' && (
            <label className="field">
              Full name
              <input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
            </label>
          )}
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <label className="field">
              Email
              <input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" placeholder="you@example.mu" />
            </label>
          )}
          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <label className="field">
              {mode === 'reset' ? 'New password' : 'Password'}
              <input
                className="input"
                type="password"
                value={f.pw}
                onChange={(e) => setF({ ...f, pw: e.target.value })}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="At least 8 characters"
              />
            </label>
          )}
          {mode === 'sent' && (
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
              If an account exists for <strong>{f.email}</strong>, a reset link is on its way. The link opens the password reset screen.
            </p>
          )}
          {err && (
            <div role="alert" style={{ fontSize: 13, color: '#8A2320', background: '#F3DCD8', padding: '10px 12px', borderRadius: 10 }}>
              {err}
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ minHeight: 52 }}>
            {cta}
          </button>
          {authPending && (mode === 'login' || mode === 'register') && (
            <>
              <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#8A7A6A' }}>
                <span style={{ flex: 1, height: 1, background: '#D9CDB4' }} />
                or
                <span style={{ flex: 1, height: 1, background: '#D9CDB4' }} />
              </div>
              <button type="button" className="btn btn-outline" style={{ minHeight: 52 }} onClick={asGuest}>
                Sign in as Guest
              </button>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', fontSize: 13 }}>
            <button type="button" className="link-btn" style={{ color: '#711D2C' }} onClick={() => go(mode === 'login' ? 'forgot' : 'login')}>
              {mode === 'login' ? 'Forgot password?' : mode === 'register' ? 'Already have an account?' : 'Back to sign in'}
            </button>
            <button type="button" className="link-btn" style={{ color: '#6E5C4D' }} onClick={closeAuth}>
              Continue browsing
            </button>
          </div>
          <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#8A7A6A' }}>
            DEMO · any valid-looking email and 8+ character password signs you in. No real account is created.
          </p>
        </form>
      </div>
    </>
  );
};
