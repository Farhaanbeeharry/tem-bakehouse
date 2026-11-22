import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from '../components/Cookie';
import { ImageSlot } from '../components/ImageSlot';
import { ProductCard } from '../components/ProductCard';
import { COLLECTION_FLAVOURS, PACKAGING_INCLUDED } from '../data/catalog';
import { asset, probeFile } from '../lib/assets';
import { fmt } from '../lib/format';
import { useShop } from '../lib/shop';
import { useProducts } from '../lib/store';

// Words from TEM's "Cookie Collection Presentation" (amended, V4).
const STORY = [
  'Years of dough & trial, we’ve stirred and spun',
  'Batch after batch, till the perfect one won',
  'Gooey, crusty, golden & light',
  'Baked warm, just right, to your delight',
  'Choco chip, nuts, pistachio & more we’ve mastered',
  'Not just work & art but a cookie made with heart',
  'Since 2023, we’ve made this vow',
  'Turning your moments into memories, one bite will show you how.',
];

const EXPRESSIONS = [
  { id: 'choco-chips', name: 'Classic Cookie', text: 'Golden edges, a buttery crumb, and pools of melted chocolate chips in every bite. The one that started it all: simple, timeless, always right.' },
  { id: 'double-choco', name: 'Double Choco', text: 'Deep, dark, and unapologetically chocolate. Crackled on top, fudgy within: built for the days that call for something rich.' },
  { id: 'pistachio', name: 'Pistachio', text: 'Nutty, earthy, and dusted in pistachio gold, with a molten Nutella heart waiting at the centre. The one that surprises you halfway through.' },
  { id: 'red-velvet', name: 'Red Velvet', text: 'A bold ruby crumb, kissed with cocoa and studded with white chocolate. Soft, faintly tangy, and rich all the way through: a classic, made unforgettable.' },
  { id: 'nutty-crunch', name: 'Nutty Crunch', text: 'Almonds, cashews and pistachio, folded into a golden, buttery dough. Rustic and toasty, every bite snaps with a little wild crunch.' },
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
  const products = useProducts();
  const product = products.find((p) => p.id === 'cookie-collection');
  const more = products.filter((p) => p.cat === 'round' && !p.hidden && !COLLECTION_FLAVOURS.includes(p.flavour));
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
            <p style={{ margin: 0, maxWidth: '44ch', fontSize: 18, lineHeight: 1.6, color: '#E5DCC5' }}>Our mains: one story, told in five sweet expressions.</p>
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
                {EXPRESSIONS.map(({ id }, i) => (
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
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 'clamp(40px,6vw,96px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.24em', color: '#711D2C' }}>OUR STORY</span>
            <p style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(21px,2.1vw,28px)', lineHeight: 1.4, color: '#3B2519' }}>
              {STORY.map((line) => (
                <span key={line} style={{ display: 'block' }}>
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 'clamp(17px,1.5vw,19px)', lineHeight: 1.7, color: '#3B2519' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.24em', color: '#711D2C' }}>THE INGREDIENTS</span>
            <h2 className="h-page" style={{ fontSize: 'clamp(28px,3.4vw,48px)', lineHeight: 0.95 }}>
              What goes into every batch
            </h2>
            <p style={{ margin: 0 }}>It starts simple: flour, premium butter, brown sugar, milk &amp; dark chocolate. Some batches get a little extra: a filling stuffed right into the centre, in the heart.</p>
            <p style={{ margin: 0 }}>But the ingredient that actually holds it all together isn’t on any label. It’s the one thing we never skip, in every batch, since day one: love.</p>
          </div>
        </div>
      </section>

      <section aria-label="The five expressions" style={{ padding: '0 var(--gutter) clamp(72px,10vw,120px)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 18 }}>
          {EXPRESSIONS.map(({ id, name, text }, i) => {
            return (
              <Link key={id} to={'/cookies/round-' + id} style={{ display: 'flex', flexDirection: 'column', gap: 12, color: '#1E1310', textDecoration: 'none' }}>
                <ImageSlot
                  src={asset.collection(i + 2)}
                  alt={name}
                  ratio="1 / 1"
                  radius={22}
                  fallback={
                    <div style={{ width: '72%' }}>
                      <Cookie flavour={id} />
                    </div>
                  }
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: '#711D2C' }}>EXPRESSION 0{i + 1}</span>
                <strong className="h-card" style={{ fontSize: 20 }}>
                  {name}
                </strong>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: '#6E5C4D' }}>{text}</span>
              </Link>
            );
          })}
        </div>
        <div style={{ maxWidth: 760, margin: 'clamp(64px,8vw,104px) auto 0', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.24em', color: '#711D2C' }}>A SMALL THANK YOU</span>
          <h2 className="h-page" style={{ fontSize: 'clamp(28px,3.4vw,48px)', lineHeight: 0.95 }}>
            Five flavours. One story. Made for you.
          </h2>
          <p style={{ margin: 0, fontSize: 'clamp(17px,1.5vw,19px)', lineHeight: 1.7, color: '#3B2519' }}>Every cookie in this collection carries the same batch of years, trial, and heart that started TEM Bakehouse back in 2023. Whichever one you reach for, we hope it turns your moment into a memory.</p>
          <p style={{ margin: 0, fontSize: 'clamp(17px,1.5vw,19px)', lineHeight: 1.7, color: '#3B2519' }}>Classic, Double Choco, Pistachio, Red Velvet &amp; Nutty Crunch are our mains, the heart of what we bake. But they’re not the whole story: more flavours are always waiting to be discovered at TEM Bakehouse.</p>
          <button type="button" className="btn btn-primary" onClick={add} disabled={!available} style={{ marginTop: 10 }}>
            {available ? `Add the collection · ${fmt(product.price)}` : 'Not available right now'}
          </button>
          <p style={{ margin: 0, maxWidth: '60ch', fontSize: 13, lineHeight: 1.6, color: '#6E5C4D' }}>{PACKAGING_INCLUDED}</p>
        </div>
      </section>

      {more.length > 0 && (
        <section aria-label="More flavours" style={{ padding: 'clamp(72px,10vw,120px) var(--gutter)', background: '#E5DCC5' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.24em', color: '#711D2C' }}>MORE TO DISCOVER</span>
              <h2 className="h-page" style={{ fontSize: 'clamp(28px,3.4vw,48px)', lineHeight: 0.95 }}>
                The rest of our cookies
              </h2>
              <p style={{ margin: 0, maxWidth: '56ch', fontSize: 17, lineHeight: 1.6, color: '#3B2519' }}>Beyond our mains, every other flavour we bake. Order them one by one, or mix them in a box.</p>
            </div>
            <div className="product-grid">
              {more.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
            <div>
              <Link to="/cookies" className="btn btn-outline">
                See the full menu
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};
