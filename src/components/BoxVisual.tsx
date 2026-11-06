import { Cookie } from './Cookie';

/** Flavours shown in the box before the customer has picked any. */
export const SAMPLE_BOX = ['choco-chips', 'pinky', 'pistachio', 'biscoff'];

type Props = {
  /** One entry per slot; an empty slot shows a dashed outline. */
  slots?: (string | undefined)[];
  background?: string;
  label?: string;
};

/** A square TEM box seen from above, holding four cookies in a 2 × 2 grid. */
export const BoxVisual = ({ slots = SAMPLE_BOX, background = '#711D2C', label }: Props) => (
  <div role="img" aria-label={label ?? 'A square box of four TEM cookies'} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', display: 'grid', placeItems: 'center', background }}>
    <div style={{ width: '80%', aspectRatio: '1 / 1', padding: '4%', boxSizing: 'border-box', borderRadius: '5%', background: 'linear-gradient(145deg,#F4ECDB,#E2D3B6)', boxShadow: '0 24px 50px rgba(30,19,16,.35), inset 0 0 0 1px rgba(255,255,255,.4)' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: '3%', background: 'radial-gradient(ellipse at 50% 40%,#E9DCC0,#D2BE98)', boxShadow: 'inset 0 6px 18px rgba(59,37,25,.28)', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '4%', padding: '5%', boxSizing: 'border-box' }}>
        {slots.map((id, i) => (
          <div key={i} style={{ display: 'grid', placeItems: 'center', minWidth: 0, minHeight: 0 }}>
            {id ? (
              <div key={id} style={{ width: '96%', animation: 'temFade .4s ease both' }}>
                <Cookie flavour={id} />
              </div>
            ) : (
              <div style={{ width: '88%', aspectRatio: '1 / 1', borderRadius: '50%', border: '2px dashed #A8916C', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#7A6650' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);
