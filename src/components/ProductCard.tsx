import { useNavigate } from 'react-router-dom';
import { Cookie } from './Cookie';
import { categories, type Product } from '../data/catalog';
import { dietLabel, fmt } from '../lib/format';
import { useShop } from '../lib/shop';
import { useImageExists } from '../lib/assets';
import { productPhotoSrc } from './ProductVisual';

export const ProductCard = ({ p }: { p: Product }) => {
  const navigate = useNavigate();
  const { favs, toggleFav, addLine, showToast } = useShop();
  const soon = p.status !== 'available';
  const fav = favs.includes(p.id);
  const cat = categories.find((c) => c.id === p.cat);
  const open = () => navigate('/cookies/' + p.id);
  const needsOptions = p.flavourPick || p.custom || p.fillings || p.boxOf;
  const photo = productPhotoSrc(p.id);
  const hasPhoto = useImageExists(photo);

  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      <div
        onClick={open}
        className="card-tile"
        style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: 22, background: soon ? '#EDE3D5' : '#E5DCC5', display: 'grid', placeItems: 'center', cursor: 'pointer', overflow: 'hidden' }}
      >
        {photo && hasPhoto ? (
          <img src={photo} alt={p.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'temFade .5s ease both' }} />
        ) : (
          <div style={{ width: '80%', opacity: soon ? 0.55 : 1, filter: soon ? 'grayscale(0.5)' : 'none' }}>
            <Cookie flavour={p.flavour} />
          </div>
        )}
        {!soon && p.diet !== 'regular' && (
          <div style={{ position: 'absolute', left: 14, top: 14, background: '#3D5226', color: '#F0EED9', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', padding: '7px 10px', borderRadius: 999 }}>
            {p.diet === 'gf' ? 'GLUTEN-FREE' : 'GF AVAILABLE'}
          </div>
        )}
        {soon && (
          <div style={{ position: 'absolute', left: 14, top: 14, background: '#1E1310', color: '#F0EED9', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', padding: '7px 10px', borderRadius: 999 }}>COMING SOON</div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(p.id);
          }}
          aria-label={fav ? `Remove ${p.name} from favourites` : `Save ${p.name} to favourites`}
          aria-pressed={fav}
          style={{ position: 'absolute', right: 12, top: 12, width: 44, height: 44, borderRadius: 22, border: 'none', background: 'rgba(251,248,242,0.85)', color: '#711D2C', fontSize: 18, cursor: 'pointer' }}
        >
          {fav ? '♥' : '♡'}
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '6px 12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.14em', color: '#6E5C4D' }}>{cat?.short.toUpperCase()}</span>
          <button type="button" onClick={open} className="h-card" style={{ all: 'unset', cursor: 'pointer', fontWeight: 800, fontStretch: '108%', textTransform: 'uppercase', letterSpacing: '-0.025em', fontSize: 19.2, lineHeight: 1 }}>
            {p.name}
          </button>
          <span style={{ fontSize: 12, fontWeight: 600, color: p.diet === 'regular' ? '#6E5C4D' : '#3D5226' }}>{dietLabel(p.diet)}</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap' }}>{(p.packs.length > 1 ? 'from ' : '') + fmt(p.price)}</span>
      </div>
      {soon ? (
        <div style={{ border: '1px dashed #C7B593', color: '#6E5C4D', borderRadius: 999, padding: '11px 16px', fontSize: 14, textAlign: 'center', minHeight: 44 }}>Not yet available to order</div>
      ) : (
        <button
          type="button"
          className="btn btn-outline"
          style={{ fontSize: 14, padding: '11px 12px', minHeight: 44, whiteSpace: 'normal', marginTop: 'auto' }}
          onClick={() => {
            if (needsOptions) return open();
            addLine(p, { pack: p.packs[0].id });
            showToast(p.name + ' added to your order request');
          }}
        >
          {p.boxOf ? 'Build your box' : needsOptions ? 'Choose options' : 'Quick add · single'}
        </button>
      )}
    </article>
  );
};
