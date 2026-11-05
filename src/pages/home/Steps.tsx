import { useRef } from 'react';
import { useIsMobile, useReducedMotion } from '../../lib/shop';
import { sectionProgress, useScrollTick } from '../../lib/scroll';

export const ORDER_STEPS = [
  ['Choose your cookies', 'Your type of cookies, pack size and personal touch.'],
  ['Submit your request', 'Sign in, or sign in as Guest, pick a date and time. You get a reference number.'],
  ['TEM reviews it', 'Availability is checked and TEM Bakehouse contacts you.'],
  ['Pay the 50% deposit', 'Only when requested, using the instructions you receive.'],
  ['Receive confirmation', 'Once your deposit is verified, your date is secured.'],
  ['Collect & pay the balance', 'Collect in Terre Rouge or Port Louis and pay the remaining 50%.'],
];

const STEP_WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];

export const Steps = () => {
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const pin = !mobile && !reduced;
  const ref = useRef<HTMLElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const numLabel = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useScrollTick(() => {
    if (!ref.current) return;
    const p = pin ? sectionProgress(ref.current) : 1;
    const n = ORDER_STEPS.length;
    const active = Math.min(n - 1, Math.floor(p * n * 0.999));
    items.current.forEach((it, i) => {
      if (!it) return;
      it.style.opacity = !pin || i <= active ? '1' : '0.28';
      it.style.transform = pin && i === active ? 'translateX(14px)' : 'none';
    });
    if (num.current) num.current.textContent = pin ? STEP_WORDS[active] + '.' : 'Six steps.';
    if (numLabel.current) numLabel.current.textContent = pin ? `STEP ${String(active + 1).padStart(2, '0')} OF ${String(n).padStart(2, '0')}` : 'FROM CRAVING TO COLLECTION';
    if (fill.current) fill.current.style.transform = `scaleY(${p})`;
  }, [pin]);

  return (
    <section ref={ref} aria-label="How to order" style={{ position: 'relative', height: pin ? '320vh' : 'auto', background: '#E5DCC5' }}>
      <div style={{ position: pin ? 'sticky' : 'relative', top: 0, minHeight: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 'clamp(24px,5vw,80px)', alignItems: 'center', padding: pin ? '96px clamp(16px,5vw,72px) 32px' : '96px clamp(16px,5vw,72px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 0 }}>
            03 — How to Order
          </div>
          <h2 className="display" style={{ fontSize: pin ? 'clamp(36px,min(5vw,8vh),80px)' : 'clamp(36px,5vw,80px)', lineHeight: 0.88 }}>
            How to <em style={{ color: '#711D2C' }}>order.</em>
          </h2>
          <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span ref={numLabel} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.22em', color: '#6E5C4D' }}>
              STEP 01 OF 06
            </span>
            <span ref={num} style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: pin ? 'clamp(72px,min(13vw,17vh),210px)' : 'clamp(64px,16vw,140px)', lineHeight: 0.9, letterSpacing: '-0.02em', color: '#711D2C', whiteSpace: 'nowrap' }}>
              One.
            </span>
          </div>
          <p className="lede" style={{ maxWidth: '44ch' }}>
            Nothing is charged when you submit. TEM Bakehouse reviews every request first and once it&apos;s accepted, we&apos;ll ask for a 50% deposit to secure your order.
          </p>
        </div>
        <ol style={{ listStyle: 'none', margin: 0, padding: '0 0 0 28px', position: 'relative', display: 'flex', flexDirection: 'column', gap: 'clamp(14px,2.4vh,26px)' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: '#D2C3A5' }}>
            <span ref={fill} style={{ position: 'absolute', inset: 0, background: '#711D2C', transformOrigin: 'top', transform: 'scaleY(0)' }} />
          </span>
          {ORDER_STEPS.map(([t, d], i) => (
            <li
              key={t}
              ref={(el) => {
                items.current[i] = el;
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 4, transition: 'opacity .4s, transform .5s var(--ease)' }}
            >
              <strong style={{ fontWeight: 800, fontStretch: '108%', fontSize: 'clamp(20px,2vw,28px)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{t}</strong>
              <span style={{ fontSize: 15, lineHeight: 1.5, color: '#5A4A3D' }}>{d}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
