import { useMemo } from 'react';
import { flavourById } from '../data/catalog';
import { asset, useImageExists } from '../lib/assets';

type Props = {
  flavour: string;
  flat?: boolean;
  /** Use the photographed product PNG when it exists. */
  photo?: boolean;
  alt?: string;
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
  return `rgb(${c.join(',')})`;
};

const TEXTURE =
  'radial-gradient(circle at 20% 30%, rgba(0,0,0,0.18) 0 1.2%, transparent 1.6%), radial-gradient(circle at 70% 64%, rgba(0,0,0,0.16) 0 1%, transparent 1.4%), radial-gradient(circle at 56% 22%, rgba(0,0,0,0.14) 0 0.9%, transparent 1.3%), radial-gradient(circle at 32% 74%, rgba(0,0,0,0.15) 0 1.1%, transparent 1.5%), radial-gradient(circle at 80% 38%, rgba(0,0,0,0.12) 0 0.8%, transparent 1.2%)';

/** A TEM cookie: the real product photo when supplied, otherwise a drawn stand-in in the flavour's colours. */
export const Cookie = ({ flavour, flat = false, photo = true, alt }: Props) => {
  const f = flavourById[flavour] ?? flavourById['choco-chips'];
  const src = asset.productWhole(f.id);
  const hasPhoto = useImageExists(photo ? src : null);

  const drawn = useMemo(() => {
    let h = 0;
    for (let i = 0; i < f.id.length; i++) h = (h * 31 + f.id.charCodeAt(i)) >>> 0;
    const rnd = () => {
      h = (h * 1664525 + 1013904223) >>> 0;
      return h / 4294967296;
    };
    const chips: { x: number; y: number; w: number; h: number; r: string; rot: number }[] = [];
    if (f.chip) {
      const n = 20 + Math.floor(rnd() * 6);
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2;
        const d = Math.sqrt(rnd()) * 38;
        const w = i % 6 === 0 ? 7 + rnd() * 3 : 3 + rnd() * 4;
        chips.push({
          x: 50 + Math.cos(a) * d - w / 2,
          y: 50 + Math.sin(a) * d - w / 2,
          w,
          h: w * (0.7 + rnd() * 0.4),
          r: `${40 + rnd() * 20}% ${50 + rnd() * 20}% ${40 + rnd() * 25}% ${55 + rnd() * 15}%`,
          rot: Math.round(rnd() * 180),
        });
      }
    }
    const r = () => Math.round(46 + rnd() * 8);
    return {
      chips,
      radius: `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`,
      bg: `radial-gradient(circle at 40% 36%, ${shade(f.dough, 1.12)} 0%, ${f.dough} 48%, ${shade(f.dough, 0.78)} 86%, ${shade(f.dough, 0.62)} 100%)`,
    };
  }, [f]);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
      {hasPhoto ? (
        <img
          src={src}
          alt={alt ?? `${f.name} cookie`}
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', animation: 'temFade .5s ease both' }}
        />
      ) : (
        <>
          {!flat && (
            <div
              style={{
                position: 'absolute',
                left: '14%',
                right: '14%',
                bottom: '-2%',
                height: '12%',
                borderRadius: '50%',
                background: 'radial-gradient(closest-side, rgba(34,22,15,0.35), rgba(34,22,15,0))',
                filter: 'blur(6px)',
              }}
            />
          )}
          <div
            role="img"
            aria-label={alt ?? `${f.name} cookie (illustration)`}
            style={{
              position: 'absolute',
              inset: '4%',
              borderRadius: drawn.radius,
              background: drawn.bg,
              boxShadow: 'inset -10px -14px 26px rgba(40,20,10,0.35), inset 8px 10px 18px rgba(255,235,200,0.18)',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: TEXTURE, mixBlendMode: 'multiply', opacity: 0.55 }} />
            {drawn.chips.map((c, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  width: `${c.w}%`,
                  height: `${c.h}%`,
                  borderRadius: c.r,
                  background: f.chip ?? undefined,
                  transform: `rotate(${c.rot}deg)`,
                  boxShadow: 'inset -1px -2px 2px rgba(0,0,0,0.25), inset 1px 1px 1px rgba(255,255,255,0.18)',
                }}
              />
            ))}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                background: 'radial-gradient(circle at 32% 26%, rgba(255,240,215,0.32), rgba(255,240,215,0) 45%)',
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
