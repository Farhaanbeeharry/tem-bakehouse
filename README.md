# TEM Bakehouse

Customer site and admin back office for TEM Bakehouse (Mauritius), built from the Claude Design prototype. React 19 + Vite + TypeScript, react-router and three.js.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Backend: Supabase

Orders, customer accounts, store settings and product availability/prices live in Supabase (Postgres + Auth + Realtime). Schema and security rules are in [supabase/migrations/](supabase/migrations/); local test data in [supabase/seed.sql](supabase/seed.sql).

### Local development

Needs Docker Desktop running.

```bash
npm run db:start   # starts local Supabase (API :55421, Studio http://127.0.0.1:55423, emails http://127.0.0.1:55424)
npm run dev
npm run db:reset   # wipe and re-seed the local database
npm run db:stop
```

`.env.development.local` points `npm run dev` at the local stack. Local accounts:

| Account | Email | Password |
|---|---|---|
| Back office (`/admin`) | `admin@tem.local` | `admin12345` |
| Customer | `you@example.mu` | `customer123` |

Password-reset and confirmation emails are caught by Mailpit at http://127.0.0.1:55424.

### Who can do what

- **Guests** can submit an order (through the `submit_order` function, which assigns the `TEM-YYMM-NNN` reference) but can't read any orders.
- **Customers** see only their own orders. They can submit deposit details, approve a proposed change, or cancel; the database ignores any other change they attempt.
- **Admins** (`profiles.is_admin = true`) see and edit everything. `/admin` is locked to them.

### Connecting the client's Supabase project

1. Fill in `.env.local` (template: `.env.example`): project URL, publishable key, access token and project ref.
2. Push the schema (not the seed):
   ```bash
   npx supabase link --project-ref <ref>      # uses SUPABASE_ACCESS_TOKEN
   npx supabase db push
   ```
3. In the dashboard, Authentication → URL Configuration: set the Site URL to the live domain and add it to the redirect URLs (needed for password-reset links).
4. Create the owner's account by signing up on the site, then in the SQL editor:
   ```sql
   update public.profiles set is_admin = true where email = 'owner@example.com';
   ```
5. For the cPanel deploy, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as GitHub repository secrets.

### Email (no-reply@tembakehouse.com)

Two Edge Functions send mail over SMTP, sharing `supabase/functions/_shared/mail.ts`:

- `order-email`: the customer's "Request received" email with their reference, sent once per order (`orders.confirmation_sent_at`).
- `contact-message`: the Contact form, delivered to `CONTACT_TO` with Reply-To set to the visitor.

Locally they send to Mailpit (http://127.0.0.1:55424) using `supabase/functions/.env`. On Windows run `npx supabase functions serve --env-file supabase/functions/.env` from PowerShell (Git Bash rewrites a container path and it fails).

On the hosted project:
```bash
npx supabase functions deploy order-email contact-message --use-api
npx supabase secrets set SMTP_HOST=... SMTP_PORT=465 SMTP_USER=no-reply@tembakehouse.com SMTP_PASS=... \
  "MAIL_FROM=TEM Bakehouse <no-reply@tembakehouse.com>" SITE_URL=https://<live domain> CONTACT_TO=<TEM inbox> [ORDER_NOTIFY_TO=<TEM inbox>]
```
Use port 465 (SSL): hosted Edge Functions block 25 and 587. Put the same mailbox in Dashboard → Authentication → SMTP Settings so sign-up confirmations and password resets come from it too.

Without a Supabase URL and key the site falls back to the browser-only demo: data in `localStorage`, any email and 8+ character password signs in, and `/admin` is open. That keeps the current deploy working until the client's project is connected.

**The catalogue** in `src/data/catalog.ts` is the starting point. Everything the owner changes in the back office is stored in Supabase and applied on top of it (`applyCatalog`):

- **Products:** name, price, versions, description, ingredients, pack sizes and prices, fillings and photos per product. She can also add new cookies and products, or delete ones she added.
- **Categories and filling prices**, kept in `settings.catalog`.
- **Contact and social links:** Settings → Store contact. Empty ones are hidden on the site.
- **Gallery photos:** Content.
- **Team access:** Settings.

Photos go to the public `catalog` storage bucket, which only admins can write to.

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
