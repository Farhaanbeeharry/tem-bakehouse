import { useEffect, useState } from 'react';
import { asset, useImageExists } from '../lib/assets';
import { instagramUrl } from '../data/site';
import { useIsMobile } from '../lib/shop';

// Each slot shows tem_gallery_NN.webp once TEM's real photo is uploaded; until then, the stand-in listed here.
const ITEMS = [
  ['Choco Chips, stacked', '3/4', asset.category('round')],
  ['Morning bake', '1/1', asset.heroFrame('desktop', 1)],
  ['Cookie cake, personalised', '4/5', asset.category('cakes')],
  ['Birthdays', '4/5', asset.moment('birthday')],
  ['Boxes ready', '1/1', asset.moment('gift')],
  ['The break', '4/3', asset.heroFrame('desktop', 96)],
  ['Mini cookies', '3/4', asset.category('mini')],
  ['Cookie shots', '4/5', asset.category('shots')],
  ['Around the table', '4/5', asset.moment('gathering')],
  ['Cookie cups', '3/4', asset.category('cups')],
  ['Dip and share', '3/4', asset.category('sticks')],
  ['Just because', '4/5', asset.moment('treat')],
] as const;

const useGallerySrc = (i: number) => {
  const own = asset.gallery(i + 1);
  const ok = useImageExists(own);
  return ok ? own : ITEMS[i][2];
};

const LightboxImage = ({ i }: { i: number }) => {
  const src = useGallerySrc(i);
  const [cap, ratio] = ITEMS[i];
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(900px,100%)', aspectRatio: ratio, maxHeight: '80vh', borderRadius: 18, display: 'grid', placeItems: 'center', overflow: 'hidden', background: '#3B2519' }}>
      <img src={src} alt={cap} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

const Tile = ({ i, onOpen }: { i: number; onOpen: () => void }) => {
  const src = useGallerySrc(i);
  const [cap, ratio] = ITEMS[i];
  return (
    <button type="button" onClick={onOpen} aria-label={`Open ${cap}`} className="card-tile" style={{ all: 'unset', cursor: 'zoom-in', display: 'block', width: '100%', marginBottom: 14, breakInside: 'avoid', position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: ratio, background: '#3B2519' }}>
      <img src={src} alt={cap} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <span style={{ position: 'absolute', left: 12, bottom: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(251,248,242,0.9)', fontSize: 12, fontWeight: 600, color: '#1E1310' }}>{cap}</span>
    </button>
  );
};

export const GalleryPage = () => {
  const mobile = useIsMobile();
  const [lb, setLb] = useState<number | null>(null);
  const n = ITEMS.length;

  useEffect(() => {
    if (lb == null) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLb(null);
      if (e.key === 'ArrowRight') setLb((x) => ((x ?? 0) + 1) % n);
      if (e.key === 'ArrowLeft') setLb((x) => ((x ?? 0) + n - 1) % n);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [lb, n]);

  return (
    <main className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, flexWrap: 'wrap', marginBottom: 36 }}>
        <h1 className="h-page">Gallery</h1>
        <a href={instagramUrl()} target="_blank" rel="noopener" style={{ fontSize: 15, fontWeight: 600 }}>
          Follow on Instagram →
        </a>
      </div>
      <div style={{ columns: mobile ? 2 : 4, columnGap: 14 }}>
        {ITEMS.map(([cap], i) => (
          <Tile key={cap} i={i} onOpen={() => setLb(i)} />
        ))}
      </div>

      {lb != null && (
        <div role="dialog" aria-modal="true" aria-label={ITEMS[lb][0]} onClick={() => setLb(null)} style={{ position: 'fixed', inset: 0, zIndex: 96, background: 'rgba(20,12,8,0.92)', display: 'grid', placeItems: 'center', padding: 24, animation: 'temFade .3s ease both' }}>
          <LightboxImage i={lb} />
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }} onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Previous" onClick={() => setLb((lb + n - 1) % n)} style={{ width: 48, height: 48, borderRadius: 24, border: '1px solid #C7B593', background: 'transparent', color: '#F0EED9', cursor: 'pointer' }}>
              ←
            </button>
            <span style={{ alignSelf: 'center', color: '#E5DCC5', fontSize: 14, minWidth: 160, textAlign: 'center' }}>{ITEMS[lb][0]}</span>
            <button type="button" aria-label="Next" onClick={() => setLb((lb + 1) % n)} style={{ width: 48, height: 48, borderRadius: 24, border: '1px solid #C7B593', background: 'transparent', color: '#F0EED9', cursor: 'pointer' }}>
              →
            </button>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={() => setLb(null)} style={{ position: 'absolute', top: 20, right: 20, color: '#F0EED9', borderColor: '#C7B593' }}>
            ×
          </button>
        </div>
      )}
    </main>
  );
};
