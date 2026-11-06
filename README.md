# TEM Bakehouse

Customer site and admin back office for TEM Bakehouse (Mauritius), built from the Claude Design prototype. React 19 + Vite + TypeScript, react-router and three.js.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Demo build: what's real and what isn't

- **No backend.** Orders, settings and product state are stored in the browser (`localStorage`, see `src/lib/store.ts`). The storefront and `/admin` share that store, and it syncs across tabs. Open the site in one tab and `/admin` in another, place a request, and it shows up in admin straight away.
- **Sign-in is simulated.** Any valid-looking email and an 8+ character password works.
- **Prices are placeholders** (`src/data/catalog.ts`). Admin → Products can override them.
- **Contact details** (WhatsApp, Instagram, address, hours) go in `src/data/site.ts`, or in Admin → Settings → Store contact.

## Suggested demo path

1. Home: scroll the hero (the cookie breaks open), then the Flavour Room. Drag the 3D cookie and press "Break it open".
2. Our Cookies → Cookie Cake → personalise it → Add to Order Request → Sign in → choose a date and time → Submit.
3. "Track this request", then open `/admin/orders` and accept it there.
4. Back in My Account: pay the deposit, then go to admin to verify it, mark it ready and collected.

## Adding images and 3D models

See **[ASSET-PROMPTS.md](ASSET-PROMPTS.md)** for every file path and its generation prompt. Put files in `public/` at the listed paths. The site finds them automatically, with no code changes.

| What | Where |
|---|---|
| Flavour 3D models | `public/models/tem_{flavour}.glb` |
| Flavour photos | `public/assets/products/{flavour}/tem_{flavour}_{whole,broken,crumb}.png` |
| Category / moment / gallery images | `public/assets/{categories,moments,gallery}/…` |
| Hero scroll frames (done) | `public/assets/hero/{desktop,mobile}/` |

## Structure

```
src/
  data/       catalogue (flavours, products, statuses) and site contact config
  lib/        persisted store, cart/user context, asset probing, scroll helpers
  three/      3D cookie scene (GLB loader + procedural fallback)
  components/ layout, header, drawer, auth modal, cookie, image slots
  pages/      storefront pages (home sections live in pages/home/)
  admin/      back office (/admin/*)
```
