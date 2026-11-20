// Shared SMTP sender for the Edge Functions (no-reply@tembakehouse.com).
// Uses denomailer: Nodemailer's DNS step doesn't work in the Edge runtime.
// Hosted Edge Functions block SMTP ports 25 and 587, so use 465 (SSL).
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

export const env = (k: string) => Deno.env.get(k) ?? '';
export const mailConfigured = () => !!env('SMTP_HOST');

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

type Mail = { to: string; subject: string; text: string; html: string; bcc?: string; replyTo?: string };

export const sendMail = async (m: Mail) => {
  const port = Number(env('SMTP_PORT') || 465);
  const client = new SMTPClient({
    connection: {
      hostname: env('SMTP_HOST'),
      port,
      tls: env('SMTP_SECURE') ? env('SMTP_SECURE') === 'true' : port === 465,
      ...(env('SMTP_USER') ? { auth: { username: env('SMTP_USER'), password: env('SMTP_PASS') } } : {}),
    },
    // Only the local Mailpit setup turns TLS off.
    debug: { allowUnsecure: env('SMTP_SECURE') === 'false' },
  });
  try {
    await client.send({
      from: env('MAIL_FROM') || 'TEM Bakehouse <no-reply@tembakehouse.com>',
      to: m.to,
      ...(m.bcc ? { bcc: m.bcc } : {}),
      ...(m.replyTo ? { replyTo: m.replyTo } : {}),
      subject: m.subject,
      content: m.text,
      // One line: denomailer's encoder leaves a visible "=20" at line breaks.
      html: m.html.replace(/\s*\n\s*/g, ' '),
    });
  } finally {
    try {
      await client.close();
    } catch {
      // never connected
    }
  }
};

/** TEM's branded email frame. */
export const layout = (title: string, sub: string, body: string, footer: string) => `<!doctype html><html><body style="margin:0;background:#F0EED9;font-family:Helvetica,Arial,sans-serif;color:#1E1310">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0EED9;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FBF8EE;border-radius:18px;overflow:hidden">
    <tr><td style="background:#4A1019;padding:26px 28px;color:#F0EED9">
      <div style="font-size:22px;font-weight:900;letter-spacing:-.5px">TEM <span style="font-size:10px;font-weight:400;letter-spacing:3px">BAKEHOUSE</span></div>
      <div style="font-size:26px;font-weight:800;margin-top:18px;line-height:1.15">${title}</div>
      <div style="font-size:14px;color:#E5DCC5;margin-top:6px">${sub}</div>
    </td></tr>
    <tr><td style="padding:26px 28px;font-size:15px;line-height:1.6">${body}</td></tr>
    <tr><td style="padding:18px 28px 26px;border-top:1px solid #E5DCC5;font-size:12px;color:#6E5C4D;line-height:1.6">${footer}</td></tr>
  </table></td></tr></table></body></html>`;
