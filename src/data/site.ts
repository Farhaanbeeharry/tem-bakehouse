// Client-supplied details. Empty values show a "to be supplied" placeholder on the site.
export const site = {
  whatsappNumber: '', // e.g. '2305xxxxxxx' (digits only, country code first)
  instagramHandle: '', // e.g. 'tembakehouse'
  facebookUrl: '',
  tiktokHandle: '', // e.g. 'tembakehouse'
  collectionLocation: 'Terre Rouge / Port Louis',
  hours: '',
  email: '',
};

export const whatsappUrl = () => (site.whatsappNumber ? `https://wa.me/${site.whatsappNumber}` : 'https://wa.me/');
export const instagramUrl = () => (site.instagramHandle ? `https://instagram.com/${site.instagramHandle}` : 'https://instagram.com/');
export const tiktokUrl = () => (site.tiktokHandle ? `https://www.tiktok.com/@${site.tiktokHandle}` : 'https://www.tiktok.com/');
export const tiktokLabel = () => (site.tiktokHandle ? '@' + site.tiktokHandle : 'handle to be supplied');
export const instagramLabel = () => (site.instagramHandle ? '@' + site.instagramHandle : '@instagram_handle');
