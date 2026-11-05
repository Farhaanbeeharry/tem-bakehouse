import { useSyncExternalStore } from 'react';
import { products, type Availability, type StatusId } from '../data/catalog';
import { isoDay } from './format';

// PROTOTYPE ONLY: persisted in localStorage, shared between the storefront and /admin (and across tabs).

export type Custom = { occasion: string; message: string; instructions: string };

export type OrderLine = {
  key: string;
  pid: string;
  name: string;
  flavour: string;
  pack: string;
  packId: string;
  qty: number;
  diet: 'regular' | 'gf';
  unit: number;
  custom?: Custom | null;
  filling?: string;
  /** Flavour ids chosen for a Build Your Box line. */
  box?: string[];
};

export type LogEntry = { s: StatusId; t: string };

export type Order = {
  ref: string;
  customer: string;
  created: string;
  date: string;
  slot: string;
  method: 'collection' | 'delivery';
  location?: string;
  status: StatusId;
  items: OrderLine[];
  notes: string;
  estimate?: number;
  total: number | null;
  depositPaid: number;
  balancePaid: number;
  log: LogEntry[];
  internal: string;
  contactName?: string;
  phone?: string;
  email?: string;
  mediaConsent?: boolean;
  proof?: string;
  payRef?: string;
  payMethod?: string;
  payDate?: string;
  proposal?: string;
  failNote?: string;
};

export type Settings = {
  depositPct: number;
  leadDays: number;
  dailyCapacity: number;
  closedWeekdays: number[];
  collection: boolean;
  delivery: boolean;
  slots: string[];
  holidays: string[];
  payment: string;
  deliveryFee?: number;
  deliveryAreas?: string;
  depositDeadlineHours?: number;
  notifications?: Record<string, boolean>;
  contact?: StoreContact;
};

export type StoreContact = { whatsapp: string; address: string; hours: string };

export type ProductState = { id: string; status: Availability; featured: boolean; enabled: boolean; price?: number };

export type StoreState = { orders: Order[]; settings: Settings; products: ProductState[] };

const KEY = 'tem_store_v2';

const defaultSettings = (): Settings => ({
  depositPct: 50,
  leadDays: 2,
  dailyCapacity: 8,
  closedWeekdays: [1],
  collection: true,
  delivery: false,
  slots: ['10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00'],
  holidays: [isoDay(9), isoDay(10)],
  payment: 'Bank transfer — account details to be supplied by TEM Bakehouse. Use your order reference as the payment reference.',
});

const line = (pid: string, packId: string, qty: number, extra?: Partial<OrderLine>): OrderLine => {
  const p = products.find((x) => x.id === pid)!;
  const pk = p.packs.find((x) => x.id === packId)!;
  return { key: pid + packId + Math.random().toString(36).slice(2, 6), pid, name: p.name, pack: pk.label, packId, qty, diet: 'regular', flavour: p.flavour, unit: p.price * pk.mult, ...extra };
};

const d = isoDay;

const seedOrders = (): Order[] => [
  { ref: 'TEM-2611-041', customer: 'u1', created: d(-1), date: d(4), slot: '14:00–16:00', method: 'collection', status: 'pending_review', items: [line('round-choco-chips', 'p6', 2), line('round-pistachio', 'p4', 1)], notes: 'For a team morning tea.', total: null, depositPaid: 0, balancePaid: 0, log: [{ s: 'pending_review', t: d(-1) }], internal: '' },
  { ref: 'TEM-2611-038', customer: 'u4', created: d(-3), date: d(3), slot: '10:00–12:00', method: 'collection', status: 'deposit_submitted', items: [line('cookie-cake', 'l', 1, { custom: { occasion: 'Birthday', message: 'Joyeux anniversaire Léa', instructions: '' } })], notes: '', total: 1920, depositPaid: 0, balancePaid: 0, proof: 'transfer_screenshot.jpg', payRef: 'TEM-2611-038', log: [{ s: 'pending_review', t: d(-3) }, { s: 'deposit_required', t: d(-2) }, { s: 'deposit_submitted', t: d(-1) }], internal: '' },
  { ref: 'TEM-2611-035', customer: 'u3', created: d(-5), date: d(1), slot: '12:00–14:00', method: 'collection', status: 'in_preparation', items: [line('round-red-velvet', 'p6', 1), line('mini-box', 'm24', 1)], notes: '', total: 1235, depositPaid: 617.5, balancePaid: 0, log: [{ s: 'pending_review', t: d(-5) }, { s: 'deposit_required', t: d(-4) }, { s: 'deposit_submitted', t: d(-4) }, { s: 'confirmed', t: d(-3) }, { s: 'in_preparation', t: d(0) }], internal: 'Box with ribbon if possible.' },
  { ref: 'TEM-2611-032', customer: 'u2', created: d(-6), date: d(0), slot: '16:00–18:00', method: 'collection', status: 'ready', items: [line('round-double-choco', 'p4', 2)], notes: '', total: 760, depositPaid: 380, balancePaid: 0, log: [{ s: 'pending_review', t: d(-6) }, { s: 'deposit_required', t: d(-5) }, { s: 'deposit_submitted', t: d(-5) }, { s: 'confirmed', t: d(-4) }, { s: 'in_preparation', t: d(-1) }, { s: 'ready', t: d(0) }], internal: '' },
  { ref: 'TEM-2610-027', customer: 'u5', created: d(-20), date: d(-14), slot: '10:00–12:00', method: 'collection', status: 'collected', items: [line('round-ferrero', 'p6', 1), line('round-bueno', 'p4', 1)], notes: '', total: 950, depositPaid: 475, balancePaid: 475, log: [{ s: 'pending_review', t: d(-20) }, { s: 'confirmed', t: d(-18) }, { s: 'collected', t: d(-14) }], internal: '' },
  { ref: 'TEM-2611-030', customer: 'u1', created: d(-7), date: d(6), slot: '12:00–14:00', method: 'collection', status: 'deposit_required', items: [line('cookie-shots', 'h4', 2)], notes: '', total: 600, depositPaid: 0, balancePaid: 0, log: [{ s: 'pending_review', t: d(-7) }, { s: 'deposit_required', t: d(-6) }], internal: '' },
  { ref: 'TEM-2611-029', customer: 'u3', created: d(-8), date: d(5), slot: '10:00–12:00', method: 'collection', status: 'confirmed', items: [line('round-choco-chips', 'p6', 3)], notes: '', total: 1710, depositPaid: 855, balancePaid: 0, log: [{ s: 'pending_review', t: d(-8) }, { s: 'confirmed', t: d(-6) }], internal: '' },
  { ref: 'TEM-2610-019', customer: 'u4', created: d(-30), date: d(-25), slot: '14:00–16:00', method: 'collection', status: 'declined', items: [line('round-plain', 'p4', 10)], notes: 'Need by tomorrow', total: null, depositPaid: 0, balancePaid: 0, log: [{ s: 'pending_review', t: d(-30) }, { s: 'declined', t: d(-30) }], internal: 'Over capacity.' },
];

const freshState = (): StoreState => ({
  orders: seedOrders(),
  settings: defaultSettings(),
  products: products.map((p) => ({ id: p.id, status: p.status, featured: !!p.featured, enabled: true })),
});

const read = (): StoreState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as StoreState;
      if (s && Array.isArray(s.orders)) return { ...s, settings: { ...defaultSettings(), ...s.settings } };
    }
  } catch {
    /* corrupt or unavailable storage — fall through to fresh state */
  }
  const s = freshState();
  write(s);
  return s;
};

const write = (s: StoreState) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable — state still lives in memory */
  }
};

let state: StoreState = read();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    state = read();
    emit();
  }
});

export const getStore = () => state;

export const setStore = (fn: (s: StoreState) => StoreState) => {
  state = fn(state);
  write(state);
  emit();
};

export const resetStore = () => {
  state = freshState();
  write(state);
  emit();
};

export const useStore = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );

export const updateOrder = (ref: string, fn: (o: Order) => Order) =>
  setStore((s) => ({ ...s, orders: s.orders.map((o) => (o.ref === ref ? fn({ ...o, log: [...(o.log || [])] }) : o)) }));

export const pushStatus = (o: Order, status: StatusId): Order => ({ ...o, status, log: [...o.log, { s: status, t: isoDay(0) }] });

/** TEM-YYMM-NNN, one higher than the highest number used this month, so refs never repeat. */
export const nextRef = (orders: Order[]) => {
  const d = new Date();
  const prefix = `TEM-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-`;
  const used = orders.filter((o) => o.ref.startsWith(prefix)).map((o) => Number(o.ref.slice(prefix.length)) || 0);
  return prefix + String(Math.max(41, ...used) + 1).padStart(3, '0');
};

export const estimateOf = (items: OrderLine[]) => items.reduce((a, l) => a + l.unit * l.qty, 0);

/** Catalogue merged with the admin-editable product state (status / featured / enabled / price). */
export const useProducts = () => {
  const { products: ps } = useStore();
  return products
    .map((p) => {
      const o = ps.find((x) => x.id === p.id);
      return o ? { ...p, status: o.status, featured: o.featured, enabled: o.enabled, price: o.price ?? p.price } : { ...p, enabled: true };
    })
    .filter((p) => p.enabled !== false);
};
