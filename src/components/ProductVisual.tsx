import { BoxVisual } from './BoxVisual';
import { Cookie } from './Cookie';
import { products } from '../data/catalog';
import { asset, useImageExists } from '../lib/assets';

type Props = { pid?: string; flavour: string; flat?: boolean; radius?: number | string };

/** Category photo, for shaped products without their own photo. Round cookies and boxes have none. */
export const productPhotoSrc = (pid?: string) => {
  const p = pid ? products.find((x) => x.id === pid) : undefined;
  return p && p.cat !== 'round' && !p.boxOf ? asset.category(p.cat) : null;
};

/** The product's own photo if one exists, else its category photo, else null. */
export const useProductPhoto = (pid?: string) => {
  const shot = pid && !pid.startsWith('round-') ? asset.productShot(pid) : null;
  const shotOk = useImageExists(shot);
  const cat = productPhotoSrc(pid);
  const catOk = useImageExists(cat);
  if (shot && shotOk) return shot;
  return cat && catOk ? cat : null;
};

/** Shaped products show their photo; boxes show a box; round cookies show the cookie. */
export const ProductVisual = ({ pid, flavour, flat, radius = '22%' }: Props) => {
  const src = useProductPhoto(pid);
  const p = pid ? products.find((x) => x.id === pid) : undefined;
  if (src) {
    return (
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: radius, overflow: 'hidden', background: '#3B2519' }}>
        <img src={src} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'temFade .5s ease both' }} />
      </div>
    );
  }
  if (p?.boxOf || p?.contents) {
    return (
      <div style={{ width: '100%', borderRadius: radius, overflow: 'hidden' }}>
        <BoxVisual slots={p.contents ?? (p.boxOf === 2 ? ['choco-chips', 'choco-chips'] : undefined)} />
      </div>
    );
  }
  return <Cookie flavour={flavour} flat={flat} />;
};
