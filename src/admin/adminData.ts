import { customers, statuses, tones, type Customer, type StatusId, type Tone } from '../data/catalog';
import { estimateOf, setStore, type Order, type Settings } from '../lib/store';
import { fmt } from '../lib/format';

export const CLOSED_STATUSES: StatusId[] = ['declined', 'cancelled', 'expired'];
export const NEEDS_YOU: StatusId[] = ['pending_review', 'deposit_submitted'];

export const TONE_COLOR: Record<Tone, string> = {
  neutral: '#A08A70',
  warn: '#C98A1E',
  action: '#6B1A2A',
  good: '#6E8C45',
  done: '#3B2519',
  danger: '#B23A33',
};

export const customerOf = (o: Order): Customer =>
  customers.find((c) => c.id === o.customer) ?? {
    id: o.customer,
    name: o.contactName || 'Customer',
    email: '—',
    phone: o.phone || '—',
    orders: 0,
  };

export const statusDef = (s: StatusId) => statuses[s] ?? { label: s, tone: 'neutral' as Tone };

export const toneOf = (s: StatusId) => tones[statusDef(s).tone];

export const estimate = (o: Order) => o.estimate ?? estimateOf(o.items);

export const totalText = (o: Order) => (o.total != null ? fmt(o.total) : 'est. ' + fmt(estimate(o)));

const ACTIONS: Partial<Record<StatusId, string>> = {
  pending_review: 'Review request',
  deposit_submitted: 'Verify deposit',
  confirmed: 'Start preparing',
  in_preparation: 'Mark ready',
  ready: 'Record balance & collection',
  deposit_required: 'Awaiting customer deposit',
  awaiting_approval: 'Awaiting customer approval',
  payment_failed: 'Awaiting corrected payment',
  changes_requested: 'Awaiting customer reply',
};

export const nextAction = (s: StatusId) => ACTIONS[s] ?? '—';

export const summaryOf = (o: Order) => {
  const s = o.items.map((l) => `${l.qty}× ${l.name}`).join(', ');
  return s.length > 56 ? s.slice(0, 54) + '…' : s;
};

export const countIn = (orders: Order[], sts: StatusId[]) => orders.filter((o) => sts.includes(o.status)).length;

export const isLive = (o: Order) => !CLOSED_STATUSES.includes(o.status);

export type OrderGroup = { id: string; label: string; statuses: StatusId[] | null };

export const ORDER_GROUPS: OrderGroup[] = [
  { id: 'all', label: 'All', statuses: null },
  { id: 'review', label: 'Needs review', statuses: ['pending_review'] },
  { id: 'approval', label: 'With customer', statuses: ['awaiting_approval', 'changes_requested'] },
  { id: 'deposit', label: 'Awaiting deposit', statuses: ['deposit_required', 'payment_failed'] },
  { id: 'verify', label: 'Verify deposit', statuses: ['deposit_submitted'] },
  { id: 'confirmed', label: 'Confirmed', statuses: ['confirmed'] },
  { id: 'prep', label: 'Preparing', statuses: ['in_preparation'] },
  { id: 'ready', label: 'Ready', statuses: ['ready', 'out_for_delivery'] },
  { id: 'done', label: 'Completed', statuses: ['collected', 'delivered'] },
  { id: 'closed', label: 'Closed', statuses: CLOSED_STATUSES },
];

export const outstandingBalance = (orders: Order[]) =>
  orders
    .filter((o) => o.total != null && isLive(o))
    .reduce((a, o) => a + ((o.total ?? 0) - o.depositPaid - o.balancePaid), 0);

export const SECTION_TITLES: Record<string, string> = {
  overview: 'Overview',
  orders: 'Orders',
  calendar: 'Calendar & availability',
  payments: 'Payments',
  products: 'Products',
  customers: 'Customers',
  content: 'Website content',
  settings: 'Settings',
};

export const patchSettings = (patch: Partial<Settings>) =>
  setStore((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
