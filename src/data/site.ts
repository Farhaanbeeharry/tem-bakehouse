// Client-supplied details. The owner can override each one in the back office (Settings → Store contact).
// Empty values are hidden on the site.
export const site = {
  whatsappNumber: '', // e.g. '2305xxxxxxx' (digits only, country code first)
  instagramHandle: 'tembakehouse',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61592704136301',
  tiktokHandle: '',
  collectionLocation: 'Terre Rouge (near Winners) & Port Louis (near ICC)',
  hours: 'Weekdays: 09:00 – 16:00\nSaturday: 08:30 – 12:00',
  email: 'contact@tembakehouse.com',
};

export const whatsappUrl = () => (site.whatsappNumber ? `https://wa.me/${site.whatsappNumber}` : 'https://wa.me/');
export const instagramUrl = () => (site.instagramHandle ? `https://instagram.com/${site.instagramHandle}` : 'https://instagram.com/');
export const tiktokUrl = () => (site.tiktokHandle ? `https://www.tiktok.com/@${site.tiktokHandle}` : 'https://www.tiktok.com/');
export const tiktokLabel = () => (site.tiktokHandle ? '@' + site.tiktokHandle : 'handle to be supplied');
export const instagramLabel = () => (site.instagramHandle ? '@' + site.instagramHandle : '@instagram_handle');
