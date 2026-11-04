export const fmt = (n: number) => 'Rs ' + Math.round(n).toLocaleString('en-US');

export const isoDay = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toIso(d);
};

export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const niceDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export const dietLabel = (d: string) => (d === 'both' ? 'Regular · Gluten-free' : d === 'gf' ? 'Gluten-free' : 'Regular');

export const uid = () => Math.random().toString(36).slice(2, 9);
