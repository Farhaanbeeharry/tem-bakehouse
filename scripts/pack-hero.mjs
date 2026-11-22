// Bundles the hero frames into a few files so the browser makes a handful of requests instead of one per frame.
// pack_00 holds the coarse frames the loader waits for; pack_01… hold the in-between frames in playback order.
// Run after changing the frames in public/assets/hero/: npm run hero:pack
//
// Format (little-endian): "TEMH", uint32 packCount, uint32 n, n × (uint32 frameNumber, uint32 byteLength), frame bytes.
import fs from 'node:fs';
import path from 'node:path';

const STRIDE = 2; // keep in sync with src/pages/home/Hero.tsx
const COARSE = 6;
const CHUNK = 12;
const DEVICES = { desktop: 240, mobile: 180 };
const root = path.resolve(import.meta.dirname, '../public/assets/hero');

for (const [device, total] of Object.entries(DEVICES)) {
  const N = total / STRIDE;
  const file = (i) => path.join(root, device, `tem_hero_${device}_${String(i * STRIDE + 1).padStart(4, '0')}.webp`);
  const idx = Array.from({ length: N }, (_, i) => i);
  const isCoarse = (i) => i % COARSE === 0 || i === N - 1;
  const coarse = idx.filter((i) => i > 0 && isCoarse(i));
  const fine = idx.filter((i) => !isCoarse(i));
  const packs = [coarse];
  for (let i = 0; i < fine.length; i += CHUNK) packs.push(fine.slice(i, i + CHUNK));

  const dir = path.join(root, device, 'packs');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  packs.forEach((frames, p) => {
    const bufs = frames.map((i) => fs.readFileSync(file(i)));
    const head = Buffer.alloc(12 + frames.length * 8);
    head.write('TEMH', 0, 'ascii');
    head.writeUInt32LE(packs.length, 4);
    head.writeUInt32LE(frames.length, 8);
    frames.forEach((i, k) => {
      head.writeUInt32LE(i * STRIDE + 1, 12 + k * 8);
      head.writeUInt32LE(bufs[k].length, 16 + k * 8);
    });
    const out = Buffer.concat([head, ...bufs]);
    fs.writeFileSync(path.join(dir, `pack_${String(p).padStart(2, '0')}.pack`), out);
  });
  const size = fs.readdirSync(dir).reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0);
  console.log(`${device}: ${packs.length} packs, ${(size / 1e6).toFixed(1)} MB (opening pack ${coarse.length} frames)`);
}
