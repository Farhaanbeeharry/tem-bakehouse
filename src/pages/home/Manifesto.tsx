import { useRef } from 'react';
import { useReducedMotion } from '../../lib/shop';
import { clamp01, sectionProgress, useScrollTick } from '../../lib/scroll';

const WORDS = 'Every TEM cookie starts as a request and ends as a moment. You choose the flavour and the day. It\'s prepared for exactly then.'.split(' ');
const SERIF = new Set([11, 23]);

const POINTS = [
  ['01', 'Reviewed personally', 'Every request is read by TEM before anything is charged.'],
  ['02', 'Prepared for your date', 'You pick the collection day and time.'],
  ['03', 'Personalised when it matters', 'Messages and occasions on cookie cakes.'],
];

export const Manifesto = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);

  useScrollTick(() => {
    if (!ref.current) return;
    const p = reduced ? 1 : sectionProgress(ref.current);
    const n = WORDS.length;
    words.current.forEach((el, i) => {
      if (el) el.style.opacity = String(0.14 + 0.86 * clamp01(p * 1.35 * n - i));
    });
  }, [reduced]);

  return (
    <section ref={ref} data-dark="1" aria-label="The TEM experience" style={{ position: 'relative', height: reduced ? 'auto' : '230vh', background: '#711D2C', color: '#F0EED9' }}>
      <div style={{ position: reduced ? 'relative' : 'sticky', top: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36, padding: 'clamp(80px,10vh,120px) clamp(16px,5vw,72px)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.26em', color: '#E5DCC5' }}>THE TEM EXPERIENCE</div>
        <p style={{ margin: 0, maxWidth: '20ch', fontWeight: 800, fontStretch: '108%', fontSize: 'clamp(34px,5.6vw,98px)', lineHeight: 0.98, letterSpacing: '-0.03em', textWrap: 'balance' }}>
          {WORDS.map((w, i) => (
            <span
              key={i}
              ref={(el) => {
                words.current[i] = el;
              }}
              style={{ opacity: 0.14, ...(SERIF.has(i) ? { fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 } : null) }}
            >
              {w}{' '}
            </span>
          ))}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 12, maxWidth: 980 }}>
          {POINTS.map(([n, t, d]) => (
            <div key={n} style={{ padding: '18px 20px', borderTop: '1px solid rgba(240,238,217,.3)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', color: '#E5DCC5' }}>{n}</span>
              <strong style={{ fontSize: 16 }}>{t}</strong>
              <span style={{ fontSize: 14, color: '#E5DCC5' }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
