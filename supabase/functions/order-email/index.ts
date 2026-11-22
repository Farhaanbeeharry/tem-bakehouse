// Emails the customer a copy of their order request ("we received it, here is your reference").
// Called by the site right after submit_order. Each order is emailed once (orders.confirmation_sent_at),
// only to the address on that order, and only within an hour of it being placed.
//
// Sender, Reply-To and transport come from ../_shared/mail.ts. Secrets: RESEND_API_KEY, SITE_URL,
// and optionally ORDER_NOTIFY_TO (a copy for TEM).
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { cors, env, esc, json, layout, mailConfigured, maskEmail, MailError, sendMail } from '../_shared/mail.ts';

const FLAVOURS: Record<string, string> = {
  plain: 'The Original', pinky: 'Pinky', 'choco-chips': 'Choco Chip', 'double-choco': 'Double Choco', 'nutty-crunch': 'Nutty Crunch',
  'red-velvet': 'Red Velvet', pistachio: 'Pistachio', ferrero: 'Praline Dream', bueno: 'Bueno', 'salted-caramel': 'Salted Caramel', biscoff: 'Biscoff',
};

type Line = { name: string; pack: string; qty: number; unit: number; diet?: string; flavour?: string; pid?: string; filling?: string; dip?: string; style?: string; box?: string[]; custom?: { occasion?: string; message?: string } | null };

const rs = (n: number) => 'Rs ' + Math.round(n).toLocaleString('en-US');
const day = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const lineDetail = (l: Line) => {
  const parts: string[] = [l.pack];
  if (l.box?.length) {
    const counts = new Map<string, number>();
    for (const id of l.box) counts.set(id, (counts.get(id) ?? 0) + 1);
    parts.push([...counts].map(([id, n]) => (n > 1 ? `${n}× ` : '') + (FLAVOURS[id] ?? id)).join(', '));
  } else if (l.flavour && !l.pid?.startsWith('round-') && FLAVOURS[l.flavour]) parts.push(FLAVOURS[l.flavour]);
  if (l.style) parts.push(l.style);
  if (l.filling) parts.push('Filling: ' + l.filling);
  if (l.dip) parts.push('Dip: ' + l.dip);
  if (l.diet === 'gf') parts.push('Gluten-free');
  if (l.custom?.occasion) parts.push('Occasion: ' + l.custom.occasion);
  if (l.custom?.message) parts.push(`Message: “${l.custom.message}”`);
  return parts.join(' · ');
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const { ref } = await req.json().catch(() => ({ ref: null }));
  if (typeof ref !== 'string' || !/^TEM-\d{4}-\d{3,}$/.test(ref)) return json({ error: 'Bad reference' }, 400);
  if (!mailConfigured()) return json({ skipped: 'email not configured' });

  const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
  const { data: o, error } = await db.from('orders').select('*').eq('ref', ref).maybeSingle();
  if (error) {
    console.error(`[order-email] ${ref}: order lookup failed: ${error.message}`);
    return json({ error: 'Could not load the order' }, 500);
  }
  if (!o) return json({ error: 'Not found' }, 404);
  if (o.confirmation_sent_at) return json({ skipped: 'already sent' });
  if (Date.now() - new Date(o.created_at).getTime() > 60 * 60 * 1000) return json({ skipped: 'too old' });

  let to: string = o.email ?? '';
  let name: string = o.contact_name ?? '';
  if (o.customer_id) {
    const { data: p } = await db.from('profiles').select('name, email').eq('id', o.customer_id).maybeSingle();
    to ||= p?.email ?? '';
    name ||= p?.name ?? '';
  }
  if (!to) return json({ skipped: 'no email on order' });

  // Claim the order first so two calls can't both send.
  const { data: claimed } = await db.from('orders').update({ confirmation_sent_at: new Date().toISOString() }).eq('ref', ref).is('confirmation_sent_at', null).select('ref');
  if (!claimed?.length) return json({ skipped: 'already sent' });

  const { data: st } = await db.from('settings').select('data').eq('id', 1).maybeSingle();
  const settings = (st?.data ?? {}) as { depositPct?: number; contact?: { whatsapp?: string } };
  const site = env('SITE_URL').replace(/\/$/, '');
  const items = (o.items ?? []) as Line[];
  const estimate = Number(o.estimate) || items.reduce((s, l) => s + l.unit * l.qty, 0);
  const first = (name || 'there').split(' ')[0];
  const track = o.customer_id && site ? `${site}/account/orders/${ref}` : '';
  const where = o.method === 'delivery' ? 'Delivery' : `Collection${o.location ? ' · ' + o.location : ''}`;
  const deposit = settings.depositPct ?? 50;
  const whatsapp = settings.contact?.whatsapp ?? '';

  const rows = items.map((l) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #E5DCC5;vertical-align:top">
        <div style="font-weight:700;color:#1E1310">${l.qty} × ${esc(l.name)}</div>
        <div style="font-size:13px;color:#6E5C4D;margin-top:3px">${esc(lineDetail(l))}</div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #E5DCC5;text-align:right;vertical-align:top;white-space:nowrap;color:#1E1310">${rs(l.unit * l.qty)}</td>
    </tr>`).join('');

  const html = layout(
    'Request received.',
    `Reference <strong style="color:#F0EED9;letter-spacing:.5px">${esc(ref)}</strong>`,
    `<p style="margin:0 0 14px">Hi ${esc(first)},</p>
      <p style="margin:0 0 14px">Thank you for your order request. We’ll check availability for your date and confirm the final price. Once it’s confirmed, we’ll ask for a ${deposit}% deposit to secure your order. Nothing is baked or charged until then.</p>
      <p style="margin:0 0 20px">Please keep your reference <strong>${esc(ref)}</strong> and use it as the payment reference when you pay.</p>
      <div style="background:#F0EED9;border-radius:12px;padding:14px 16px;font-size:14px;margin-bottom:18px">
        <div><strong>${esc(where)}</strong></div>
        <div style="color:#6E5C4D">${esc(o.date ? day(o.date) : '')}${o.slot ? ' · ' + esc(o.slot) : ''}</div>
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
        <tr><td style="padding:14px 0 0;font-weight:700">Estimated total</td><td style="padding:14px 0 0;text-align:right;font-weight:700">${rs(estimate)}</td></tr>
      </table>
      <p style="margin:8px 0 0;font-size:12px;color:#6E5C4D">The final price is confirmed by TEM Bakehouse. Packaging is included; personalised touches are quoted separately.</p>
      ${o.notes ? `<p style="margin:18px 0 0;font-size:14px"><strong>Your notes:</strong> ${esc(o.notes)}</p>` : ''}
      ${track ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 8px"><tr><td align="center" bgcolor="#711D2C" style="border-radius:999px"><a href="${track}" target="_blank" style="display:inline-block;padding:16px 34px;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;color:#F8F6EC;text-decoration:none;border-radius:999px">Track your request</a></td></tr></table>` : ''}`,
    `Questions? Reply to this email${whatsapp ? ` or WhatsApp us on ${esc(whatsapp)}` : ''}, quoting ${esc(ref)}.<br>
      TEM Bakehouse · Terre Rouge &amp; Port Louis, Mauritius${site ? ` · <a href="${site}" style="color:#6E5C4D">Visit the website</a>` : ''}`,
    `Reference ${esc(ref)}: we’ll confirm availability and the final price before any deposit.`,
  );

  const text = [
    `Hi ${first},`, '', `We received your order request. Reference: ${ref}`, '',
    `${where} — ${o.date ? day(o.date) : ''} ${o.slot ?? ''}`, '',
    ...items.map((l) => `${l.qty} × ${l.name} (${lineDetail(l)}) — ${rs(l.unit * l.qty)}`), '',
    `Estimated total: ${rs(estimate)}`, '',
    `We'll confirm availability and the final price, then ask for a ${deposit}% deposit. Use ${ref} as your payment reference.`,
    track ? `Track your request: ${track}` : '', '', `Questions? Reply to this email, quoting ${ref}.`, '— TEM Bakehouse',
  ].join('\n');

  try {
    const { id } = await sendMail({
      to,
      bcc: env('ORDER_NOTIFY_TO') || undefined,
      subject: `We received your request · ${ref}`,
      html,
      text,
      idempotencyKey: `order-confirmation/${ref}`,
    });
    console.log(`[order-email] ${ref}: sent to ${maskEmail(to)}${id ? ` (${id})` : ''}`);
  } catch (e) {
    // Release the claim so a retry can send it.
    await db.from('orders').update({ confirmation_sent_at: null }).eq('ref', ref);
    const msg = e instanceof MailError ? e.message : 'unexpected error';
    console.error(`[order-email] ${ref}: not sent to ${maskEmail(to)}: ${msg}`);
    return json({ error: 'The confirmation email could not be sent' }, 502);
  }
  return json({ sent: true });
});
