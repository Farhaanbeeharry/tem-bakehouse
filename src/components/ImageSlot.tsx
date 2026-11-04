import type { CSSProperties, ReactNode } from 'react';
import { useImageExists } from '../lib/assets';

type Props = {
  src: string;
  alt: string;
  ratio?: string;
  radius?: number;
  dark?: boolean;
  /** Shown on the placeholder until the file exists. */
  fallback?: ReactNode;
  style?: CSSProperties;
  children?: ReactNode;
};

/** Shows `src` once the file exists; until then a branded placeholder that names the expected file. */
export const ImageSlot = ({ src, alt, ratio = '4 / 5', radius = 22, dark = false, fallback, style, children }: Props) => {
  const ok = useImageExists(src);
  const file = src.split('/').pop();
  return (
    <div
      className={ok ? undefined : dark ? 'striped-dark' : 'striped'}
      style={{ position: 'relative', aspectRatio: ratio, borderRadius: radius, overflow: 'hidden', background: ok ? (dark ? '#3B2519' : '#E5DCC5') : undefined, ...style }}
    >
      {ok ? (
        <img src={src} alt={alt} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'temFade .6s ease both' }} />
      ) : (
        <>
          {fallback && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{fallback}</div>}
          <span
            aria-label={alt}
            role="img"
            style={{ position: 'absolute', left: 14, bottom: 12, right: 14, fontFamily: 'var(--font-mono)', fontSize: 9, color: dark ? '#C7B593' : '#6E5C4D', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {file}
          </span>
        </>
      )}
      {children}
    </div>
  );
};
