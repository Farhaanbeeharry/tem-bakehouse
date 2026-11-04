import * as THREE from 'three';

// Procedural cookie geometry + textures, ported from the Claude Design prototype (tem-cookie-3d.html).
// Used as the stand-in until a real GLB model exists for a flavour.

export const hash3 = (x: number, y: number, z: number) => {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const fade = (t: number) => t * t * (3 - 2 * t);
export const vnoise = (x: number, y: number, z = 0) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const u = fade(x - xi), v = fade(y - yi), w = fade(z - zi);
  const L = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz);
  return L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v), L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w);
};
export const fbm = (x: number, y: number, z = 0, o = 4) => {
  let a = 0, amp = 0.5, f = 1;
  for (let i = 0; i < o; i++) {
    a += amp * vnoise(x * f, y * f, z * f);
    f *= 2.03;
    amp *= 0.5;
  }
  return a;
};
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const H = 0.25, B = 0.075;
export const BOTTOM_Y = -B;
export const edgeR = (th: number) => 1 + (fbm(Math.cos(th) * 1.6 + 3, Math.sin(th) * 1.6 + 3, 0, 3) - 0.5) * 0.09 + (vnoise(Math.cos(th) * 9, Math.sin(th) * 9) - 0.5) * 0.018;

const crackField = (x: number, z: number) => {
  const wx = fbm(x * 1.3 + 11, z * 1.3, 0, 2) * 1.4, wz = fbm(x * 1.3, z * 1.3 + 7, 0, 2) * 1.4;
  const r = 1 - Math.abs(vnoise(x * 2.4 + wx, z * 2.4 + wz, 4.2) * 2 - 1);
  const r2 = 1 - Math.abs(vnoise(x * 5.1 + wz, z * 5.1 + wx, 9.7) * 2 - 1);
  return Math.max(Math.pow(r, 14), Math.pow(r2, 22) * 0.6);
};
const crackFieldSoft = (x: number, z: number) => {
  const wx = fbm(x * 1.3 + 11, z * 1.3, 0, 2) * 1.4, wz = fbm(x * 1.3, z * 1.3 + 7, 0, 2) * 1.4;
  return Math.pow(1 - Math.abs(vnoise(x * 2.4 + wx, z * 2.4 + wz, 4.2) * 2 - 1), 5);
};
export const topAt = (x: number, z: number) => {
  const r = Math.hypot(x, z), u = Math.min(1, r / edgeR(Math.atan2(z, x)));
  const dome = H * Math.pow(Math.max(0, 1 - Math.pow(u, 3.2)), 0.3);
  const inner = Math.max(0, Math.min(1, (0.97 - u) / 0.15));
  const lumps = (fbm(x * 2.2, z * 2.2, 1.3, 3) - 0.5) * 0.085 + (fbm(x * 8, z * 8, 2.1, 2) - 0.5) * 0.02;
  return dome + (lumps - crackFieldSoft(x, z) * 0.03) * inner;
};
const bottomAt = (u: number) => -B * Math.pow(Math.max(0, 1 - Math.pow(u, 6)), 0.22);

export const seam = (z: number, y: number) =>
  0.05 * Math.sin(z * 5.3 + 0.7) + 0.03 * Math.sin(z * 11.7 + 2.1) + 0.017 * Math.sin(z * 23.1 + 0.3) + 0.009 * Math.sin(z * 47.0 + 1.1) + 0.12 * y * Math.sin(z * 4.0 + 0.5);
const SEAM_GLSL = 'float seam(float z, float y){ return 0.05*sin(z*5.3+0.7)+0.03*sin(z*11.7+2.1)+0.017*sin(z*23.1+0.3)+0.009*sin(z*47.0+1.1)+0.12*y*sin(z*4.0+0.5); }\n';

export const insideXZ = (x: number, z: number) => Math.hypot(x, z) < edgeR(Math.atan2(z, x)) * 0.999;

/** Where on the photo a vertex samples: the top maps directly; the side wall walks inward as it goes down so the crust texture wraps instead of stretching. */
export const photoRadius = (top: boolean, u: number) => {
  const rim = 0.9 * 0.93;
  if (top) return u <= 0.9 ? u * 0.93 : rim - ((u - 0.9) / 0.1) * 0.22;
  return u >= 0.9 ? rim - 0.22 - ((1 - u) / 0.1) * 0.06 : 0.5;
};

/** Disk UV: the cookie's top maps onto a circle of radius 0.45 centred in the texture. */
export const diskUV = (u: number, th: number): [number, number] => [Math.cos(th) * u * 0.45 + 0.5, Math.sin(th) * u * 0.45 + 0.5];

/** `relief(u, th)` adds height to the top surface (photo-textured cookies). */
export const buildBody = (NR: number, NS: number, relief?: (u: number, th: number) => number) => {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const rows = NR * 2 + 1;
  for (let i = 0; i < rows; i++) {
    const top = i <= NR, u = top ? i / NR : 1 - (i - NR) / NR;
    for (let j = 0; j <= NS; j++) {
      const th = (j / NS) * Math.PI * 2;
      const r = Math.max(1e-4, u) * edgeR(th) * (top ? 1 : 0.985 + 0.015 * u);
      const x = Math.cos(th) * r, z = Math.sin(th) * r;
      const inner = Math.max(0, Math.min(1, (0.985 - u) / 0.12));
      const y = top ? topAt(x, z) + (relief ? relief(u, th) * inner : 0) : bottomAt(u);
      pos.push(x, y, z);
      if (relief) uv.push(...diskUV(photoRadius(top, u), th));
      else uv.push(x * 0.45 + 0.5, z * 0.45 + 0.5);
    }
  }
  const W = NS + 1;
  for (let i = 0; i < rows - 1; i++) for (let j = 0; j < NS; j++) {
    const a = i * W + j, b = a + 1, c = a + W, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

export const buildFace = (NZ: number, NV: number, salt: number) => {
  let zmin = 0, zmax = 0;
  for (let z = 0; z < 1.2; z += 0.002) { if (insideXZ(seam(z, 0), z)) zmax = z; else break; }
  for (let z = 0; z > -1.2; z -= 0.002) { if (insideXZ(seam(z, 0), z)) zmin = z; else break; }
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NZ; i++) {
    const z = zmin + (zmax - zmin) * (i / NZ);
    const x0 = seam(z, 0), u = Math.min(1, Math.hypot(x0, z) / edgeR(Math.atan2(z, x0)));
    const yb = bottomAt(u) + 0.01, yt = topAt(x0, z) - 0.014;
    const ez = Math.sin((Math.PI * i) / NZ);
    for (let j = 0; j <= NV; j++) {
      const v = j / NV, y = yb + (yt - yb) * v, ev = Math.sin(Math.PI * v);
      const rough = ((fbm(z * 14 + salt, y * 14, 3.3, 4) - 0.5) * 0.06 + (vnoise(z * 60, y * 60, salt) - 0.5) * 0.012) * Math.pow(ez * ev, 0.35);
      pos.push(seam(z, y) + rough, y, z);
      uv.push(z * 1.4 + 0.5, y * 1.4 + 0.5);
    }
  }
  const W = NV + 1;
  for (let i = 0; i < NZ; i++) for (let j = 0; j < NV; j++) {
    const a = i * W + j, b = a + 1, c = a + W, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

export type ChipKind = 'chip' | 'chunk' | 'bits' | 'nut' | 'none';
export type FlavourLook = { dough: [number, number, number]; chip: string | null; kind: ChipKind; n: number; molten?: boolean; chipRough?: number };

export const LOOKS: Record<string, FlavourLook> = {
  'choco-chips': { dough: [198, 139, 82], chip: '#2b170e', kind: 'chip', n: 34, molten: true },
  'double-choco': { dough: [92, 54, 36], chip: '#1a0c07', kind: 'chunk', n: 26, molten: true },
  'red-velvet': { dough: [140, 40, 44], chip: '#efe6d4', kind: 'chip', n: 30, chipRough: 0.55 },
  pistachio: { dough: [204, 176, 118], chip: '#7a9748', kind: 'bits', n: 70, chipRough: 0.7 },
  bueno: { dough: [208, 160, 104], chip: '#6a4128', kind: 'chunk', n: 18, molten: true },
  ferrero: { dough: [166, 112, 68], chip: '#3c2112', kind: 'nut', n: 22, molten: true },
  plain: { dough: [216, 172, 114], chip: null, kind: 'none', n: 0 },
  pinky: { dough: [222, 168, 162], chip: '#f5ede2', kind: 'chip', n: 28, chipRough: 0.55 },
  'nutty-crunch': { dough: [186, 132, 80], chip: '#8a5b33', kind: 'nut', n: 40, chipRough: 0.75 },
  biscoff: { dough: [180, 116, 64], chip: '#7c4520', kind: 'bits', n: 50 },
  'salted-caramel': { dough: [198, 140, 78], chip: '#c9852f', kind: 'chunk', n: 16, molten: true, chipRough: 0.2 },
};

const canvas = (S: number) => {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  return [c, c.getContext('2d')!] as const;
};

export const doughTextures = (F: FlavourLook, S: number) => {
  const [c, g] = canvas(S);
  const im = g.createImageData(S, S), d = im.data;
  const rough = new Uint8ClampedArray(S * S), bump = new Uint8ClampedArray(S * S);
  const [R0, G0, B0] = F.dough;
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const x = (px / S - 0.5) / 0.45, z = (py / S - 0.5) / 0.45;
    const u = Math.hypot(x, z) / edgeR(Math.atan2(z, x));
    const cr = crackField(x, z), lump = fbm(x * 6, z * 6, 5, 3);
    const brown = Math.min(1, Math.max(0, (u - 0.62) / 0.4)) * 0.38 + (lump - 0.5) * 0.25;
    const k = 1 - brown * 0.75;
    const crackLight = Math.pow(cr, 6), crackEdge = Math.pow(cr, 2.2) - crackLight;
    let R = R0 * k, G = G0 * k, Bc = B0 * k;
    R += (Math.min(255, R0 * 1.22) - R) * crackLight * 0.85;
    G += (Math.min(255, G0 * 1.2) - G) * crackLight * 0.85;
    Bc += (Math.min(255, B0 * 1.15) - Bc) * crackLight * 0.85;
    R *= 1 - crackEdge * 0.22; G *= 1 - crackEdge * 0.25; Bc *= 1 - crackEdge * 0.28;
    const sp = hash3(px, py, 3);
    let rg = 0.78 + crackLight * 0.15;
    if (sp > 0.9965) { R = R * 1.35 + 30; G = G * 1.35 + 30; Bc = Bc * 1.3 + 30; rg = 0.25; }
    else if (sp < 0.004) { R *= 0.55; G *= 0.5; Bc *= 0.45; }
    const grain = (vnoise(px * 0.9, py * 0.9, 8) - 0.5) * 18;
    const o = (py * S + px) * 4;
    d[o] = R + grain; d[o + 1] = G + grain; d[o + 2] = Bc + grain; d[o + 3] = 255;
    bump[py * S + px] = 128 + (fbm(px * 0.12, py * 0.12, 2, 3) - 0.5) * 120 + (hash3(px, py, 9) - 0.5) * 40 - crackLight * 60;
    rough[py * S + px] = rg * 255;
  }
  g.putImageData(im, 0, 0);
  const grey = (src: Uint8ClampedArray) => {
    const [cv, cg] = canvas(S);
    const gi = cg.createImageData(S, S);
    for (let i = 0; i < src.length; i++) { gi.data[i * 4] = gi.data[i * 4 + 1] = gi.data[i * 4 + 2] = src[i]; gi.data[i * 4 + 3] = 255; }
    cg.putImageData(gi, 0, 0);
    return cv;
  };
  const T = (cv: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(cv);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return { map: T(c, true), bump: T(grey(bump), false), rough: T(grey(rough), false) };
};

export const crumbTextures = (F: FlavourLook, S: number) => {
  const [c, g] = canvas(S);
  const [R0, G0, B0] = F.dough;
  const lite = [Math.min(255, R0 * 1.18), Math.min(255, G0 * 1.18), Math.min(255, B0 * 1.12)];
  g.fillStyle = `rgb(${lite.join(',')})`;
  g.fillRect(0, 0, S, S);
  const [b, bg] = canvas(S);
  bg.fillStyle = '#9a9a9a';
  bg.fillRect(0, 0, S, S);
  const r = rng(91);
  for (let i = 0; i < S * 5; i++) {
    const x = r() * S, y = r() * S, s = Math.pow(r(), 3) * S * 0.007 + 0.5, dark = r() < 0.6;
    g.fillStyle = dark
      ? `rgba(${R0 * 0.55},${G0 * 0.5},${B0 * 0.45},${0.35 + r() * 0.5})`
      : `rgba(${Math.min(255, lite[0] * 1.1)},${Math.min(255, lite[1] * 1.1)},${Math.min(255, lite[2] * 1.08)},0.6)`;
    g.beginPath(); g.ellipse(x, y, s, s * (0.6 + r() * 0.6), r() * 3, 0, 7); g.fill();
    bg.fillStyle = dark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.5)';
    bg.beginPath(); bg.ellipse(x, y, s, s * 0.8, 0, 0, 7); bg.fill();
  }
  const T = (cv: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  return { map: T(c, true), bump: T(b, false) };
};

/** Discards fragments on the far side of the break seam so one mesh renders as one half. */
export const seamMaterial = <M extends THREE.Material>(base: M, side: number): M => {
  base.onBeforeCompile = (sh) => {
    sh.uniforms.uSide = { value: side };
    sh.vertexShader = 'varying vec3 vLoc;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLoc = position;');
    sh.fragmentShader =
      'varying vec3 vLoc;\nuniform float uSide;\n' + SEAM_GLSL + sh.fragmentShader.replace('void main() {', 'void main() {\n  if (uSide * (vLoc.x - seam(vLoc.z, vLoc.y)) < 0.0) discard;');
  };
  base.customProgramCacheKey = () => 'seam' + side;
  return base;
};

export const crumbGeo = (seed: number) => {
  const g = new THREE.IcosahedronGeometry(1, 1);
  const p = g.attributes.position, r = rng(seed);
  for (let i = 0; i < p.count; i++) {
    const k = 0.6 + r() * 0.65;
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.8, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
};

export const chipGeo = (kind: ChipKind, seed: number) => {
  const g = new THREE.SphereGeometry(1, kind === 'bits' ? 10 : 22, kind === 'bits' ? 8 : 14);
  const p = g.attributes.position;
  const fl = kind === 'chip' ? 0.5 : kind === 'chunk' ? 0.62 : 0.7;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 0.7 + vnoise(x * 1.8 + seed, y * 1.8, z * 1.8) * 0.55 + (kind === 'nut' ? (vnoise(x * 5, y * 5, z * 5 + seed) - 0.5) * 0.35 : 0);
    p.setXYZ(i, x * n, (y > 0 ? y * fl : y * fl * 0.6) * n, z * n);
  }
  g.computeVertexNormals();
  return g;
};
