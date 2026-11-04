import { useEffect, useState } from 'react';
import { ImageSlot } from '../components/ImageSlot';
import { Cookie } from '../components/Cookie';
import { asset, useImageExists } from '../lib/assets';
import { instagramUrl } from '../data/site';
import { useIsMobile } from '../lib/shop';

const ITEMS = [
  ['Choco Chips, stacked', '3/4', 'choco-chips'],
  ['Morning bake', '1/1', 'plain'],
  ['Cookie cake, personalised', '4/5', 'red-velvet'],
  ['Red Velvet', '3/4', 'red-velvet'],
  ['Boxes ready', '1/1', 'bueno'],
  ['Pistachio close-up', '4/3', 'pistachio'],
  ['Behind the counter', '3/4', 'double-choco'],
  ['Mini cookies', '1/1', 'pinky'],
  ['Cookie shots', '4/5', 'ferrero'],
  ['Packing', '1/1', 'nutty-crunch'],
  ['Ferrero', '3/4', 'ferrero'],
  ['A celebration', '4/3', 'choco-chips'],
] as const;

const LightboxImage = ({ i }: { i: number }) => {
  const src = asset.gallery(i + 1);
  const ok = useImageExists(src);
  const [cap, ratio, flavour] = ITEMS[i];
  return (
    <div onClick={(e) => e.stopPropagation()} className={ok ? undefined : 'striped-dark'} style={{ width: 'min(900px,100%)', aspectRatio: ratio, maxHeight: '80vh', borderRadius: 18, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      {ok ? (
        <img src={src} alt={cap} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <div style={{ width: '40%' }}>
          <Cookie flavour={flavour} />
        </div>
      )}
    </div>
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
        {ITEMS.map(([cap, ratio, flavour], i) => (
          <button key={cap} type="button" onClick={() => setLb(i)} aria-label={`Open ${cap}`} style={{ all: 'unset', cursor: 'zoom-in', display: 'block', width: '100%', marginBottom: 14, breakInside: 'avoid', position: 'relative' }}>
            <ImageSlot
              src={asset.gallery(i + 1)}
              alt={cap}
              ratio={ratio}
              radius={18}
              fallback={
                <div style={{ width: '50%', transform: `rotate(${i * 31}deg)` }}>
                  <Cookie flavour={flavour} />
                </div>
              }
            >
              <span style={{ position: 'absolute', left: 12, top: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(251,248,242,0.9)', fontSize: 12, fontWeight: 600, color: '#1E1310' }}>{cap}</span>
            </ImageSlot>
          </button>
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
