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

/** Shows `src` once the file exists; until then a branded placeholder. */
export const ImageSlot = ({ src, alt, ratio = '4 / 5', radius = 22, dark = false, fallback, style, children }: Props) => {
  const ok = useImageExists(src);
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
          <span role="img" aria-label={alt} />
        </>
      )}
      {children}
    </div>
  );
};
