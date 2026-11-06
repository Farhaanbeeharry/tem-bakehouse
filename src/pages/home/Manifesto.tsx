import { useRef } from 'react';
import { useReducedMotion } from '../../lib/shop';
import { clamp01, sectionProgress, seg, useScrollTick } from '../../lib/scroll';

const WORDS = 'TEM isn’t just about cookies. It’s about the pause: the lid lifting, the first break, the quiet “mmm” before anyone speaks. It’s the feeling of a moment made a little sweeter, and made to be shared.'.split(' ');
const SERIF = new Set([8, 17, 35]);
/** Scroll progress at which the last word is fully lit. */
const LIT = 1 / 1.35;

export const Manifesto = () => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const coda = useRef<HTMLParagraphElement>(null);

  useScrollTick(() => {
    if (!ref.current) return;
    const p = reduced ? 1 : sectionProgress(ref.current);
    const n = WORDS.length;
    words.current.forEach((el, i) => {
      if (el) el.style.opacity = String(0.14 + 0.86 * clamp01((p / LIT) * n - i));
    });
    if (coda.current) {
      const k = reduced ? 1 : seg(p, LIT - 0.02, LIT + 0.1);
      coda.current.style.opacity = String(k);
      coda.current.style.transform = `translateY(${((1 - k) * 24).toFixed(1)}px)`;
    }
  }, [reduced]);

  return (
    <section ref={ref} data-dark="1" aria-label="The TEM experience" style={{ position: 'relative', height: reduced ? 'auto' : '260vh', background: '#711D2C', color: '#F0EED9' }}>
      <div style={{ position: reduced ? 'relative' : 'sticky', top: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(24px,4vh,40px)', padding: 'clamp(80px,10vh,120px) clamp(16px,5vw,72px)' }}>
        <h2 className="display" style={{ margin: 0, fontSize: 'clamp(32px,min(4.4vw,6.5vh),72px)', color: '#F0EED9' }}>
          The <em style={{ color: '#F1C9C9' }}>TEM Experience.</em>
        </h2>
        <p style={{ margin: 0, maxWidth: '24ch', fontWeight: 800, fontStretch: '108%', fontSize: 'clamp(26px,min(4vw,6.2vh),68px)', lineHeight: 1.02, letterSpacing: '-0.03em', textWrap: 'balance' }}>
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
        <p ref={coda} style={{ margin: 0, opacity: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(24px,min(3vw,5vh),48px)', lineHeight: 1.1, color: '#F1C9C9', willChange: 'opacity,transform' }}>
          The feeling of a moment worth slowing down for.
        </p>
      </div>
    </section>
  );
};
