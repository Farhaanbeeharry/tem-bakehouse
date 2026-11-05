// Client-supplied details. Empty values show a "to be supplied" placeholder on the site.
export const site = {
  whatsappNumber: '', // e.g. '2305xxxxxxx' (digits only, country code first)
  instagramHandle: '', // e.g. 'tembakehouse'
  facebookUrl: '',
  collectionLocation: 'Terre Rouge / Port Louis',
  hours: '',
  email: '',
};

export const whatsappUrl = () => (site.whatsappNumber ? `https://wa.me/${site.whatsappNumber}` : 'https://wa.me/');
export const instagramUrl = () => (site.instagramHandle ? `https://instagram.com/${site.instagramHandle}` : 'https://instagram.com/');
export const instagramLabel = () => (site.instagramHandle ? '@' + site.instagramHandle : '@instagram_handle');
