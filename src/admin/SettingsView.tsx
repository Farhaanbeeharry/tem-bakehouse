import { useStore, type StoreContact } from '../lib/store';
import { patchSettings } from './adminData';
import { DraftInput } from './DraftInput';
import { DesktopAlerts } from './DesktopAlerts';
import { TeamPanel } from './TeamPanel';

const NOTIFICATIONS = [
  'New order request',
  'Deposit proof submitted',
  'Customer approved changes',
  'Collection tomorrow (daily digest)',
  'Customer messages',
];

const EMPTY_CONTACT: StoreContact = { whatsapp: '', address: '', hours: '' };

const CONTACT_FIELDS: [keyof StoreContact, string, string][] = [
  ['whatsapp', 'WhatsApp number', '+230 5xxx xxxx'],
  ['email', 'Public email', 'contact@tembakehouse.com'],
  ['instagram', 'Instagram', '@tembakehouse'],
  ['facebook', 'Facebook page', 'facebook.com/tembakehouse'],
  ['tiktok', 'TikTok', '@tembakehouse'],
  ['address', 'Collection points', 'Terre Rouge (near Winners) & Port Louis (near ICC)'],
  ['hours', 'Opening hours', 'Weekdays: 09:00 – 16:00 · Saturday: 08:30 – 12:00'],
];

const parseOptionalNumber = (v: string) => (v.trim() === '' ? undefined : Math.max(0, Number(v) || 0));

export const SettingsView = () => {
  const { settings: st } = useStore();
  const contact = st.contact ?? EMPTY_CONTACT;
  const setContact = (patch: Partial<StoreContact>) => patchSettings({ contact: { ...contact, ...patch } });
  const notifOn = (n: string) => st.notifications?.[n] ?? true;

  return (
    <div className="adm-grid">
      <section className="adm-panel stack">
        <h2 className="adm-h2 lg">Fulfilment</h2>
        <label className="adm-toggle">
          <span>
            <strong>Collection</strong>
            <br />
            <span className="adm-small">Customers collect from TEM</span>
          </span>
          <input
            type="checkbox"
            className="adm-check lg"
            checked={st.collection}
            onChange={() => patchSettings({ collection: !st.collection })}
          />
        </label>
        <label className="adm-toggle">
          <span>
            <strong>Delivery</strong>
            <br />
            <span className="adm-small">Hidden from customers while off</span>
          </span>
          <input type="checkbox" className="adm-check lg" checked={st.delivery} onChange={() => patchSettings({ delivery: !st.delivery })} />
        </label>
        {st.delivery && (
          <div className="adm-two" style={{ padding: 12, borderRadius: 12, background: 'var(--a-soft)' }}>
            <label className="adm-label">
              Delivery fee (Rs)
              <DraftInput
                className="adm-input"
                type="number"
                min={0}
                placeholder="e.g. 150"
                value={st.deliveryFee != null ? String(st.deliveryFee) : ''}
                onCommit={(v) => patchSettings({ deliveryFee: parseOptionalNumber(v) })}
              />
            </label>
            <label className="adm-label">
              Service areas
              <DraftInput
                className="adm-input"
                placeholder="Regions / postcodes"
                value={st.deliveryAreas ?? ''}
                onCommit={(v) => patchSettings({ deliveryAreas: v })}
              />
            </label>
            <span style={{ gridColumn: '1 / -1', fontSize: 12, color: '#7A4E0E' }}>
              Prototype: the public site still shows delivery as unavailable.
            </span>
          </div>
        )}
        <label className="adm-label">
          Collection time slots
          <DraftInput
            className="adm-input"
            value={st.slots.join(', ')}
            onCommit={(v) =>
              patchSettings({
                slots: v
                  .split(',')
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
          />
          <span className="adm-small" style={{ fontWeight: 500 }}>
            Comma-separated, e.g. 10:00–12:00, 12:00–14:00
          </span>
        </label>
      </section>

      <section className="adm-panel stack">
        <h2 className="adm-h2 lg">Deposits & payment</h2>
        <label className="adm-label">
          Deposit percentage
          <DraftInput
            className="adm-input"
            type="number"
            min={0}
            max={100}
            value={String(st.depositPct)}
            onCommit={(v) => patchSettings({ depositPct: Math.min(100, Math.max(0, Number(v) || 0)) })}
          />
        </label>
        <label className="adm-label">
          Payment instructions shown to customers
          <textarea
            className="adm-input"
            rows={4}
            value={st.payment}
            onChange={(e) => patchSettings({ payment: e.target.value })}
          />
        </label>
        <label className="adm-label">
          Optional deposit deadline (hours after request)
          <DraftInput
            className="adm-input"
            type="number"
            min={0}
            placeholder="Off"
            value={st.depositDeadlineHours != null ? String(st.depositDeadlineHours) : ''}
            onCommit={(v) => patchSettings({ depositDeadlineHours: parseOptionalNumber(v) })}
          />
        </label>
        <span className="adm-small">Online payment gateway: not connected. The order flow stays the same when one is added.</span>
      </section>

      <section className="adm-panel stack" style={{ gap: 12 }}>
        <h2 className="adm-h2 lg">Notifications</h2>
        {NOTIFICATIONS.map((n) => (
          <label key={n} className="adm-toggle" style={{ fontSize: 13 }}>
            <span>{n}</span>
            <input
              type="checkbox"
              className="adm-check"
              checked={notifOn(n)}
              onChange={() => patchSettings({ notifications: { ...st.notifications, [n]: !notifOn(n) } })}
            />
          </label>
        ))}
        <span className="adm-small">
          New order requests also ring and show a banner while the back office is open. Emails start once the mail server (SMTP) is connected. WhatsApp messages are sent manually from order pages.
        </span>
        <DesktopAlerts />
      </section>

      <section className="adm-panel stack" style={{ gap: 10 }}>
        <TeamPanel />
        <h2 className="adm-h2 lg" style={{ marginTop: 8 }}>
          Store contact
        </h2>
        <span className="adm-small">Shown on the Contact page and in the footer. Anything left empty is hidden.</span>
        {CONTACT_FIELDS.map(([key, label, placeholder]) => (
          <label key={key} className="adm-label">
            {label}
            <DraftInput className="adm-input" placeholder={placeholder} value={contact[key] ?? ''} onCommit={(v) => setContact({ [key]: v.trim() })} />
          </label>
        ))}
      </section>
    </div>
  );
};
