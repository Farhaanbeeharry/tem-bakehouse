export const COLORS = {
  cream: '#F0EED9',
  paper: '#F8F6EC',
  sand: '#E5DCC5',
  line: '#D9CDB4',
  tan: '#C7B593',
  burgundy: '#711D2C',
  wine: '#4A1019',
  deep: '#3A0B14',
  cocoa: '#3B2519',
  ink: '#1E1310',
  muted: '#6E5C4D',
} as const;

export type Diet = 'regular' | 'gf' | 'both';
export type Availability = 'available' | 'soon';

export type Category = { id: string; name: string; short: string; blurb: string };

export type Flavour = {
  id: string;
  name: string;
  status: Availability;
  diet: Diet;
  dough: string;
  chip: string | null;
  note: string;
};

export type Pack = { id: string; label: string; qty: number; mult: number };

export type Product = {
  id: string;
  cat: string;
  flavour: string;
  name: string;
  status: Availability;
  diet: Diet;
  desc: string;
  price: number;
  featured?: boolean;
  flavourPick?: boolean;
  custom?: boolean;
  /** Offers a choice of filling (see FILLINGS). */
  fillings?: boolean;
  /** Customer picks this many cookies, any mix of flavours. */
  boxOf?: number;
  packs: Pack[];
};

export const FILLINGS = ['Nutella', 'Pistachio Cream', 'Cream Cheese', 'Biscoff Spread'];

/** Collection points offered at checkout. */
export const COLLECTION_POINTS = ['Terre Rouge', 'Port Louis'];

export const categories: Category[] = [
  { id: 'round', name: 'Round Cookies', short: 'Round', blurb: 'The classic. Thick, generous, one flavour each.' },
  { id: 'box', name: 'Build Your Box', short: 'Box', blurb: 'Four cookies, any mix of flavours you like.' },
  { id: 'mini', name: 'Mini Cookies', short: 'Mini', blurb: 'Small bites, made for sharing.' },
  { id: 'cups', name: 'Cookie Cups', short: 'Cups', blurb: 'Cookie dough baked into a cup and filled.' },
  { id: 'cakes', name: 'Cookie Cakes', short: 'Cakes', blurb: 'One giant cookie, personalised for the occasion.' },
  { id: 'sticks', name: 'Cookie Sticks', short: 'Sticks', blurb: 'Long, dippable, easy to hold.' },
  { id: 'shots', name: 'Cookie Shots', short: 'Shots', blurb: 'A cookie glass, ready to be filled.' },
];

// 'both' = also available gluten-free (confirmed by TEM: Choco Chips, Plain, Pinky, Nutty Crunch, Pistachio)
export const flavours: Flavour[] = [
  { id: 'choco-chips', name: 'Choco Chips', status: 'available', diet: 'both', dough: '#C68B52', chip: '#3A2116', note: 'Golden dough, generous chocolate chips.' },
  { id: 'double-choco', name: 'Double Choco', status: 'available', diet: 'regular', dough: '#5B3524', chip: '#1F100A', note: 'Chocolate dough, more chocolate inside.' },
  { id: 'red-velvet', name: 'Red Velvet', status: 'available', diet: 'regular', dough: '#8A2A2D', chip: '#F1E8D8', note: 'Deep red crumb with pale chips.' },
  { id: 'pistachio', name: 'Pistachio', status: 'available', diet: 'both', dough: '#C7AE78', chip: '#7D984C', note: 'Nutty, green-flecked, buttery.' },
  { id: 'bueno', name: 'Bueno', status: 'available', diet: 'regular', dough: '#CF9E67', chip: '#6A4128', note: 'Hazelnut cream and wafer notes.' },
  { id: 'ferrero', name: 'Ferrero', status: 'available', diet: 'regular', dough: '#A77346', chip: '#4A2A17', note: 'Hazelnut and chocolate, rich and dark.' },
  { id: 'plain', name: 'Plain', status: 'available', diet: 'both', dough: '#D8AD73', chip: null, note: 'Simple, buttery, golden.' },
  { id: 'pinky', name: 'Pinky', status: 'available', diet: 'both', dough: '#DDA7A2', chip: '#F6EEE4', note: 'Soft blush dough, pale chips.' },
  { id: 'nutty-crunch', name: 'Nutty Crunch', status: 'available', diet: 'both', dough: '#B8834F', chip: '#7A5131', note: 'Crunchy nut pieces throughout.' },
  { id: 'salted-caramel', name: 'Salted Caramel', status: 'available', diet: 'regular', dough: '#C58B4D', chip: '#E9C68B', note: 'Buttery caramel with a pinch of salt.' },
  { id: 'biscoff', name: 'Biscoff', status: 'available', diet: 'regular', dough: '#B37340', chip: '#8A4E25', note: 'Spiced caramelised biscuit.' },
];

export const flavourById: Record<string, Flavour> = Object.fromEntries(flavours.map((f) => [f.id, f]));

export const FEATURED_FLAVOURS = flavours.map((f) => f.id);

/** Flavours with a real 3D model in /public/models. */
export const MODEL_FLAVOURS = flavours.map((f) => f.id);

// Prices are PLACEHOLDERS (Rs) — not supplied by client
const roundProducts: Product[] = flavours.map((f) => ({
  id: 'round-' + f.id,
  cat: 'round',
  flavour: f.id,
  name: f.name,
  status: f.status,
  diet: f.diet,
  desc: f.note + ' A thick round cookie, baked to order.',
  price: 95,
  featured: FEATURED_FLAVOURS.includes(f.id),
  packs: [
    { id: 'p1', label: 'Single', qty: 1, mult: 1 },
    { id: 'p4', label: 'Box of 4', qty: 4, mult: 4 },
    { id: 'p6', label: 'Box of 6', qty: 6, mult: 6 },
  ],
}));

export const products: Product[] = [
  ...roundProducts,
  { id: 'build-box', cat: 'box', flavour: 'choco-chips', name: 'Build Your Box', status: 'available', diet: 'both', desc: 'Choose any four cookies — one of each, or four of your favourite.', price: 95, boxOf: 4, packs: [{ id: 'b4', label: 'Box of 4', qty: 4, mult: 4 }] },
  { id: 'mini-box', cat: 'mini', flavour: 'choco-chips', name: 'Mini Cookie Box', status: 'available', diet: 'both', desc: 'Bite-sized cookies in a box. Choose one flavour per box.', price: 350, flavourPick: true, packs: [{ id: 'm12', label: '12 minis', qty: 12, mult: 1 }, { id: 'm24', label: '24 minis', qty: 24, mult: 1.9 }] },
  { id: 'cookie-cup', cat: 'cups', flavour: 'double-choco', name: 'Cookie Cup', status: 'available', diet: 'regular', desc: 'A cookie baked into a cup shape and filled with your choice of filling.', price: 120, flavourPick: true, fillings: true, packs: [{ id: 'c1', label: 'Single', qty: 1, mult: 1 }, { id: 'c6', label: 'Set of 6', qty: 6, mult: 6 }] },
  { id: 'cookie-cake', cat: 'cakes', flavour: 'choco-chips', name: 'Cookie Cake', status: 'available', diet: 'both', desc: 'One giant cookie, personalised with your message. Ideal for an occasion.', price: 1200, flavourPick: true, custom: true, packs: [{ id: 's', label: '20 cm', qty: 1, mult: 1 }, { id: 'l', label: '28 cm', qty: 1, mult: 1.6 }] },
  { id: 'cookie-sticks', cat: 'sticks', flavour: 'plain', name: 'Cookie Sticks', status: 'available', diet: 'regular', desc: 'Long cookie sticks, made for dipping.', price: 250, flavourPick: true, packs: [{ id: 'k8', label: 'Pack of 8', qty: 8, mult: 1 }] },
  { id: 'cookie-shots', cat: 'shots', flavour: 'choco-chips', name: 'Cookie Shots', status: 'available', diet: 'regular', desc: 'Cookie shaped into a small glass, ready to be filled.', price: 300, flavourPick: true, fillings: true, packs: [{ id: 'h4', label: 'Set of 4', qty: 4, mult: 1 }] },
];

export type StatusId =
  | 'pending_review' | 'changes_requested' | 'awaiting_approval' | 'deposit_required' | 'deposit_submitted'
  | 'payment_failed' | 'confirmed' | 'in_preparation' | 'ready' | 'out_for_delivery' | 'collected'
  | 'delivered' | 'declined' | 'cancelled' | 'expired';

export type Tone = 'neutral' | 'warn' | 'action' | 'good' | 'done' | 'danger';

export type StatusDef = { label: string; tone: Tone; who: string; now: string; next: string; act: boolean };

export const statuses: Record<StatusId, StatusDef> = {
  pending_review: { label: 'Pending Review', tone: 'neutral', who: 'TEM Bakehouse', now: 'TEM Bakehouse is reviewing your request.', next: 'You will be contacted before any deposit is requested.', act: false },
  changes_requested: { label: 'Changes Requested', tone: 'warn', who: 'TEM Bakehouse', now: 'TEM Bakehouse needs a little more information about your request.', next: 'Check your messages from TEM Bakehouse.', act: true },
  awaiting_approval: { label: 'Awaiting Your Approval', tone: 'warn', who: 'You', now: 'TEM Bakehouse proposed changes to your request.', next: 'Review and approve the revised details.', act: true },
  deposit_required: { label: 'Deposit Required', tone: 'action', who: 'You', now: 'Your request was accepted.', next: 'Pay the 50% deposit and submit your payment details.', act: true },
  deposit_submitted: { label: 'Deposit Verification Pending', tone: 'neutral', who: 'TEM Bakehouse', now: 'You submitted your deposit details.', next: 'TEM Bakehouse will verify receipt. Submitting proof does not confirm the order on its own.', act: false },
  payment_failed: { label: 'Payment Verification Failed', tone: 'danger', who: 'You', now: 'TEM Bakehouse could not verify your deposit.', next: 'Submit corrected payment details.', act: true },
  confirmed: { label: 'Order Confirmed', tone: 'good', who: 'TEM Bakehouse', now: 'Your deposit was verified and your order is confirmed.', next: 'TEM Bakehouse will start preparing closer to your date.', act: false },
  in_preparation: { label: 'In Preparation', tone: 'good', who: 'TEM Bakehouse', now: 'Your cookies are being prepared.', next: 'You will be notified when they are ready.', act: false },
  ready: { label: 'Ready for Collection', tone: 'action', who: 'You', now: 'Your order is ready.', next: 'Collect at your chosen time and pay the remaining balance.', act: true },
  out_for_delivery: { label: 'Out for Delivery', tone: 'action', who: 'You', now: 'Your order is on its way.', next: 'Pay the remaining balance on delivery.', act: true },
  collected: { label: 'Collected', tone: 'done', who: '', now: 'Order complete. Thank you.', next: 'Reorder any time.', act: false },
  delivered: { label: 'Delivered', tone: 'done', who: '', now: 'Order complete. Thank you.', next: 'Reorder any time.', act: false },
  declined: { label: 'Declined', tone: 'danger', who: '', now: 'TEM Bakehouse could not accept this request.', next: 'Contact TEM Bakehouse to find another date or option.', act: false },
  cancelled: { label: 'Cancelled', tone: 'danger', who: '', now: 'This order was cancelled.', next: 'Any deposit handling follows the TEM Bakehouse Order Policy.', act: false },
  expired: { label: 'Expired Request', tone: 'danger', who: '', now: 'This request passed its deadline.', next: 'Submit a new request or contact TEM Bakehouse.', act: false },
};

export const tones: Record<Tone, { bg: string; fg: string; dot: string }> = {
  neutral: { bg: '#EFE5D6', fg: '#5A4838', dot: '#A08A70' },
  warn: { bg: '#F6E6C8', fg: '#7A4E0E', dot: '#C98A1E' },
  action: { bg: '#711D2C', fg: '#FBF8F2', dot: '#F1C9C9' },
  good: { bg: '#E2EAD6', fg: '#3D5226', dot: '#6E8C45' },
  done: { bg: '#E4DCD0', fg: '#3B2519', dot: '#3B2519' },
  danger: { bg: '#F3DCD8', fg: '#8A2320', dot: '#B23A33' },
};

export const flow: StatusId[] = ['pending_review', 'deposit_required', 'deposit_submitted', 'confirmed', 'in_preparation', 'ready', 'collected'];
export const flowLabels = ['Request received', 'Deposit requested', 'Deposit submitted', 'Order confirmed', 'In preparation', 'Ready for collection', 'Collected'];

export const DONE_STATUSES: StatusId[] = ['collected', 'delivered', 'declined', 'cancelled', 'expired'];

export type Customer = { id: string; name: string; email: string; phone: string; orders: number };

export const customers: Customer[] = [
  { id: 'u1', name: 'Aisha Ramdin', email: 'aisha@example.mu', phone: '+230 5xxx xxxx', orders: 4 },
  { id: 'u2', name: 'Kevin Li Wan', email: 'kevin@example.mu', phone: '+230 5xxx xxxx', orders: 1 },
  { id: 'u3', name: 'Priya Doorgah', email: 'priya@example.mu', phone: '+230 5xxx xxxx', orders: 2 },
  { id: 'u4', name: 'Julien Rivet', email: 'julien@example.mu', phone: '+230 5xxx xxxx', orders: 6 },
  { id: 'u5', name: 'Demo Customer', email: 'you@example.mu', phone: '+230 5xxx xxxx', orders: 2 },
];

export const DEMO_CUSTOMER_ID = 'u5';
