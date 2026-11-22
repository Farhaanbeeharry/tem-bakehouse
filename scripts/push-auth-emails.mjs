// Uploads the Supabase Auth email templates in supabase/templates/ to the hosted project.
// Only the subjects and template bodies change; SMTP and every other auth setting are left alone.
//   node --env-file=.env.local scripts/push-auth-emails.mjs        (needs SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF)
//   node --env-file=.env.local scripts/push-auth-emails.mjs --dry  (show what would change)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../supabase/templates/', import.meta.url));
const { SUPABASE_ACCESS_TOKEN: token, SUPABASE_PROJECT_REF: ref } = process.env;
if (!token || !ref) throw new Error('Set SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF (e.g. node --env-file=.env.local ...)');

const subjects = JSON.parse(readFileSync(join(dir, 'subjects.json'), 'utf8'));
const body = {};
for (const [name, subject] of Object.entries(subjects)) {
  const html = readFileSync(join(dir, `${name}.html`), 'utf8');
  // A typo in a variable would break that email for every user, so only allow the documented ones.
  const unknown = [...html.matchAll(/\{\{\s*([^}]*?)\s*\}\}/g)].map((m) => m[1]).filter((v) => !['.ConfirmationURL', '.Email', '.NewEmail', '.SiteURL', '.Token', '.TokenHash', '.RedirectTo'].includes(v));
  if (unknown.length) throw new Error(`${name}.html uses unsupported variables: ${unknown.join(', ')}`);
  body[`mailer_subjects_${name}`] = subject;
  body[`mailer_templates_${name}_content`] = html;
}

const api = `https://api.supabase.com/v1/projects/${ref}/config/auth`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
if (process.argv.includes('--dry')) {
  for (const [k, v] of Object.entries(body)) console.log(k, k.includes('subjects') ? JSON.stringify(v) : `${v.length} chars`);
  process.exit(0);
}
const res = await fetch(api, { method: 'PATCH', headers, body: JSON.stringify(body) });
if (!res.ok) throw new Error(`Supabase refused the update: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
const saved = await res.json();
const mismatched = Object.keys(body).filter((k) => saved[k] !== body[k]);
if (mismatched.length) throw new Error(`Saved, but these fields differ on the server: ${mismatched.join(', ')}`);
console.log(`Updated ${Object.keys(subjects).length} auth email templates on ${ref}:`);
for (const [name, subject] of Object.entries(subjects)) console.log(`  ${name.padEnd(17)} ${subject}`);
