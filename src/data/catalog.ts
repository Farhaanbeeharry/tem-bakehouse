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

export type Category = { id: string; name: string; short: string; blurb: string; /** Has its own page instead of a menu tab. */ hidden?: boolean; /** Uploaded in the back office; replaces the bundled category photo. */ photo?: string };

export type Flavour = {
  id: string;
  name: string;
  status: Availability;
  diet: Diet;
  dough: string;
  chip: string | null;
  note: string;
  /** Price of one round cookie (Rs). */
  price: number;
  ingredients: string;
  /** Names from FILLINGS that this flavour can be filled with. */
  fillings: string[];
  /** Uploaded in the back office; replace the bundled cookie photos. */
  photo?: string;
  photoBroken?: string;
};

/** A priced add-on: round-cookie fillings, cookie-stick dips. */
export type Extra = { name: string; price: number };

export type Pack = {
  id: string;
  label: string;
  qty: number;
  /** Pack price = product price × mult (rounded to the rupee). */
  mult: number;
  /** Number of different flavours the customer picks for this pack (mini box). */
  pick?: number;
};

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
  hidden?: boolean;
  flavourPick?: boolean;
  /** Flavours offered when flavourPick is on (defaults to every available flavour). */
  flavours?: string[];
  custom?: boolean;
  /** Optional paid filling, limited to what the chosen flavour allows (round cookies). */
  fillings?: boolean;
  /** Filling that always comes with the product. */
  fixedFilling?: string;
  /** Optional paid dip, priced per pack. */
  dips?: Extra[];
  /** Dip included in the price; one must be chosen. */
  dipChoice?: string[];
  /** Format to choose, e.g. bites or sticks; one must be chosen. */
  styles?: string[];
  /** Customer picks this many cookies, any mix of flavours. */
  boxOf?: number;
  /** Fixed contents of a curated box. */
  contents?: string[];
  /** Box price = this fee + the round-cookie price of each cookie chosen. */
  boxFee?: number;
  /** Shown under the pack sizes, e.g. other sizes on request. */
  packNote?: string;
  /** Overrides the flavour's ingredient list. */
  ingredients?: string;
  /** Replaces the reheat instructions in Cookie care. */
  care?: string;
  packs: Pack[];
  /** Uploaded in the back office; replaces the bundled product photo. */
  photo?: string;
  /** Created in the back office (can be deleted there). */
  added?: boolean;
};

export const FILLINGS: Extra[] = [
  { name: 'Nutella', price: 10 },
  { name: 'Pistachio Spread', price: 15 },
  { name: 'Cream Cheese', price: 15 },
  { name: 'Biscoff Spread', price: 17 },
  { name: 'Bueno Spread', price: 17 },
  { name: 'Caramel Sauce', price: 10 },
];

/** Collection points offered at checkout. */
export const COLLECTION_POINTS = ['Terre Rouge', 'Port Louis'];
export const COLLECTION_LANDMARKS: Record<string, string> = { 'Terre Rouge': 'Near Winners', 'Port Louis': 'Near ICC' };

/** Shown on The Cookie Collection page. */
export const PACKAGING_INCLUDED = 'Your cookies arrive beautifully packaged, and the packaging is already included in the price.';

/** Shown on product pages and in the order request. */
export const PACKAGING_NOTE = `${PACKAGING_INCLUDED} Personalised touches and packaging are available on request, with an additional cost.`;

export const categories: Category[] = [
  { id: 'round', name: 'Round Cookies', short: 'Round', blurb: 'The classic: thick, generous and baked in your flavour.' },
  { id: 'box', name: 'Build Your Box', short: 'Box', blurb: 'Pick four, mix freely, and make it yours.' },
  { id: 'grande', name: 'The Grande Cookie', short: 'Grande', blurb: 'Nine centimetres, thick and chewy, in any two flavours: made to break in half and share.' },
  { id: 'mini', name: 'Mini Cookies', short: 'Mini', blurb: 'Small in size, warm in feeling, and made to be shared.' },
  { id: 'cups', name: 'Cookie Cups', short: 'Cups', blurb: 'One hand, one dip, one memorable moment: cookie sticks or bites, made to stand out.' },
  { id: 'cakes', name: 'Cookie Cakes', short: 'Cakes', blurb: 'One giant cookie, personalised for the occasion.' },
  { id: 'sticks', name: 'Cookie Sticks', short: 'Sticks', blurb: 'Long, dippable, easy to hold, easy to share.' },
  { id: 'shots', name: 'Cookie Shots', short: 'Shots', blurb: 'Fill it, sip it, savour it: a cookie shot for moments that linger.' },
  { id: 'collection', name: 'The Cookie Collection', short: 'Collection', blurb: 'Our mains: one story, told in five sweet expressions.', hidden: true },
];

const BASE = 'Butter, caster sugar, brown sugar, eggs, vanilla extract, salt';
const ALL_FILLINGS = ['Nutella', 'Pistachio Spread', 'Cream Cheese', 'Biscoff Spread', 'Bueno Spread'];

// 'both' = also available gluten-free (confirmed by TEM: Choco Chip, The Original, Pinky, Nutty Crunch, Pistachio)
export const flavours: Flavour[] = [
  { id: 'plain', name: 'The Original', status: 'available', diet: 'both', dough: '#D8AD73', chip: null, price: 95, note: 'Where it all began, with a gentle biscuit bite and a tender centre.', ingredients: `${BASE} and flour.`, fillings: ALL_FILLINGS },
  { id: 'pinky', name: 'Pinky', status: 'available', diet: 'both', dough: '#C99A62', chip: '#8C623D', price: 100, note: 'Like our Nutty Crunch, with less sugar and an extra crunch.', ingredients: `${BASE}, nuts and flour.`, fillings: ['Nutella', 'Pistachio Spread', 'Biscoff Spread', 'Bueno Spread'] },
  { id: 'choco-chips', name: 'Choco Chip', status: 'available', diet: 'both', dough: '#C68B52', chip: '#3A2116', price: 130, note: 'Timeless comfort — the one you already know, and love anyway.', ingredients: `${BASE}, flour, milk chocolate chips and dark chocolate.`, fillings: ['Nutella', 'Biscoff Spread', 'Bueno Spread'] },
  { id: 'double-choco', name: 'Double Choco', status: 'available', diet: 'regular', dough: '#5B3524', chip: '#1F100A', price: 135, note: 'Chocolate doubled down, no apologies.', ingredients: `${BASE}, flour, cocoa powder and dark chocolate.`, fillings: ['Nutella', 'Biscoff Spread', 'Bueno Spread'] },
  { id: 'nutty-crunch', name: 'Nutty Crunch', status: 'available', diet: 'both', dough: '#B8834F', chip: '#7A5131', price: 140, note: 'Every bite snaps with a little wild crunch.', ingredients: `${BASE}, flour, almonds, cashews and pistachio chunks.`, fillings: ['Nutella', 'Biscoff Spread', 'Bueno Spread'] },
  { id: 'red-velvet', name: 'Red Velvet', status: 'available', diet: 'regular', dough: '#8A2A2D', chip: '#F1E8D8', price: 155, note: 'Soft blush of sweetness wrapped in velvet.', ingredients: 'Butter, caster sugar, brown sugar, cream cheese, eggs, vanilla extract, salt, flour and white chocolate chips.', fillings: ['Cream Cheese'] },
  { id: 'pistachio', name: 'Pistachio', status: 'available', diet: 'both', dough: '#C7AE78', chip: '#7D984C', price: 160, note: 'Green, nutty & quietly luxurious.', ingredients: 'Butter, caster sugar, brown sugar, pistachio cream, pistachio paste, eggs, vanilla extract, salt, green food colouring, flour and pistachio chunks.', fillings: ['Nutella', 'Pistachio Spread', 'Biscoff Spread', 'Bueno Spread'] },
  { id: 'ferrero', name: 'Praline Dream', status: 'available', diet: 'regular', dough: '#A77346', chip: '#4A2A17', price: 170, note: 'The flavour you know, in a cookie you won’t forget.', ingredients: 'Butter, caster sugar, brown sugar, rocher cream, Ferrero Rocher chocolate, eggs, vanilla extract, salt and flour.', fillings: ['Nutella', 'Bueno Spread'] },
  { id: 'bueno', name: 'Bueno', status: 'available', diet: 'regular', dough: '#CF9E67', chip: '#6A4128', price: 170, note: 'Creamy, crunchy and impossible to stop at one.', ingredients: 'Butter, caster sugar, brown sugar, bueno cream, Kinder Bueno chocolate, eggs, vanilla extract, salt and flour.', fillings: ['Nutella', 'Biscoff Spread', 'Bueno Spread'] },
  { id: 'salted-caramel', name: 'Salted Caramel', status: 'available', diet: 'regular', dough: '#C58B4D', chip: '#E9C68B', price: 170, note: 'The sweet-and-salty comfort you’ll think about long after the last crumb.', ingredients: `${BASE}, flour, caramel chunks, salted caramel sauce and sea salt flakes.`, fillings: ['Caramel Sauce'] },
  { id: 'biscoff', name: 'Biscoff', status: 'available', diet: 'regular', dough: '#B37340', chip: '#8A4E25', price: 170, note: 'Spiced caramel cookie with a creamy centre.', ingredients: `${BASE}, flour and Biscoff spread.`, fillings: ['Biscoff Spread'] },
];

export const flavourById: Record<string, Flavour> = Object.fromEntries(flavours.map((f) => [f.id, f]));

export const FEATURED_FLAVOURS = flavours.map((f) => f.id);

/** Flavours with a real 3D model in /public/models. */
export const MODEL_FLAVOURS = flavours.map((f) => f.id);

const VARIES = 'Ingredients vary depending on the flavour you choose. Refer to the single-flavour round cookies for the full ingredients list.';
const CLASSIC_FOUR = ['choco-chips', 'plain', 'pistachio', 'double-choco'];

/** The Cookie Collection: First Edition. TEM's five mains. */
export const COLLECTION_FLAVOURS = ['choco-chips', 'double-choco', 'pistachio', 'red-velvet', 'nutty-crunch'];

const ROUND_PACKS: Pack[] = [{ id: 'p1', label: 'Single', qty: 1, mult: 1 }];

const roundProducts: Product[] = flavours.map((f) => ({
  id: 'round-' + f.id,
  cat: 'round',
  flavour: f.id,
  name: f.name,
  status: f.status,
  diet: f.diet,
  desc: f.note,
  price: f.price,
  featured: FEATURED_FLAVOURS.includes(f.id),
  fillings: f.fillings.length > 0,
  packs: ROUND_PACKS,
}));

export const products: Product[] = [
  ...roundProducts,
  { id: 'build-box', cat: 'box', flavour: 'choco-chips', name: 'Build Your Box', status: 'available', diet: 'both', desc: 'Pick four, mix freely, and make it yours. Each cookie is priced by its flavour, plus Rs 75 for the box.', price: 75, boxFee: 75, boxOf: 4, ingredients: VARIES, packs: [{ id: 'b4', label: 'Box of 4', qty: 4, mult: 1 }] },
  { id: 'grande', cat: 'grande', flavour: 'choco-chips', name: 'The Grande Cookie (9 cm)', status: 'available', diet: 'regular', desc: 'At 9 cm, it’s thick and chewy, the kind of cookie you break in half to share, then wish you hadn’t. Pick any two flavours.', price: 275, boxOf: 2, ingredients: VARIES, packs: [{ id: 'g2', label: 'Box of 2', qty: 2, mult: 1 }] },
  { id: 'mini-box', cat: 'mini', flavour: 'choco-chips', name: 'Mini Cookie Box', status: 'available', diet: 'both', desc: 'Bite-sized cookies in a box. Small enough to enjoy one after another.', price: 350, ingredients: VARIES, packs: [{ id: 'm12', label: 'Box of 12', qty: 12, mult: 1, pick: 3 }, { id: 'm16', label: 'Box of 16', qty: 16, mult: 450 / 350, pick: 4 }] },
  { id: 'cookie-cup', cat: 'cups', flavour: 'double-choco', name: 'Cookie Cup', status: 'available', diet: 'regular', desc: 'Cookie bites or sticks, easy to hold in one hand and made to stand out: one dip, one memorable moment.', price: 300, flavourPick: true, flavours: CLASSIC_FOUR, styles: ['Cookie Bites', 'Cookie Sticks'], dipChoice: ['Nutella', 'Biscoff Spread', 'Bueno Spread'], ingredients: VARIES, packs: [{ id: 'c1', label: 'One size', qty: 1, mult: 1 }] },
  { id: 'cookie-cake', cat: 'cakes', flavour: 'choco-chips', name: 'Cookie Cake', status: 'available', diet: 'both', desc: 'The cookie you celebrate with, baked for birthdays, gatherings and every moment in between.', price: 1000, flavourPick: true, flavours: ['choco-chips', 'double-choco', 'red-velvet', 'pistachio', 'nutty-crunch', 'plain'], fixedFilling: 'Chocolate Hazelnut Spread', custom: true, ingredients: VARIES, packNote: 'Other sizes available upon request — get in touch.', packs: [{ id: 's', label: '15 cm', qty: 1, mult: 1 }, { id: 'l', label: '20 cm', qty: 1, mult: 1.3 }] },
  { id: 'cookie-sticks', cat: 'sticks', flavour: 'plain', name: 'Cookie Sticks', status: 'available', diet: 'both', desc: 'Crisp outside, soft within, and reimagined for dipping and easy, one-handed snacking.', price: 325, flavourPick: true, flavours: CLASSIC_FOUR, dips: [{ name: 'Nutella', price: 15 }, { name: 'Bueno Spread', price: 15 }, { name: 'Pistachio Spread', price: 20 }], ingredients: VARIES, packs: [{ id: 'k20', label: 'Box of 20', qty: 20, mult: 1 }, { id: 'k30', label: 'Box of 30', qty: 30, mult: 400 / 325 }] },
  { id: 'cookie-shots', cat: 'shots', flavour: 'choco-chips', name: 'Cookie Shots', status: 'available', diet: 'regular', desc: 'Our speciality: Cookie shaped into a small glass, ready to be filled. Sip, bite, repeat.', price: 700, flavourPick: true, flavours: ['choco-chips'], ingredients: 'Butter, caster sugar, brown sugar, eggs, vanilla extract, salt, flour, milk chocolate chips, dark chocolate chips, milk chocolate or dark chocolate-lined.', care: 'Extra care: Refrigerate if not serving immediately. When the moment is right, let it sit at room temperature for 15 minutes, pour your favourite drink and have it your way.', packs: [{ id: 'h2', label: 'Set of 2', qty: 2, mult: 1 }, { id: 'h4', label: 'Set of 4', qty: 4, mult: 1200 / 700 }] },
  { id: 'cookie-collection', cat: 'collection', flavour: 'choco-chips', name: 'The Cookie Collection: First Edition', status: 'available', diet: 'regular', hidden: true, desc: 'Our five mains: Classic Choco Chip, Double Choco, Pistachio, Red Velvet and Nutty Crunch.', price: 1000, contents: COLLECTION_FLAVOURS, ingredients: VARIES, packs: [{ id: 'e1', label: 'Box of 9', qty: 9, mult: 1 }] },
];

// Back-office edits --------------------------------------------------------------
// The lists above are the built-in catalogue. What the owner changes in the back office is stored in
// Supabase (product_state.edit and settings.catalog) and applied on top of them by applyCatalog, which
// rebuilds these exported lists in place so every page picks the changes up on its next render.

/** A pack size with its own price, as edited in the back office. */
export type PackEdit = { id: string; label: string; qty: number; price: number; pick?: number };

export type ProductEdit = {
  name?: string;
  desc?: string;
  ingredients?: string;
  diet?: Diet;
  packs?: PackEdit[];
  /** Round cookies: fillings this flavour can take. */
  fillings?: string[];
  photo?: string;
  photoBroken?: string;
  /** Set on products created in the back office. */
  def?: { cat: string; flavourPick?: boolean; custom?: boolean; dough?: string };
};

export type CategoryEdit = { id: string; name: string; blurb: string; photo?: string; added?: boolean };
export type CatalogEdits = { categories?: CategoryEdit[]; fillings?: Extra[] };
export type ProductEditRow = { id: string; price?: number; edit?: ProductEdit };


const roundProduct = (f: Flavour, featured: boolean): Product => ({
  id: 'round-' + f.id,
  cat: 'round',
  flavour: f.id,
  name: f.name,
  status: f.status,
  diet: f.diet,
  desc: f.note,
  price: f.price,
  featured,
  fillings: f.fillings.length > 0,
  packs: ROUND_PACKS,
});

const BUILT_IN = {
  flavours: structuredClone(flavours),
  products: structuredClone(products),
  categories: structuredClone(categories),
  fillings: structuredClone(FILLINGS),
};

const replaceAll = <T,>(target: T[], items: T[]) => {
  target.splice(0, target.length, ...items);
};

const editedPacks = (packs: Pack[], edits: PackEdit[] | undefined, price: number): Pack[] =>
  edits?.length
    ? edits.map((k) => ({ id: k.id, label: k.label, qty: k.qty, mult: price > 0 ? k.price / price : 1, pick: k.pick ?? packs.find((x) => x.id === k.id)?.pick }))
    : packs;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'item';

let lastKey = '';

/** Rebuilds flavours, products, categories and fillings from the built-in catalogue plus the owner's edits. */
export const applyCatalog = (rows: ProductEditRow[], extra: CatalogEdits | undefined) => {
  const key = JSON.stringify([rows.map((r) => [r.id, r.price, r.edit]), extra]);
  if (key === lastKey) return;
  lastKey = key;
  const byId = new Map(rows.map((r) => [r.id, r]));

  // Round cookies are flavours: built-in ones, then any added in the back office.
  const fl: Flavour[] = BUILT_IN.flavours.map((f) => ({ ...f }));
  for (const r of rows) {
    const id = r.id.slice('round-'.length);
    if (r.id.startsWith('round-') && r.edit?.def && !fl.some((f) => f.id === id)) {
      fl.push({ id, name: r.edit.name || 'New cookie', status: 'available', diet: r.edit.diet ?? 'regular', dough: r.edit.def.dough ?? '#C68B52', chip: null, note: r.edit.desc ?? '', price: r.price ?? 0, ingredients: r.edit.ingredients ?? '', fillings: r.edit.fillings ?? [] });
    }
  }
  for (const f of fl) {
    const r = byId.get('round-' + f.id);
    if (!r) continue;
    const e = r.edit;
    f.name = e?.name || f.name;
    f.note = e?.desc ?? f.note;
    f.ingredients = e?.ingredients ?? f.ingredients;
    f.diet = e?.diet ?? f.diet;
    f.fillings = e?.fillings ?? f.fillings;
    f.price = r.price ?? f.price;
    f.photo = e?.photo;
    f.photoBroken = e?.photoBroken;
  }
  replaceAll(flavours, fl);
  for (const k of Object.keys(flavourById)) delete flavourById[k];
  for (const f of fl) flavourById[f.id] = f;

  // Products: round cookies from the flavours above, the other built-in products, then added ones.
  const builtInIds = new Set(BUILT_IN.products.map((p) => p.id));
  const ps: Product[] = [
    ...fl.map((f) => {
      const base = BUILT_IN.products.find((p) => p.id === 'round-' + f.id);
      return { ...roundProduct(f, base ? !!base.featured : true), added: !base };
    }),
    ...BUILT_IN.products.filter((p) => p.cat !== 'round').map((p) => ({ ...p })),
    ...rows
      .filter((r) => r.edit?.def && !r.id.startsWith('round-') && !builtInIds.has(r.id))
      .map((r): Product => {
        const e = r.edit!;
        return {
          id: r.id,
          cat: e.def!.cat,
          flavour: 'choco-chips',
          name: e.name || 'New product',
          status: 'available',
          diet: e.diet ?? 'regular',
          desc: e.desc ?? '',
          price: r.price ?? 0,
          flavourPick: e.def!.flavourPick,
          custom: e.def!.custom,
          ingredients: e.ingredients,
          packs: [{ id: 'k1', label: 'One size', qty: 1, mult: 1 }],
          added: true,
        };
      }),
  ];
  for (const p of ps) {
    const r = byId.get(p.id);
    if (!r) continue;
    const e = r.edit;
    const price = r.price ?? p.price;
    p.price = price;
    if (p.boxFee != null) p.boxFee = price;
    if (p.cat !== 'round') {
      p.name = e?.name || p.name;
      p.desc = e?.desc ?? p.desc;
      p.ingredients = e?.ingredients ?? p.ingredients;
      p.diet = e?.diet ?? p.diet;
      p.photo = e?.photo;
    }
    p.packs = editedPacks(p.packs, e?.packs, price);
  }
  replaceAll(products, ps);

  // Categories: renamed / re-described / new photo, plus categories added in the back office.
  const catEdits = extra?.categories ?? [];
  const cats: Category[] = BUILT_IN.categories.map((c) => {
    const e = catEdits.find((x) => x.id === c.id);
    return e ? { ...c, name: e.name || c.name, short: e.name || c.short, blurb: e.blurb ?? c.blurb, photo: e.photo } : { ...c };
  });
  for (const e of catEdits) if (e.added && !cats.some((c) => c.id === e.id)) cats.push({ id: e.id, name: e.name, short: e.name, blurb: e.blurb, photo: e.photo });
  replaceAll(categories, cats);

  replaceAll(FILLINGS, extra?.fillings?.length ? extra.fillings.map((f) => ({ ...f })) : BUILT_IN.fillings.map((f) => ({ ...f })));
};

/** Flavours a product can be made in. */
export const productFlavours = (p: Product) => flavours.filter((f) => f.status === 'available' && (!p.flavours || p.flavours.includes(f.id)));

/** Price of one pack, before extras. */
export const packPrice = (p: Product, pk: Pack) => Math.round(p.price * pk.mult);

export type LineChoice = { filling?: string; dip?: string; box?: string[] };

/**
 * Price of one line unit: the pack, plus a paid filling (per cookie) or dip (per pack).
 * Build Your Box adds up the round-cookie price of each cookie chosen, plus the box fee.
 * `cookiePrice` gives the current round-cookie price of a flavour (admin overrides included).
 */
export const unitPrice = (p: Product, pk: Pack, c: LineChoice, cookiePrice: (flavour: string) => number) => {
  let unit = p.boxFee != null ? p.boxFee + (c.box ?? []).reduce((a, id) => a + cookiePrice(id), 0) : packPrice(p, pk);
  if (p.fillings && c.filling) unit += (FILLINGS.find((f) => f.name === c.filling)?.price ?? 0) * pk.qty;
  if (p.dips && c.dip) unit += p.dips.find((d) => d.name === c.dip)?.price ?? 0;
  return unit;
};

/** Lowest price a customer can pay for the product, for "from" labels. */
export const fromPrice = (p: Product, cookiePrice: (flavour: string) => number) => {
  if (p.boxFee != null && p.boxOf) {
    const cheapest = Math.min(...flavours.filter((f) => f.status === 'available').map((f) => cookiePrice(f.id)));
    return p.boxFee + cheapest * p.boxOf;
  }
  return Math.min(...p.packs.map((k) => packPrice(p, k)));
};

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
