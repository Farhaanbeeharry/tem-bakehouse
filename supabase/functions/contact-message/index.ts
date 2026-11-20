// Delivers the website's contact form to TEM's inbox (CONTACT_TO), with Reply-To set to the visitor,
// so TEM can answer straight from their mail app. It only ever sends to TEM's own address.
import { cors, env, esc, json, layout, mailConfigured, sendMail } from '../_shared/mail.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? '').trim().slice(0, 120);
  const email = String(body.email ?? '').trim().slice(0, 200);
  const message = String(body.message ?? '').trim().slice(0, 5000);
  // Hidden field real visitors never fill in; bots usually do. Pretend it worked.
  if (body.website) return json({ sent: true });
  if (!name || !EMAIL.test(email) || message.length < 2) return json({ error: 'Please fill in your name, a valid email and a message.' }, 400);

  const to = env('CONTACT_TO') || env('ORDER_NOTIFY_TO');
  if (!mailConfigured() || !to) return json({ error: 'Messages can’t be sent right now. Please reach us on WhatsApp.' }, 503);

  const html = layout(
    'New message from the website.',
    esc(name),
    `<p style="margin:0 0 6px"><strong>${esc(name)}</strong> · <a href="mailto:${esc(email)}" style="color:#711D2C">${esc(email)}</a></p>
     <div style="margin-top:14px;padding:16px;background:#F0EED9;border-radius:12px;white-space:pre-wrap">${esc(message)}</div>`,
    'Reply to this email to answer them directly.',
  );
  try {
    await sendMail({ to, replyTo: email, subject: `Website message from ${name}`, html, text: `${name} <${email}>\n\n${message}` });
  } catch (e) {
    return json({ error: 'Send failed: ' + (e as Error).message }, 502);
  }
  return json({ sent: true });
});
