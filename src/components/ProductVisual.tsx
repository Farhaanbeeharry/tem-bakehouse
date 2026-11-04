import { Cookie } from './Cookie';
import { products } from '../data/catalog';
import { asset, useImageExists } from '../lib/assets';

type Props = { pid?: string; flavour: string; flat?: boolean; radius?: number | string };

export const productPhotoSrc = (pid?: string) => {
  const p = pid ? products.find((x) => x.id === pid) : undefined;
  return p && p.cat !== 'round' ? asset.category(p.cat) : null;
};

/** Shaped products (cups, cakes, sticks, shots, mini boxes) show their category photo; round cookies show the cookie. */
export const ProductVisual = ({ pid, flavour, flat, radius = '22%' }: Props) => {
  const src = productPhotoSrc(pid);
  const ok = useImageExists(src);
  if (src && ok) {
    return (
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: radius, overflow: 'hidden', background: '#3B2519' }}>
        <img src={src} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'temFade .5s ease both' }} />
      </div>
    );
  }
  return <Cookie flavour={flavour} flat={flat} />;
};
