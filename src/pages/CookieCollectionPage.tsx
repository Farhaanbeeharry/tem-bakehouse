import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from '../components/Cookie';
import { ImageSlot } from '../components/ImageSlot';
import { COLLECTION_FLAVOURS, PACKAGING_NOTE, flavourById } from '../data/catalog';
import { asset, probeFile } from '../lib/assets';
import { fmt } from '../lib/format';
import { useShop } from '../lib/shop';
import { useProducts } from '../lib/store';

const STORY = [
  'It began in 2023, with a single tray of cookies and a simple belief: the best things in life aren’t big occasions, they’re the small moments we choose to savour.',
  'A warm cookie, still soft in the centre. A box passed around the table. A quiet pause in a busy day.',
  'One batch became two. Two became a name people asked for. And from every order came the same idea: a cookie shouldn’t just be eaten; it should be remembered.',
  'So, we kept baking, patiently, because good things take time.',
  'Today, that story becomes a collection.',
];

/** The leaflet link only appears once TEM's document is in public/assets/collection/. */
const useDocAvailable = () => {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let alive = true;
    probeFile(asset.collectionDoc).then((v) => alive && setOk(v));
    return () => {
      alive = false;
    };
  }, []);
  return ok;
};

export const CookieCollectionPage = () => {
  const { addLine, setDrawerOpen } = useShop();
  const product = useProducts().find((p) => p.id === 'cookie-collection');
  const docOk = useDocAvailable();
  const available = product?.status === 'available';

  const add = () => {
    if (!product || !available) return;
    addLine(product, {});
    setDrawerOpen(true);
  };

  return (
    <main>
      <section data-dark="1" style={{ padding: 'clamp(120px,14vw,180px) var(--gutter) clamp(64px,8vw,100px)', background: '#4A1019', color: '#F0EED9' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 48, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.24em', color: '#C7B593' }}>FIRST EDITION</span>
            <h1 className="display" style={{ fontSize: 'clamp(40px,6vw,96px)' }}>
              The Cookie
              <br />
              <em>Collection.</em>
            </h1>
            <p style={{ margin: 0, maxWidth: '44ch', fontSize: 18, lineHeight: 1.6, color: '#E5DCC5' }}>Five signature flavours. Each one is a little chapter, and together they make a box worth sharing.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-cream" onClick={add} disabled={!available}>
                {available ? `Add to Order Request · ${fmt(product.price)}` : 'Not available right now'}
              </button>
              {docOk && (
                <a href={asset.collectionDoc} target="_blank" rel="noreferrer" style={{ color: '#F0EED9', fontSize: 14, fontWeight: 600 }}>
                  Read the collection booklet ↗
                </a>
              )}
            </div>
          </div>
          <ImageSlot
            src={asset.collection(1)}
            alt="The Cookie Collection: First Edition box"
            ratio="4 / 5"
            radius={28}
            dark
            fallback={
              <div style={{ width: '86%', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6%', justifyItems: 'center' }}>
                {COLLECTION_FLAVOURS.map((id, i) => (
                  <div key={id} style={{ width: '100%', transform: `rotate(${i * 37}deg)` }}>
                    <Cookie flavour={id} />
                  </div>
                ))}
              </div>
            }
          />
        </div>
      </section>

      <section style={{ padding: 'clamp(72px,10vw,120px) var(--gutter)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, fontSize: 'clamp(17px,1.5vw,20px)', lineHeight: 1.7, color: '#3B2519' }}>
          {STORY.map((para) => (
            <p key={para} style={{ margin: 0 }}>
              {para}
            </p>
          ))}
          <p style={{ margin: 0 }}>
            Introducing <strong>The Cookie Collection: First Edition</strong>. Five signature flavours: Choco Chip, Double Choco, Pistachio, Red Velvet and Nutty Crunch. Each one is a little chapter, and together they make a box worth sharing.
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(22px,2.2vw,30px)', lineHeight: 1.3, color: '#711D2C' }}>
            Whether it’s a gift, a celebration or a quiet treat for yourself, this is where our story meets yours.
          </p>
        </div>
      </section>

      <section aria-label="The five flavours" style={{ padding: '0 var(--gutter) clamp(72px,10vw,120px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 18 }}>
          {COLLECTION_FLAVOURS.map((id, i) => {
            const f = flavourById[id];
            return (
              <Link key={id} to={'/cookies/round-' + id} style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#1E1310', textDecoration: 'none' }}>
                <ImageSlot
                  src={asset.collection(i + 2)}
                  alt={f.name}
                  ratio="1 / 1"
                  radius={22}
                  fallback={
                    <div style={{ width: '72%' }}>
                      <Cookie flavour={id} />
                    </div>
                  }
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: '#711D2C' }}>CHAPTER 0{i + 1}</span>
                <strong className="h-card" style={{ fontSize: 20 }}>
                  {f.name}
                </strong>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: '#6E5C4D' }}>{f.note}</span>
              </Link>
            );
          })}
        </div>
        <div style={{ maxWidth: 1240, margin: '48px auto 0', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <button type="button" className="btn btn-primary" onClick={add} disabled={!available}>
            {available ? `Add the collection · ${fmt(product.price)}` : 'Not available right now'}
          </button>
          <p style={{ margin: 0, maxWidth: '60ch', fontSize: 13, lineHeight: 1.6, color: '#6E5C4D' }}>{PACKAGING_NOTE}</p>
        </div>
      </section>
    </main>
  );
};
