import { useSyncExternalStore } from 'react';
import { applyCatalog, customers as demoCustomers, flavourById, packPrice, products, type Availability, type CatalogEdits, type Customer, type Product, type ProductEdit, type StatusId } from '../data/catalog';
import { supabase } from './supabase';
import { isoDay } from './format';

// Backed by Supabase when configured (src/lib/supabase.ts), otherwise a browser-only demo in localStorage.

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
  /** Dip chosen for cookie cups / sticks. */
  dip?: string;
  /** Format chosen, e.g. Cookie Bites or Cookie Sticks. */
  style?: string;
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
  /** Category names, blurbs and photos, added categories and filling prices, edited in the back office. */
  catalog?: CatalogEdits;
  /** Photos uploaded for the Gallery page; when set they replace the stand-in photos. */
  gallery?: GalleryPhoto[];
};

export type StoreContact = {
  whatsapp: string;
  address: string;
  hours: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  email?: string;
};

export type GalleryPhoto = { url: string; caption: string };

/** Someone with back-office access. */
export type TeamMember = { id: string; name: string; email: string };

export type ProductState = { id: string; status: Availability; featured: boolean; enabled: boolean; price?: number; edit?: ProductEdit };

export type StoreState = {
  orders: Order[];
  settings: Settings;
  products: ProductState[];
  customers: Customer[];
  team: TeamMember[];
  /** Open bookings per day across all customers (Supabase mode); null means count from `orders`. */
  booked: Record<string, number> | null;
  /** False until the first load from Supabase has finished. */
  ready: boolean;
};

const KEY = 'tem_store_v2';

export const defaultSettings = (): Settings => ({
  depositPct: 50,
  leadDays: 2,
  dailyCapacity: 8,
  closedWeekdays: [1],
  collection: true,
  delivery: false,
  slots: ['10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00'],
  holidays: [isoDay(9), isoDay(10)],
  payment: 'Bank transfer\nBank: MCB\nAccount no.: 000456930523\nAccount name: Fatemah Ramankhan\nUse your order reference as the payment reference.',
});

const line = (pid: string, packId: string, qty: number, extra?: Partial<OrderLine>): OrderLine => {
  const p = products.find((x) => x.id === pid)!;
  const pk = p.packs.find((x) => x.id === packId)!;
  return { key: pid + packId + Math.random().toString(36).slice(2, 6), pid, name: p.name, pack: pk.label, packId, qty, diet: 'regular', flavour: p.flavour, unit: packPrice(p, pk), ...extra };
};

const d = isoDay;

const seedOrders = (): Order[] => [
  { ref: 'TEM-2611-041', customer: 'u1', created: d(-1), date: d(4), slot: '14:00–16:00', method: 'collection', status: 'pending_review', items: [line('round-choco-chips', 'p1', 8), line('round-pistachio', 'p1', 4)], notes: 'For a team morning tea.', total: null, depositPaid: 0, balancePaid: 0, log: [{ s: 'pending_review', t: d(-1) }], internal: '' },
  { ref: 'TEM-2611-038', customer: 'u4', created: d(-3), date: d(3), slot: '10:00–12:00', method: 'collection', status: 'deposit_submitted', items: [line('cookie-cake', 'l', 1, { custom: { occasion: 'Birthday', message: 'Joyeux anniversaire Léa', instructions: '' } })], notes: '', total: 1920, depositPaid: 0, balancePaid: 0, proof: 'transfer_screenshot.jpg', payRef: 'TEM-2611-038', log: [{ s: 'pending_review', t: d(-3) }, { s: 'deposit_required', t: d(-2) }, { s: 'deposit_submitted', t: d(-1) }], internal: '' },
  { ref: 'TEM-2611-035', customer: 'u3', created: d(-5), date: d(1), slot: '12:00–14:00', method: 'collection', status: 'in_preparation', items: [line('round-red-velvet', 'p1', 4), line('mini-box', 'm16', 1, { box: ['choco-chips', 'pistachio', 'red-velvet'] })], notes: '', total: 1235, depositPaid: 617.5, balancePaid: 0, log: [{ s: 'pending_review', t: d(-5) }, { s: 'deposit_required', t: d(-4) }, { s: 'deposit_submitted', t: d(-4) }, { s: 'confirmed', t: d(-3) }, { s: 'in_preparation', t: d(0) }], internal: 'Box with ribbon if possible.' },
  { ref: 'TEM-2611-032', customer: 'u2', created: d(-6), date: d(0), slot: '16:00–18:00', method: 'collection', status: 'ready', items: [line('round-double-choco', 'p1', 8)], notes: '', total: 760, depositPaid: 380, balancePaid: 0, log: [{ s: 'pending_review', t: d(-6) }, { s: 'deposit_required', t: d(-5) }, { s: 'deposit_submitted', t: d(-5) }, { s: 'confirmed', t: d(-4) }, { s: 'in_preparation', t: d(-1) }, { s: 'ready', t: d(0) }], internal: '' },
  { ref: 'TEM-2610-027', customer: 'u5', created: d(-20), date: d(-14), slot: '10:00–12:00', method: 'collection', status: 'collected', items: [line('round-ferrero', 'p1', 4), line('round-bueno', 'p1', 4)], notes: '', total: 950, depositPaid: 475, balancePaid: 475, log: [{ s: 'pending_review', t: d(-20) }, { s: 'confirmed', t: d(-18) }, { s: 'collected', t: d(-14) }], internal: '' },
  { ref: 'TEM-2611-030', customer: 'u1', created: d(-7), date: d(6), slot: '12:00–14:00', method: 'collection', status: 'deposit_required', items: [line('cookie-shots', 'h4', 2)], notes: '', total: 600, depositPaid: 0, balancePaid: 0, log: [{ s: 'pending_review', t: d(-7) }, { s: 'deposit_required', t: d(-6) }], internal: '' },
  { ref: 'TEM-2611-029', customer: 'u3', created: d(-8), date: d(5), slot: '10:00–12:00', method: 'collection', status: 'confirmed', items: [line('round-choco-chips', 'p1', 12)], notes: '', total: 1710, depositPaid: 855, balancePaid: 0, log: [{ s: 'pending_review', t: d(-8) }, { s: 'confirmed', t: d(-6) }], internal: '' },
  { ref: 'TEM-2610-019', customer: 'u4', created: d(-30), date: d(-25), slot: '14:00–16:00', method: 'collection', status: 'declined', items: [line('round-plain', 'p1', 40)], notes: 'Need by tomorrow', total: null, depositPaid: 0, balancePaid: 0, log: [{ s: 'pending_review', t: d(-30) }, { s: 'declined', t: d(-30) }], internal: 'Over capacity.' },
];

// Browser-only demo mode ----------------------------------------------------------

const freshState = (): StoreState => ({
  orders: seedOrders(),
  settings: defaultSettings(),
  products: products.map((p) => ({ id: p.id, status: p.status, featured: !!p.featured, enabled: true })),
  customers: demoCustomers,
  team: [],
  booked: null,
  ready: true,
});

const writeLocal = (s: StoreState) => {
  if (supabase) return;
  try {
    const { orders, settings, products: ps } = s;
    localStorage.setItem(KEY, JSON.stringify({ orders, settings, products: ps }));
  } catch {
    /* storage unavailable — state still lives in memory */
  }
};

const readLocal = (): StoreState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as StoreState;
      if (s && Array.isArray(s.orders)) return { ...freshState(), ...s, settings: { ...defaultSettings(), ...s.settings }, customers: demoCustomers, team: [], booked: null, ready: true };
    }
  } catch {
    /* corrupt or unavailable storage — fall through to fresh state */
  }
  const s = freshState();
  writeLocal(s);
  return s;
};

// Shared in-memory state ----------------------------------------------------------

let state: StoreState = supabase
  ? { orders: [], settings: defaultSettings(), products: [], customers: [], team: [], booked: {}, ready: false }
  : readLocal();
const listeners = new Set<() => void>();
// Every state change passes through here, so the catalogue always reflects the back-office edits.
const emit = () => {
  applyCatalog(state.products, state.settings.catalog);
  listeners.forEach((l) => l());
};
applyCatalog(state.products, state.settings.catalog);

const setLocal = (fn: (s: StoreState) => StoreState) => {
  state = fn(state);
  writeLocal(state);
  emit();
};

if (!supabase) {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = readLocal();
      emit();
    }
  });
}

export const getStore = () => state;

export const useStore = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );

// Supabase mode -------------------------------------------------------------------

type OrderRow = {
  ref: string;
  customer_id: string | null;
  created: string;
  date: string;
  slot: string;
  method: 'collection' | 'delivery';
  location: string | null;
  status: StatusId;
  items: OrderLine[];
  notes: string;
  estimate: number | string | null;
  total: number | string | null;
  deposit_paid: number | string;
  balance_paid: number | string;
  log: LogEntry[];
  internal: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  media_consent: boolean;
  proof: string | null;
  pay_ref: string | null;
  pay_method: string | null;
  pay_date: string | null;
  proposal: string | null;
  fail_note: string | null;
};

const opt = <T,>(v: T | null) => v ?? undefined;
const num = (v: number | string | null) => (v == null ? null : Number(v));

const fromRow = (r: OrderRow): Order => ({
  ref: r.ref,
  customer: r.customer_id ?? '',
  created: r.created,
  date: r.date,
  slot: r.slot,
  method: r.method,
  location: opt(r.location),
  status: r.status,
  items: r.items,
  notes: r.notes,
  estimate: opt(num(r.estimate)),
  total: num(r.total),
  depositPaid: Number(r.deposit_paid),
  balancePaid: Number(r.balance_paid),
  log: r.log,
  internal: r.internal,
  contactName: opt(r.contact_name),
  phone: opt(r.phone),
  email: opt(r.email),
  mediaConsent: r.media_consent,
  proof: opt(r.proof),
  payRef: opt(r.pay_ref),
  payMethod: opt(r.pay_method),
  payDate: opt(r.pay_date),
  proposal: opt(r.proposal),
  failNote: opt(r.fail_note),
});

/** Everything that can change after an order is submitted. */
const toRow = (o: Order) => ({
  date: o.date,
  slot: o.slot,
  method: o.method,
  location: o.location ?? null,
  status: o.status,
  items: o.items,
  notes: o.notes,
  estimate: o.estimate ?? null,
  total: o.total,
  deposit_paid: o.depositPaid,
  balance_paid: o.balancePaid,
  log: o.log,
  internal: o.internal,
  contact_name: o.contactName ?? null,
  phone: o.phone ?? null,
  email: o.email ?? null,
  media_consent: !!o.mediaConsent,
  proof: o.proof ?? null,
  pay_ref: o.payRef ?? null,
  pay_method: o.payMethod ?? null,
  pay_date: o.payDate ?? null,
  proposal: o.proposal ?? null,
  fail_note: o.failNote ?? null,
});

/** Orders submitted from this tab, kept so a guest still sees their confirmation page. */
const submitted = new Map<string, Order>();

type ProfileRow = { id: string; name: string; email: string; phone: string; is_admin: boolean };
type ProductRow = { id: string; status: Availability; featured: boolean; enabled: boolean; price: number | string | null; edit: ProductEdit | null };

const loadRemote = async () => {
  const sb = supabase!;
  const [settingsRes, productsRes, ordersRes, profilesRes, bookedRes] = await Promise.all([
    sb.from('settings').select('data').eq('id', 1).maybeSingle(),
    sb.from('product_state').select('id, status, featured, enabled, price, edit'),
    sb.from('orders').select('*').order('created', { ascending: false }),
    sb.from('profiles').select('id, name, email, phone, is_admin'),
    sb.rpc('booked_days'),
  ]);
  const failed = [settingsRes, productsRes, ordersRes, profilesRes, bookedRes].find((r) => r.error);
  if (failed?.error) console.error('Supabase load failed:', failed.error.message);

  const orders = ((ordersRes.data ?? []) as OrderRow[]).map(fromRow);
  for (const [ref, o] of submitted) if (!orders.some((x) => x.ref === ref)) orders.unshift(o);

  state = {
    orders,
    settings: { ...defaultSettings(), ...((settingsRes.data?.data as Partial<Settings> | undefined) ?? {}) },
    products: ((productsRes.data ?? []) as ProductRow[]).map((p) => ({ id: p.id, status: p.status, featured: p.featured, enabled: p.enabled, price: p.price == null ? undefined : Number(p.price), edit: p.edit ?? undefined })),
    team: ((profilesRes.data ?? []) as ProfileRow[]).filter((p) => p.is_admin).map((p) => ({ id: p.id, name: p.name || p.email, email: p.email })),
    customers: ((profilesRes.data ?? []) as ProfileRow[])
      .filter((p) => !p.is_admin)
      .map((p) => ({ id: p.id, name: p.name || p.email, email: p.email, phone: p.phone || '—', orders: orders.filter((o) => o.customer === p.id).length })),
    booked: Object.fromEntries(((bookedRes.data ?? []) as { date: string; count: number }[]).map((b) => [b.date, b.count])),
    ready: true,
  };
  emit();
};

let reloadTimer: number | undefined;
const reload = () => {
  window.clearTimeout(reloadTimer);
  reloadTimer = window.setTimeout(() => void loadRemote(), 150);
};

let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

/** Realtime checks row access with the session that opened the channel, so reopen it when the session changes. */
const subscribeRealtime = async () => {
  const sb = supabase!;
  if (channel) await sb.removeChannel(channel);
  channel = sb
    .channel('tem-store')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, reload)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, reload)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'product_state' }, reload)
    .subscribe();
};

if (supabase) {
  let sessionUser: string | null | undefined;
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') return;
    reload();
    const id = session?.user.id ?? null;
    if (id !== sessionUser) {
      sessionUser = id;
      setTimeout(() => void subscribeRealtime(), 0);
    }
  });
}

/** Logs a failed write and reloads, which rolls back the optimistic change. */
const report = (what: string, error: { message: string } | null) => {
  if (!error) return null;
  console.error(`${what} failed:`, error.message);
  reload();
  return error.message;
};

// Writes (both modes) -------------------------------------------------------------

/** Applies the change straight away, then saves it. Resolves to an error message, or null. */
export const updateOrder = async (ref: string, fn: (o: Order) => Order): Promise<string | null> => {
  const current = state.orders.find((o) => o.ref === ref);
  if (!current) return 'Order not found.';
  const next = fn({ ...current, log: [...(current.log || [])] });
  setLocal((s) => ({ ...s, orders: s.orders.map((o) => (o.ref === ref ? next : o)) }));
  if (!supabase) return null;
  const { error } = await supabase.from('orders').update(toRow(next)).eq('ref', ref);
  return report('Saving order ' + ref, error);
};

export type NewOrder = Omit<Order, 'ref' | 'customer' | 'created' | 'status' | 'total' | 'depositPaid' | 'balancePaid' | 'log' | 'internal'>;

/** Submits a customer's request. Supabase assigns the reference and starting status. */
export const submitOrder = async (o: NewOrder, customer: string): Promise<{ ref: string | null; error: string | null }> => {
  const base = {
    customer,
    created: isoDay(0),
    status: 'pending_review' as const,
    total: null,
    depositPaid: 0,
    balancePaid: 0,
    log: [{ s: 'pending_review' as const, t: isoDay(0) }],
    internal: '',
  };
  if (!supabase) {
    const order: Order = { ...o, ...base, ref: nextRef(state.orders) };
    setLocal((s) => ({ ...s, orders: [order, ...s.orders] }));
    return { ref: order.ref, error: null };
  }
  const { data, error } = await supabase.rpc('submit_order', { payload: o });
  if (error || typeof data !== 'string') return { ref: null, error: report('Submitting order', error) ?? 'No reference returned.' };
  const order: Order = { ...o, ...base, ref: data };
  submitted.set(data, order);
  setLocal((s) => ({ ...s, orders: [order, ...s.orders] }));
  reload();
  // Email the customer their reference. The order is already saved, so a mail failure doesn't block them.
  void supabase.functions.invoke('order-email', { body: { ref: data } }).then(({ error: mailError }) => mailError && console.warn('Order email failed:', mailError.message));
  return { ref: data, error: null };
};

export const patchSettings = async (patch: Partial<Settings>): Promise<string | null> => {
  const settings = { ...state.settings, ...patch };
  setLocal((s) => ({ ...s, settings }));
  if (!supabase) return null;
  const { error } = await supabase.from('settings').upsert({ id: 1, data: settings, updated_at: new Date().toISOString() });
  return report('Saving settings', error);
};

export const patchProduct = async (id: string, patch: Partial<ProductState>): Promise<string | null> => {
  const base = products.find((p) => p.id === id);
  const existing = state.products.find((x) => x.id === id);
  const next: ProductState = { ...(existing ?? { id, status: base?.status ?? 'available', featured: !!base?.featured, enabled: true }), ...patch };
  setLocal((s) => ({ ...s, products: existing ? s.products.map((x) => (x.id === id ? next : x)) : [...s.products, next] }));
  if (!supabase) return null;
  const { error } = await supabase
    .from('product_state')
    .upsert({ id, status: next.status, featured: next.featured, enabled: next.enabled, price: next.price ?? null, edit: next.edit ?? null, updated_at: new Date().toISOString() });
  return report('Saving product ' + id, error);
};

/** Gives or removes back-office access. Customers become admins; admins can't remove themselves. */
export const setAdmin = async (id: string, on: boolean): Promise<string | null> => {
  if (!supabase) return 'Team access needs the live database.';
  const { error } = await supabase.from('profiles').update({ is_admin: on }).eq('id', id);
  if (!error) reload();
  return report(on ? 'Giving access' : 'Removing access', error);
};

/** Removes a product added in the back office. */
export const deleteProduct = async (id: string): Promise<string | null> => {
  setLocal((s) => ({ ...s, products: s.products.filter((x) => x.id !== id) }));
  if (!supabase) return null;
  const { error } = await supabase.from('product_state').delete().eq('id', id);
  return report('Deleting product ' + id, error);
};

/** Uploads a back-office photo and returns its public URL (a data URL in the browser-only demo). */
export const uploadPhoto = async (file: File, folder: string): Promise<{ url: string | null; error: string | null }> => {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return { url: null, error: 'Use a PNG, JPG or WebP image.' };
  if (file.size > 8 * 1024 * 1024) return { url: null, error: 'That image is over 8 MB. Please use a smaller one.' };
  if (!supabase) {
    const url = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.readAsDataURL(file);
    });
    return { url, error: null };
  }
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('catalog').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) return { url: null, error: report('Uploading photo', error) };
  return { url: supabase.storage.from('catalog').getPublicUrl(path).data.publicUrl, error: null };
};

export const pushStatus = (o: Order, status: StatusId): Order => ({ ...o, status, log: [...o.log, { s: status, t: isoDay(0) }] });

/** TEM-YYMM-NNN, one higher than the highest number used this month (demo mode; Supabase assigns its own). */
export const nextRef = (orders: Order[]) => {
  const d = new Date();
  const prefix = `TEM-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-`;
  const used = orders.filter((o) => o.ref.startsWith(prefix)).map((o) => Number(o.ref.slice(prefix.length)) || 0);
  return prefix + String(Math.max(41, ...used) + 1).padStart(3, '0');
};

export const estimateOf = (items: OrderLine[]) => items.reduce((a, l) => a + l.unit * l.qty, 0);

/** Open bookings per day across every customer, for capacity checks. */
export const bookedCounts = (s: StoreState): Record<string, number> => {
  if (s.booked) return s.booked;
  const counts: Record<string, number> = {};
  s.orders.forEach((o) => {
    if (!['declined', 'cancelled', 'expired'].includes(o.status)) counts[o.date] = (counts[o.date] || 0) + 1;
  });
  return counts;
};

/** Current round-cookie price of a flavour (admin price overrides included), for box and filling maths. */
export const cookiePriceFrom = (P: Product[]) => (flavour: string) => P.find((x) => x.id === 'round-' + flavour)?.price ?? flavourById[flavour]?.price ?? 0;

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
