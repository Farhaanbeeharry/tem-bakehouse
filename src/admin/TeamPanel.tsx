import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { setAdmin, useStore } from '../lib/store';

/** Who can open the back office. Access is given to someone who already has an account on the website. */
export const TeamPanel = () => {
  const { team, customers } = useStore();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const give = async () => {
    const who = customers.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
    if (!who) return setMsg('No account with that email yet. Ask them to sign up on the website first, then add them here.');
    const e = await setAdmin(who.id, true);
    setMsg(e ?? `${who.name} can now sign in to the back office.`);
    if (!e) setEmail('');
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Remove back-office access for ${name}? They keep their customer account.`)) return;
    const e = await setAdmin(id, false);
    setMsg(e ?? `${name} no longer has back-office access.`);
  };

  return (
    <>
      <h2 className="adm-h2 lg">Team & access</h2>
      {team.map((m) => (
        <div key={m.id} className="adm-kv" style={{ fontSize: 14, padding: '8px 0', gap: 10 }}>
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <strong>{m.name}</strong> · {m.email}
          </span>
          {m.id === user?.id ? (
            <span className="adm-small">You</span>
          ) : (
            <button type="button" className="adm-linkbtn" onClick={() => void remove(m.id, m.name)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input className="adm-input" style={{ flex: '1 1 200px' }} type="email" aria-label="Email of the person to add" placeholder="Their account email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="button" className="adm-btn sm" disabled={!email.trim()} onClick={() => void give()}>
          Give access
        </button>
      </div>
      <span className="adm-small">{msg || 'Everyone on the team has full access to orders, products and settings.'}</span>
    </>
  );
};
