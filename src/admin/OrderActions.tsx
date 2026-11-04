import { useState } from 'react';
import type { StatusId } from '../data/catalog';
import { pushStatus, updateOrder, type Order, type Settings } from '../lib/store';
import { fmt } from '../lib/format';
import { estimate } from './adminData';

type Props = { order: Order; settings: Settings };

type Step = { title: string; hint: string; label: string; to: StatusId };

const WAITS: Partial<Record<StatusId, string>> = {
  deposit_required: 'Waiting for the customer to pay the deposit and submit details.',
  awaiting_approval: 'Waiting for the customer to approve your proposed changes.',
  payment_failed: 'Waiting for corrected payment details from the customer.',
  changes_requested: 'Waiting for the customer to reply to your question.',
};

const stepFor = (o: Order): Step | null => {
  if (o.status === 'confirmed')
    return { title: 'Start preparing', hint: 'Customer sees "In Preparation".', label: 'Mark In Preparation', to: 'in_preparation' };
  if (o.status === 'in_preparation')
    return { title: 'Ready for collection', hint: 'Customer is told to collect and bring the balance.', label: 'Mark Ready for Collection', to: 'ready' };
  if (o.status === 'ready')
    return {
      title: 'Complete collection',
      hint: `Record the remaining ${fmt((o.total ?? 0) - o.depositPaid)} and mark collected.`,
      label: 'Balance received — mark Collected',
      to: 'collected',
    };
  return null;
};

export const OrderActions = ({ order: o, settings }: Props) => {
  const [amount, setAmount] = useState(() => String(Math.round(o.total ?? estimate(o))));
  const [proposal, setProposal] = useState('');
  const pct = settings.depositPct;
  const u = (fn: (x: Order) => Order) => updateOrder(o.ref, fn);
  const step = stepFor(o);
  const wait = WAITS[o.status];

  if (o.status === 'pending_review') {
    const amt = Number(amount) || 0;
    return (
      <section className="adm-action">
        <h3>Review request</h3>
        <label className="adm-label">
          Approved final amount (Rs)
          <input
            className="adm-input lg"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ fontSize: 15 }}
          />
        </label>
        <div className="adm-kv" style={{ border: 'none', padding: 0 }}>
          <span>Deposit to request ({pct}%)</span>
          <strong>{fmt((amt * pct) / 100)}</strong>
        </div>
        <button
          type="button"
          className="adm-btn primary big"
          disabled={!amt}
          onClick={() => u((x) => pushStatus({ ...x, total: amt }, 'deposit_required'))}
        >
          Accept & request deposit
        </button>
        <label className="adm-label">
          Propose changes (customer must approve)
          <textarea
            className="adm-input"
            rows={2}
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="e.g. Date is full — offer the next day, same time"
            style={{ padding: 10 }}
          />
        </label>
        <div className="adm-btn-row">
          <button
            type="button"
            className="adm-btn"
            disabled={!proposal.trim()}
            onClick={() => u((x) => pushStatus({ ...x, proposal: proposal.trim() }, 'awaiting_approval'))}
          >
            Send proposal
          </button>
          <button type="button" className="adm-btn" onClick={() => u((x) => pushStatus(x, 'changes_requested'))}>
            Ask for info
          </button>
          <button type="button" className="adm-btn danger" onClick={() => u((x) => pushStatus(x, 'declined'))}>
            Decline
          </button>
        </div>
      </section>
    );
  }

  if (o.status === 'deposit_submitted') {
    const due = o.total != null ? (o.total * pct) / 100 : 0;
    return (
      <section className="adm-action">
        <h3>Verify deposit</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
          <span className="adm-muted">Expected</span>
          <strong>{o.total != null ? fmt(due) : '—'}</strong>
          <span className="adm-muted">Method</span>
          <span>{o.payMethod || 'Bank transfer'}</span>
          <span className="adm-muted">Customer reference</span>
          <span className="adm-mono">{o.payRef || '—'}</span>
          <span className="adm-muted">Proof</span>
          <span style={{ overflowWrap: 'anywhere' }}>{o.proof || 'None uploaded'}</span>
        </div>
        <div className="adm-hatch adm-mono" style={{ height: 120 }}>
          proof preview
        </div>
        <p className="adm-small" style={{ margin: 0 }}>
          Check your bank account before verifying. Proof alone is not confirmation.
        </p>
        <div className="adm-btn-row">
          <button
            type="button"
            className="adm-btn good big"
            onClick={() => u((x) => pushStatus({ ...x, depositPaid: ((x.total ?? 0) * pct) / 100 }, 'confirmed'))}
          >
            Payment received — confirm order
          </button>
          <button
            type="button"
            className="adm-btn danger big"
            style={{ fontSize: 13 }}
            onClick={() =>
              u((x) =>
                pushStatus(
                  { ...x, failNote: 'We could not find this payment. Please check the reference and resubmit.' },
                  'payment_failed',
                ),
              )
            }
          >
            Not received — ask to resubmit
          </button>
        </div>
      </section>
    );
  }

  if (step) {
    return (
      <section className="adm-action">
        <h3>{step.title}</h3>
        <span className="adm-muted" style={{ fontSize: 13 }}>
          {step.hint}
        </span>
        <button
          type="button"
          className="adm-btn primary big"
          onClick={() =>
            u((x) => pushStatus(step.to === 'collected' ? { ...x, balancePaid: (x.total ?? 0) - x.depositPaid } : x, step.to))
          }
        >
          {step.label}
        </button>
      </section>
    );
  }

  if (wait) {
    return (
      <div className="adm-note" style={{ padding: 14, borderRadius: 12, background: 'var(--a-sand)' }}>
        {wait}
        {o.status === 'awaiting_approval' && o.proposal && (
          <>
            <br />
            <span className="adm-small">Proposal sent: “{o.proposal}”</span>
          </>
        )}
      </div>
    );
  }

  return null;
};
