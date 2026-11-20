import { site } from '../data/site';
import { useStore } from './store';

/** "@tem", "tem" or a full profile URL → handle without the @. */
const handleOf = (v: string, host: string) => {
  const t = v.trim();
  if (!t) return '';
  if (t.includes(host)) return t.replace(/\/+$/, '').split('/').pop()!.replace(/^@/, '').split('?')[0];
  return t.replace(/^@/, '');
};

/**
 * Contact and social details for the public site: what TEM entered in the back office
 * (Settings → Store contact), falling back to src/data/site.ts. Empty values mean "not supplied yet".
 */
export const useSiteContact = () => {
  const c = useStore().settings.contact;
  const whatsapp = c?.whatsapp?.trim() || site.whatsappNumber;
  const instagram = handleOf(c?.instagram || site.instagramHandle, 'instagram.com');
  const tiktok = handleOf(c?.tiktok || site.tiktokHandle, 'tiktok.com');
  const fb = (c?.facebook || site.facebookUrl).trim();
  return {
    whatsapp,
    whatsappUrl: whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '',
    instagram,
    instagramUrl: instagram ? `https://instagram.com/${instagram}` : '',
    tiktok,
    tiktokUrl: tiktok ? `https://www.tiktok.com/@${tiktok}` : '',
    facebookUrl: fb ? (/^https?:\/\//.test(fb) ? fb : fb.includes('facebook.com') ? `https://${fb.replace(/^\/+/, '')}` : `https://facebook.com/${fb.replace(/^@/, '')}`) : '',
    email: c?.email?.trim() || site.email,
    address: c?.address?.trim() || site.collectionLocation,
    hours: c?.hours?.trim() || site.hours,
  };
};
