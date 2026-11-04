import { useEffect, useState } from 'react';

// Every path the site looks for. Drop a file at the path and it replaces the stand-in, no code change.
export const asset = {
  heroFrame: (device: 'desktop' | 'mobile', n: number) =>
    `/assets/hero/${device}/tem_hero_${device}_${String(n).padStart(4, '0')}.webp`,
  productWhole: (flavour: string) => `/assets/products/${flavour}/tem_${flavour}_whole.png`,
  productBroken: (flavour: string) => `/assets/products/${flavour}/tem_${flavour}_broken.png`,
  productCrumb: (flavour: string) => `/assets/products/${flavour}/tem_${flavour}_crumb.png`,
  model: (flavour: string) => `/models/tem_${flavour}.glb`,
  category: (id: string) => `/assets/categories/tem_category_${id}_1200x1600.webp`,
  moment: (id: string) => `/assets/moments/tem_moment_${id}.webp`,
  gallery: (n: number) => `/assets/gallery/tem_gallery_${String(n).padStart(2, '0')}.webp`,
  baker: '/assets/editorial/tem_about_baker_1800x2400.webp',
  productDetail: (flavour: string, kind: 'stack' | 'box') => `/assets/products/${flavour}/tem_${flavour}_${kind}.webp`,
};

const imageCache = new Map<string, Promise<boolean>>();

export const probeImage = (src: string) => {
  let p = imageCache.get(src);
  if (!p) {
    p = new Promise<boolean>((resolve) => {
      const im = new Image();
      im.onload = () => resolve(true);
      im.onerror = () => resolve(false);
      im.src = src;
    });
    imageCache.set(src, p);
  }
  return p;
};

const fileCache = new Map<string, Promise<boolean>>();

/** HEAD-probe a non-image file (GLB). Vite's dev server answers unknown paths with index.html, so check the content type. */
export const probeFile = (src: string) => {
  let p = fileCache.get(src);
  if (!p) {
    p = fetch(src, { method: 'HEAD' })
      .then((r) => r.ok && !(r.headers.get('content-type') || '').includes('text/html'))
      .catch(() => false);
    fileCache.set(src, p);
  }
  return p;
};

/** null while checking, then true/false. */
export const useImageExists = (src: string | null) => {
  const [state, setState] = useState<{ src: string | null; ok: boolean | null }>({ src, ok: null });
  useEffect(() => {
    if (!src) return;
    let alive = true;
    probeImage(src).then((ok) => alive && setState({ src, ok }));
    return () => {
      alive = false;
    };
  }, [src]);
  return state.src === src ? state.ok : null;
};
