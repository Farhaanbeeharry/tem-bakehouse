import { useState } from 'react';
import { products } from '../data/catalog';
import { useStore } from '../lib/store';

export const ContentView = () => {
  const { products: states } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const featured = products.filter((p) => states.find((x) => x.id === p.id)?.featured ?? !!p.featured).length;

  const blocks: [string, string, string][] = [
    ['Homepage featured products', 'Choose which cookies appear in the Flavour Room.', `${featured} featured`],
    ['Homepage hero & banners', 'Hero sequence, headline, seasonal banner.', 'Seasonal banner: off'],
    ['Gallery', 'Upload, order and caption gallery photos.', '12 images (placeholders)'],
    ['About page', 'Brand introduction, founder story, values, photos.', 'Awaiting client copy'],
    ['Social links', 'Instagram, Facebook, WhatsApp.', 'Not set'],
    ['Contact details', 'Email, WhatsApp, collection location, hours.', 'Not set'],
    ['Order Policy', 'Shown at checkout and in the footer. PDF upload supported.', 'Awaiting client text'],
    ['Business Policy', 'Shown at checkout and in the footer. PDF upload supported.', 'Awaiting client text'],
    ['Seasonal collection', 'Optional limited-edition section on the homepage.', 'Off'],
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 12 }}>
      {blocks.map(([t, d, state]) => (
        <section key={t} className="adm-panel tight" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h2 className="adm-h2">{t}</h2>
          <span className="adm-muted" style={{ fontSize: 13, lineHeight: 1.5, flex: 1 }}>
            {d}
          </span>
          <span className="adm-mono" style={{ fontSize: 10, color: 'var(--a-faint)' }}>
            {state}
          </span>
          {editing === t ? (
            <div className="adm-note" style={{ background: 'var(--a-soft)', fontSize: 12, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>Prototype: the editor for this block opens here.</span>
              <button type="button" className="adm-linkbtn" onClick={() => setEditing(null)}>
                Close
              </button>
            </div>
          ) : (
            <button type="button" className="adm-btn sm" style={{ alignSelf: 'flex-start', padding: '7px 12px' }} onClick={() => setEditing(t)}>
              Edit
            </button>
          )}
        </section>
      ))}
    </div>
  );
};
