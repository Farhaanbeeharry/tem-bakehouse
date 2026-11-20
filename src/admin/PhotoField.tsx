import { useRef, useState, type ReactNode } from 'react';
import { uploadPhoto } from '../lib/store';

type Props = {
  label: string;
  hint?: string;
  /** The uploaded photo, if any. */
  value?: string;
  /** What shows when nothing is uploaded (the bundled photo). */
  fallback: ReactNode;
  folder: string;
  onChange: (url: string | undefined) => void;
};

/** Upload / replace / remove one back-office photo. */
export const PhotoField = ({ label, hint, value, fallback, folder, onChange }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setErr('');
    const { url, error } = await uploadPhoto(file, folder);
    setBusy(false);
    if (input.current) input.current.value = '';
    if (error || !url) return setErr(error ?? 'Upload failed.');
    onChange(url);
  };

  return (
    <div className="adm-label" style={{ gap: 6 }}>
      {label}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="adm-hatch" style={{ width: 96, height: 96, padding: value ? 0 : 8, overflow: 'hidden', flex: '0 0 auto' }}>
          {value ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : fallback}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => void pick(e.target.files?.[0])} />
          <button type="button" className="adm-btn soft sm" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
          </button>
          {value && (
            <button type="button" className="adm-linkbtn" onClick={() => onChange(undefined)}>
              Use the original photo
            </button>
          )}
          {hint && <span className="adm-small">{hint}</span>}
          {err && (
            <span className="adm-small" role="alert" style={{ color: '#9B2C2C' }}>
              {err}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
