import { useRef } from 'react';
import { useIsMobile, useReducedMotion } from '../../lib/shop';
import { sectionProgress, useScrollTick } from '../../lib/scroll';

export const ORDER_STEPS = [
  ['Choose your cookies', 'Flavours, pack sizes and any personalisation.'],
  ['Submit your request', 'Pick a collection date. You get a reference number.'],
  ['TEM reviews it', 'Availability is checked and TEM contacts you.'],
  ['Pay the 50% deposit', 'Only when requested, using the instructions in your account.'],
  ['Receive confirmation', 'Confirmed once the deposit is verified.'],
  ['Collect & pay the balance', 'Pick up your order and pay the remaining 50%.'],
];

export const Steps = () => {
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const pin = !mobile && !reduced;
  const ref = useRef<HTMLElement>(null);
  const num = useRef<HTMLSpanElement>(null);
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
    if (num.current) num.current.textContent = pin ? String(active + 1).padStart(2, '0') : '06';
    if (fill.current) fill.current.style.transform = `scaleY(${p})`;
  }, [pin]);

  return (
    <section ref={ref} aria-label="How ordering works" style={{ position: 'relative', height: pin ? '320vh' : 'auto', background: '#E5DCC5' }}>
      <div style={{ position: pin ? 'sticky' : 'relative', top: 0, minHeight: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 'clamp(24px,5vw,80px)', alignItems: 'center', padding: 'clamp(80px,10vh,120px) clamp(16px,5vw,72px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 0 }}>
            03 — How ordering works
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(36px,5vw,80px)', lineHeight: 0.88 }}>
            Request first.
            <br />
            Confirmed <em style={{ color: '#711D2C' }}>together.</em>
          </h2>
          <span ref={num} aria-hidden="true" style={{ fontWeight: 900, fontStretch: '125%', fontSize: 'clamp(120px,22vw,340px)', lineHeight: 0.78, letterSpacing: '-0.06em', color: 'transparent', WebkitTextStroke: '2px #711D2C' }}>
            01
          </span>
          <p className="lede" style={{ maxWidth: '40ch' }}>
            Nothing is charged when you submit. TEM Bakehouse reviews every request and asks for a 50% deposit only once it&apos;s accepted.
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
