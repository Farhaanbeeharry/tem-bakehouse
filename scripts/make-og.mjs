// Renders the link-preview image (WhatsApp, Facebook, X…) at public/assets/brand/og/tem_og_1200x630.jpg
// from the TEM logo and the site's cookie photos. Re-run after changing a photo:
//   node scripts/make-og.mjs
// Needs ImageMagick (`magick`) and playwright-core with its Chromium (npx playwright install chromium).
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = join(ROOT, 'public/assets/brand/og');
const OUT = join(OUT_DIR, 'tem_og_1200x630.jpg');
const WORK = mkdtempSync(join(tmpdir(), 'tem-og-'));

const cookie = (id) => {
  const out = join(WORK, `${id}.png`);
  execFileSync('magick', [join(ROOT, `public/assets/products/${id}/tem_${id}_whole.webp`), '-resize', '720x720', out]);
  return pathToFileURL(out).href;
};

// [flavour, left px, top px, width px, rotation°]
const COOKIES = [
  ['red-velvet', 612, 300, 330, -18],
  ['choco-chips', 700, -40, 400, 12],
  ['pistachio', 905, 250, 360, 28],
];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Instrument+Serif:ital@1&family=IBM+Plex+Mono:wght@400&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0 }
  body { width: 1200px; height: 630px; overflow: hidden; position: relative; color: #F0EED9; font-family: 'Archivo', sans-serif;
    background: radial-gradient(ellipse 90% 110% at 78% 45%, #8C2A3A 0%, #711D2C 42%, #3A0B14 100%) }
  .copy { position: absolute; left: 72px; top: 0; bottom: 0; width: 520px; display: flex; flex-direction: column; justify-content: center; gap: 22px }
  .mono { font-family: 'IBM Plex Mono', monospace; font-size: 17px; letter-spacing: .32em; text-transform: uppercase; color: #C7B593 }
  .tag { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 64px; line-height: 1; letter-spacing: -.01em }
  .sub { font-size: 24px; line-height: 1.4; color: #E5DCC5; max-width: 26ch }
  .url { margin-top: 10px; font-size: 21px; font-weight: 700; letter-spacing: .02em; color: #F0EED9 }
  img.c { position: absolute; filter: drop-shadow(0 26px 30px rgba(20, 4, 8, .55)) }
</style></head><body>
  ${COOKIES.map(([id, x, y, w, r]) => `<img class="c" src="${cookie(id)}" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${r}deg)">`).join('')}
  <div class="copy">
    <svg viewBox="465 829 1119 392" fill="#F0EED9" style="width:330px;height:auto;display:block" aria-hidden="true">
      <polygon points="465,829 794,829 794,909 675,909 675,1221 585,1221 585,909 465,909" />
      <polygon points="852,829 1122,829 1122,909 942,909 942,985 1097,985 1097,1058 942,1058 942,1141 1127,1141 1127,1221 852,1221" />
      <polygon points="1185,829 1283,829 1384,1031 1485,829 1584,829 1584,1221 1494,1221 1494,994 1412,1154 1356,1154 1276,994 1276,1221 1185,1221" />
    </svg>
    <div class="mono">Bakehouse · Mauritius</div>
    <div class="tag">Made for the Moment.</div>
    <div class="sub">Thick, generous cookies, baked to order for your day.</div>
    <div class="url">tembakehouse.com</div>
  </div>
</body></html>`;

const exe = process.env.CHROME_PATH || join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1234/chrome-win64/chrome.exe');
const browser = await chromium.launch({ executablePath: exe, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const htmlFile = join(WORK, 'og.html');
writeFileSync(htmlFile, html);
await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const png = join(WORK, 'og.png');
await page.screenshot({ path: png });
await browser.close();
mkdirSync(OUT_DIR, { recursive: true });
// Under ~300 KB so WhatsApp always shows it.
execFileSync('magick', [png, '-strip', '-interlace', 'Plane', '-quality', '84', OUT]);
console.log('wrote', OUT);
