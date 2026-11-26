// Renders The Cookie Collection: First Edition booklet (A5 PDF) from the site's cookie photos and
// TEM's "Cookie Collection Presentation" text. Re-run after changing the text or a cookie photo:
//   node scripts/make-booklet.mjs
// Needs ImageMagick (`magick`) and playwright-core with its Chromium (npx playwright install chromium).
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'public/assets/collection/tem_cookie_collection_first_edition.pdf');
const WORK = mkdtempSync(join(tmpdir(), 'tem-booklet-'));

// Small 8-bit copies keep the PDF light enough to download on a phone.
const img = (id) => {
  const out = join(WORK, `${id}.png`);
  execFileSync('magick', [join(ROOT, `public/assets/products/${id}/tem_${id}_whole.webp`), '-resize', '640x640', '-colors', '255', `PNG8:${out}`]);
  return pathToFileURL(out).href;
};

const expressions = [
  ['choco-chips', 'Classic Cookie', 'Golden edges, a buttery crumb, and pools of melted chocolate chips in every bite. The one that started it all: simple, timeless, always right.', 'Butter, caster sugar, brown sugar, eggs, vanilla extract, salt, flour, milk chocolate chips and dark chocolate.'],
  ['double-choco', 'Double Choco', 'Deep, dark, and unapologetically chocolate. Crackled on top, fudgy within: built for the days that call for something rich.', 'Butter, caster sugar, brown sugar, eggs, vanilla extract, salt, flour, cocoa powder and dark chocolate.'],
  ['pistachio', 'Pistachio', 'Nutty, earthy, and dusted in pistachio gold, with a molten Nutella heart waiting at the centre. The one that surprises you halfway through.', 'Butter, caster sugar, brown sugar, pistachio cream, pistachio paste, eggs, vanilla extract, salt, green food colouring, flour and pistachio chunks.'],
  ['red-velvet', 'Red Velvet', 'A bold ruby crumb, kissed with cocoa and studded with white chocolate. Soft, faintly tangy, and rich all the way through: a classic, made unforgettable.', 'Butter, caster sugar, brown sugar, cream cheese, eggs, vanilla extract, salt, flour and white chocolate chips.'],
  ['nutty-crunch', 'Nutty Crunch', 'Crunchy pistachio chunks, folded into a golden, buttery dough. Rustic and toasty, every bite snaps with a little wild crunch.', 'Butter, caster sugar, brown sugar, eggs, vanilla extract, salt, flour and pistachio chunks.'],
];

const STORY = [
  'Years of dough &amp; trial, we’ve stirred and spun',
  'Batch after batch, till the perfect one won',
  'Gooey, crusty, golden &amp; light',
  'Baked warm, just right, to your delight',
  'Choco chip, nuts, pistachio &amp; more we’ve mastered',
  'Not just work &amp; art but a cookie made with heart',
  'Since 2023, we’ve made this vow',
  'Turning your moments into memories, one bite will show you how.',
];

const INGREDIENTS = ['Flour', 'Premium butter', 'Brown sugar', 'Milk &amp; dark chocolate', 'Nutella stuffed', 'The secret binder: love'];

const css = `
@page { size: A5; margin: 0 }
* { box-sizing: border-box }
body { margin: 0; font-family: 'Archivo', sans-serif; color: #1E1310; -webkit-print-color-adjust: exact; print-color-adjust: exact }
.page { width: 148mm; height: 210mm; position: relative; overflow: hidden; page-break-after: always; padding: 16mm 14mm; display: flex; flex-direction: column }
.page:last-child { page-break-after: auto }
.dark { background: #4A1019; color: #F0EED9 }
.cream { background: #F0EED9 }
.sand { background: #E5DCC5 }
.mono { font-family: 'IBM Plex Mono', monospace; font-size: 7.5pt; letter-spacing: .24em; text-transform: uppercase }
.display { font-weight: 900; font-stretch: 115%; line-height: .86; letter-spacing: -.035em; text-transform: uppercase; margin: 0 }
.display em, .serif { font-family: 'Instrument Serif', serif; font-weight: 400; font-style: italic; text-transform: none; font-stretch: 100%; letter-spacing: -.01em }
.foot { margin-top: auto; display: flex; justify-content: space-between; align-items: baseline }
.wordmark { font-weight: 900; font-stretch: 125%; font-size: 15pt; letter-spacing: -.02em }
p { margin: 0 }
`;

const wordmark = `<span class="wordmark">TEM <span class="mono" style="font-size:6pt;font-weight:400;letter-spacing:.3em">Bakehouse</span></span>`;

const cover = `
<section class="page dark">
  <div class="mono" style="color:#C7B593">First Edition · Since 2023</div>
  <h1 class="display" style="font-size:44pt;margin-top:8mm">The Cookie<br><em>Collection.</em></h1>
  <p class="serif" style="font-size:15pt;margin-top:5mm;color:#E5DCC5">Our mains: one story, told in five sweet expressions.</p>
  <div style="position:relative;flex:1;margin:4mm -6mm">
    ${expressions.map(([id], i) => {
      const pos = [[4, 2, 44, -12], [52, 0, 42, 18], [28, 30, 46, 6], [0, 58, 42, 30], [54, 54, 42, -24]][i];
      return `<img src="${img(id)}" style="position:absolute;left:${pos[0]}%;top:${pos[1]}%;width:${pos[2]}%;transform:rotate(${pos[3]}deg);filter:drop-shadow(0 6mm 6mm rgba(0,0,0,.45))">`;
    }).join('')}
  </div>
  <div class="foot">${wordmark}<span class="serif" style="font-size:13pt;color:#E5DCC5">Five expressions, one box.</span></div>
</section>`;

const story = `
<section class="page cream">
  <div class="mono" style="color:#711D2C">Our story</div>
  <div class="serif" style="margin-top:auto;margin-bottom:auto;display:flex;flex-direction:column;gap:2.6mm;font-size:17pt;line-height:1.3;color:#3B2519">
    ${STORY.map((l) => `<p>${l}</p>`).join('')}
  </div>
  <div class="foot">${wordmark}<span class="mono" style="color:#711D2C">Since 2023</span></div>
</section>`;

const ingredients = `
<section class="page sand">
  <div class="mono" style="color:#711D2C">The ingredients</div>
  <h2 class="display" style="font-size:30pt;margin-top:6mm">What goes into<br><em>every batch.</em></h2>
  <div style="margin-top:9mm;display:flex;flex-direction:column;gap:4.2mm;font-size:10.5pt;line-height:1.62;color:#3B2519">
    <p>It starts simple: flour, premium butter, brown sugar, milk &amp; dark chocolate. Some batches get a little extra: a filling stuffed right into the centre, in the heart.</p>
    <p>But the ingredient that actually holds it all together isn’t on any label. It’s the one thing we never skip, in every batch, since day one: love.</p>
  </div>
  <div style="margin-top:auto;display:flex;flex-wrap:wrap;gap:2.4mm">
    ${INGREDIENTS.map((t, i) => `<span class="mono" style="font-size:6.8pt;padding:2.2mm 3.4mm;border-radius:99px;${i === INGREDIENTS.length - 1 ? 'background:#711D2C;color:#F0EED9' : 'border:.3mm solid rgba(30,19,16,.35);color:#3B2519'}">${t}</span>`).join('')}
  </div>
</section>`;

const expressionPages = expressions.map(([id, name, text, ingr], i) => `
<section class="page ${i % 2 ? 'sand' : 'cream'}">
  <div style="display:flex;justify-content:space-between"><span class="mono" style="color:#711D2C">Expression ${['one', 'two', 'three', 'four', 'five'][i]}</span><span class="mono" style="color:#6E5C4D">0${i + 1} / 05</span></div>
  <h2 class="display" style="font-size:34pt;margin-top:6mm">${name}</h2>
  <div style="flex:1;display:grid;place-items:center;margin:2mm 0">
    <img src="${img(id)}" style="width:92mm;transform:rotate(${i * 23 - 30}deg);filter:drop-shadow(0 5mm 6mm rgba(60,30,15,.28))">
  </div>
  <p class="serif" style="font-size:14pt;line-height:1.3;color:#711D2C">${text}</p>
  <div style="margin-top:5mm;padding-top:4mm;border-top:.3mm solid rgba(30,19,16,.2)">
    <div class="mono" style="font-size:6.5pt;color:#6E5C4D;margin-bottom:1.6mm">Ingredients</div>
    <p style="font-size:8pt;line-height:1.5;color:#6E5C4D">${ingr}</p>
  </div>
</section>`).join('');

const thanks = `
<section class="page cream">
  <div class="mono" style="color:#711D2C">A small thank you</div>
  <h2 class="display" style="font-size:30pt;margin-top:6mm">Five flavours.<br>One story.<br><em>Made for you.</em></h2>
  <div style="margin-top:10mm;display:flex;flex-direction:column;gap:4.2mm;font-size:10.5pt;line-height:1.62;color:#3B2519">
    <p>Every cookie in this collection carries the same batch of years, trial, and heart that started TEM Bakehouse back in 2023. Whichever one you reach for, we hope it turns your moment into a memory.</p>
    <p>Classic, Double Choco, Pistachio, Red Velvet &amp; Nutty Crunch are our mains, the heart of what we bake. But they’re not the whole story: more flavours are always waiting to be discovered at TEM Bakehouse.</p>
  </div>
  <div class="foot">${wordmark}<span class="mono" style="color:#711D2C">Made for the moment</span></div>
</section>`;

const closing = `
<section class="page dark">
  <div class="mono" style="color:#C7B593">Savour it</div>
  <div style="margin-top:10mm;display:flex;flex-direction:column;gap:6mm;font-size:10.5pt;line-height:1.6;color:#E5DCC5">
    <div><div class="mono" style="color:#C7B593;margin-bottom:2mm">Keep</div><p>In an airtight container at room temperature, away from heat and sunlight. Your cookies last up to 2 weeks.</p></div>
    <div><div class="mono" style="color:#C7B593;margin-bottom:2mm">Warm</div><p>10 seconds in the microwave or 3 minutes in a warm oven brings back that soft, just-baked centre.</p></div>
    <div><div class="mono" style="color:#C7B593;margin-bottom:2mm">Share</div><p>Break one in half. Pass the box around. Tag us when the moment is right.</p></div>
    <div><div class="mono" style="color:#C7B593;margin-bottom:2mm">Allergens</div><p>Our cookies contain gluten, eggs and dairy, and are made in a kitchen that handles nuts.</p></div>
  </div>
  <p class="serif" style="margin-top:auto;font-size:24pt;line-height:1.1">A cookie shouldn’t just be eaten;<br>it should be remembered.</p>
  <div class="foot" style="margin-top:8mm">${wordmark}<span class="mono" style="color:#C7B593">Made for the moment</span></div>
</section>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500&display=block" rel="stylesheet">
<style>${css}</style></head><body>${cover}${story}${ingredients}${expressionPages}${thanks}${closing}</body></html>`;

const exe = process.env.CHROME_PATH || join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1234/chrome-win64/chrome.exe');
const browser = await chromium.launch({ executablePath: exe, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
const htmlFile = join(WORK, 'booklet.html');
writeFileSync(htmlFile, html);
await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
mkdirSync(join(ROOT, 'public/assets/collection'), { recursive: true });
await page.pdf({ path: OUT, format: 'A5', printBackground: true, preferCSSPageSize: true });
if (process.env.PREVIEW) {
  await page.setViewportSize({ width: 560, height: 794 });
  await page.screenshot({ path: process.env.PREVIEW, fullPage: true });
}
await browser.close();
console.log('wrote', OUT);
