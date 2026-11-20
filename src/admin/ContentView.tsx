import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { patchSettings, uploadPhoto, useStore, type GalleryPhoto } from '../lib/store';

const SHORTCUTS: [string, string, string][] = [
  ['Cookies, prices & photos', 'Edit any product, add new cookies or products, pack prices, fillings and categories.', '/admin/products'],
  ['Featured on the homepage', 'Tick “Featured” on a round cookie to show it in the Flavour Room.', '/admin/products'],
  ['Contact & social links', 'WhatsApp, email, Instagram, Facebook, TikTok, collection points and hours.', '/admin/settings'],
  ['Deposits, slots & closed days', 'Deposit %, time slots, daily capacity, holidays and payment instructions.', '/admin/settings'],
];

export const ContentView = () => {
  const gallery = useStore().settings.gallery ?? [];
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const save = (next: GalleryPhoto[]) => patchSettings({ gallery: next });
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= gallery.length) return;
    const next = [...gallery];
    [next[i], next[j]] = [next[j], next[i]];
    void save(next);
  };

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMsg('');
    const added: GalleryPhoto[] = [];
    for (const file of Array.from(files)) {
      const { url, error } = await uploadPhoto(file, 'gallery');
      if (error || !url) setMsg(error ?? 'An upload failed.');
      else added.push({ url, caption: '' });
    }
    if (added.length) await save([...gallery, ...added]);
    setBusy(false);
    if (input.current) input.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 12 }}>
        {SHORTCUTS.map(([t, d, to]) => (
          <section key={t} className="adm-panel tight" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 className="adm-h2">{t}</h2>
            <span className="adm-muted" style={{ fontSize: 13, lineHeight: 1.5, flex: 1 }}>
              {d}
            </span>
            <Link to={to} className="adm-btn sm" style={{ alignSelf: 'flex-start', padding: '7px 12px', textDecoration: 'none' }}>
              Open
            </Link>
          </section>
        ))}
      </div>

      <section className="adm-panel" aria-label="Gallery photos">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <h2 className="adm-h2 lg">Gallery photos</h2>
            <span className="adm-small">
              {gallery.length ? `${gallery.length} photo${gallery.length > 1 ? 's' : ''} on the Gallery page, in this order.` : 'The Gallery page shows TEM’s stand-in photos until you add your own.'}
            </span>
          </div>
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => void add(e.target.files)} />
          <button type="button" className="adm-btn primary sm" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? 'Uploading…' : '+ Add photos'}
          </button>
        </div>
        {msg && (
          <p role="alert" className="adm-small" style={{ color: '#9B2C2C' }}>
            {msg}
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 190px), 1fr))', gap: 12, marginTop: 14 }}>
          {gallery.map((g, i) => (
            <div key={g.url} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ aspectRatio: '4 / 5', borderRadius: 12, overflow: 'hidden', background: 'var(--a-sand)' }}>
                <img src={g.url} alt={g.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <input
                className="adm-input sm"
                aria-label={`Caption for photo ${i + 1}`}
                placeholder="Caption (optional)"
                defaultValue={g.caption}
                onBlur={(e) => e.target.value !== g.caption && void save(gallery.map((x, j) => (j === i ? { ...x, caption: e.target.value.trim() } : x)))}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" className="adm-btn soft sm" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}>
                  ←
                </button>
                <button type="button" className="adm-btn soft sm" aria-label="Move later" disabled={i === gallery.length - 1} onClick={() => move(i, 1)}>
                  →
                </button>
                <button type="button" className="adm-btn soft sm" onClick={() => window.confirm('Remove this photo from the gallery?') && void save(gallery.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
