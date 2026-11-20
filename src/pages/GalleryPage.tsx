import { useEffect, useState } from 'react';
import { asset, useImageExists } from '../lib/assets';
import { useSiteContact } from '../lib/contact';
import { useStore } from '../lib/store';
import { useIsMobile } from '../lib/shop';

// Each slot shows tem_gallery_NN.webp once TEM's real photo is uploaded; until then, the stand-in listed here.
const ITEMS = [
  ['Choco Chip, stacked', '3/4', asset.category('round')],
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

type Item = { cap: string; ratio: string; src?: string };

/** An uploaded photo (back office → Content → Gallery) wins; otherwise the slot's file or its stand-in. */
const useGallerySrc = (i: number, item: Item) => {
  const own = item.src ? null : asset.gallery(i + 1);
  const ok = useImageExists(own);
  return item.src ?? (ok && own ? own : ITEMS[i % ITEMS.length][2]);
};

const LightboxImage = ({ i, item }: { i: number; item: Item }) => {
  const src = useGallerySrc(i, item);
  const { cap, ratio } = item;
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(900px,100%)', aspectRatio: ratio, maxHeight: '80vh', borderRadius: 18, display: 'grid', placeItems: 'center', overflow: 'hidden', background: '#3B2519' }}>
      <img src={src} alt={cap} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

const Tile = ({ i, item, onOpen }: { i: number; item: Item; onOpen: () => void }) => {
  const src = useGallerySrc(i, item);
  const { cap, ratio } = item;
  return (
    <button type="button" onClick={onOpen} aria-label={`Open ${cap}`} className="card-tile" style={{ all: 'unset', cursor: 'zoom-in', display: 'block', width: '100%', marginBottom: 14, breakInside: 'avoid', position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: ratio, background: '#3B2519' }}>
      <img src={src} alt={cap} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      {cap && <span style={{ position: 'absolute', left: 12, bottom: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(251,248,242,0.9)', fontSize: 12, fontWeight: 600, color: '#1E1310' }}>{cap}</span>}
    </button>
  );
};

export const GalleryPage = () => {
  const mobile = useIsMobile();
  const [lb, setLb] = useState<number | null>(null);
  const contact = useSiteContact();
  const { settings, ready } = useStore();
  const uploaded = settings.gallery ?? [];
  // Wait for the saved gallery so the stand-in photos don't flash first.
  const items: Item[] = !ready ? [] : uploaded.length ? uploaded.map((g) => ({ cap: g.caption, ratio: '4/5', src: g.url })) : ITEMS.map(([cap, ratio]) => ({ cap, ratio }));
  const n = items.length;

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
        {contact.instagramUrl && (
          <a href={contact.instagramUrl} target="_blank" rel="noopener" style={{ fontSize: 15, fontWeight: 600 }}>
            Follow on Instagram →
          </a>
        )}
      </div>
      <div style={{ columns: mobile ? 2 : 4, columnGap: 14 }}>
        {items.map((item, i) => (
          <Tile key={(item.src ?? '') + i} i={i} item={item} onOpen={() => setLb(i)} />
        ))}
      </div>

      {lb != null && (
        <div role="dialog" aria-modal="true" aria-label={items[lb].cap || 'Gallery photo'} onClick={() => setLb(null)} style={{ position: 'fixed', inset: 0, zIndex: 96, background: 'rgba(20,12,8,0.92)', display: 'grid', placeItems: 'center', padding: 24, animation: 'temFade .3s ease both' }}>
          <LightboxImage i={lb} item={items[lb]} />
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }} onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Previous" onClick={() => setLb((lb + n - 1) % n)} style={{ width: 48, height: 48, borderRadius: 24, border: '1px solid #C7B593', background: 'transparent', color: '#F0EED9', cursor: 'pointer' }}>
              ←
            </button>
            <span style={{ alignSelf: 'center', color: '#E5DCC5', fontSize: 14, minWidth: 160, textAlign: 'center' }}>{items[lb].cap}</span>
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
