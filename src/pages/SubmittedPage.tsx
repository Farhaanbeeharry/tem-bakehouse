import { useMemo, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShop } from '../lib/shop';

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const COLS = ['#C68B52', '#A8703F', '#3A2116', '#5B3524', '#D8AD73', '#2A160E'];

export const SubmittedPage = () => {
  const { ref } = useParams();
  const navigate = useNavigate();
  const { user } = useShop();
  const crumbs = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 26 }, (_, i) => {
      const s = 0.5 + r() * (i % 5 === 0 ? 3.2 : 1.6);
      return {
        left: 4 + ((i * 37) % 92),
        w: s.toFixed(2) + 'vmin',
        h: (s * (0.7 + r() * 0.4)).toFixed(2) + 'vmin',
        br: `${40 + r() * 30}% ${50 + r() * 30}% ${35 + r() * 30}% ${50 + r() * 20}%`,
        col: COLS[Math.floor(r() * COLS.length)],
        dx: ((r() * 2 - 1) * 24).toFixed(1) + 'vw',
        rot: Math.round(r() * 540 - 270) + 'deg',
        dur: 2.6 + (i % 5) * 0.5,
        delay: (i % 9) * 0.12,
      };
    });
  }, []);

  return (
    <main style={{ position: 'relative', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '120px var(--gutter) 80px', background: '#4A1019', color: '#F0EED9', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {crumbs.map((c, i) => (
          <span
            key={i}
            style={
              {
                position: 'absolute',
                left: c.left + '%',
                top: 0,
                width: c.w,
                height: c.h,
                borderRadius: c.br,
                background: c.col,
                '--dx': c.dx,
                '--r': c.rot,
                animation: `temFall ${c.dur}s cubic-bezier(.3,.1,.4,1) ${c.delay}s both`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div style={{ position: 'relative', maxWidth: 620, width: '100%', background: '#F0EED9', color: '#1E1310', borderRadius: 28, padding: 'clamp(28px,5vw,52px)', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 40px 80px rgba(0,0,0,0.35)', animation: 'temRise .9s var(--ease) both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.14em' }}>REF {ref}</span>
          <span className="badge" style={{ background: '#EFE5D6', color: '#5A4838' }}>
            <span className="dot" style={{ background: '#A08A70' }} />
            Pending Review
          </span>
        </div>
        <h1 className="h-page" style={{ fontSize: 'clamp(28px,3.8vw,46px)', lineHeight: 0.92 }}>
          Request received.
        </h1>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55 }}>Your request has been received. TEM Bakehouse will review it and contact you before requesting your deposit.</p>
        <ol style={{ margin: 0, padding: '18px 0 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#6E5C4D', borderTop: '1px solid #D9CDB4' }}>
          <li>
            <strong style={{ color: '#1E1310' }}>Now —</strong> TEM reviews your request and preferred date.
          </li>
          <li>
            <strong style={{ color: '#1E1310' }}>Next —</strong> if accepted, you&apos;ll be asked for a 50% deposit.
          </li>
          <li>
            <strong style={{ color: '#1E1310' }}>Then —</strong> your order is confirmed once the deposit is verified.
          </li>
        </ol>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/account/orders/' + ref)}>
            Track this request
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
            Back to home
          </button>
        </div>
        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#8A7A6A' }}>DEMO · no email is sent. In production an acknowledgement email goes to {user?.email ?? 'the customer'}.</p>
      </div>
    </main>
  );
};
