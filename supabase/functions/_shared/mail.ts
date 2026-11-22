// The one place the Edge Functions send email from. Every email gets the same sender and Reply-To:
//
//   From:     MAIL_FROM_NAME <MAIL_FROM_EMAIL>   default: Tem Bakehouse <no-reply@tembakehouse.com>
//   Reply-To: MAIL_REPLY_TO                      default: contact@tembakehouse.com
//
// no-reply@ is a send-only address (no mailbox): replies go to contact@ through the Reply-To header.
// A function can override Reply-To for one email (the contact form replies to the visitor).
//
// Transport: Resend's HTTP API when RESEND_API_KEY is set (hosted project). Without it, plain SMTP
// (SMTP_HOST...), which is how local development delivers to Mailpit.
// Secrets live in Supabase (supabase secrets set ...) and never reach the browser.

export const env = (k: string) => Deno.env.get(k)?.trim() ?? '';

export const mailConfigured = () => !!(env('RESEND_API_KEY') || env('SMTP_HOST'));

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export type Mail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  bcc?: string;
  /** Overrides the default Reply-To (contact@) for this email only. */
  replyTo?: string;
  /** Resend drops a second send with the same key (within 24 h), so a retried request can't email twice. */
  idempotencyKey?: string;
};

/** Thrown when an email can't be sent. `message` is safe to log; it never contains the API key or email bodies. */
export class MailError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message);
    this.name = 'MailError';
  }
}

const EMAIL = /^[^\s@<>",]+@[^\s@<>",]+\.[^\s@<>",]+$/;
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

/** The sender settings every email uses. */
export const sender = () => {
  const name = oneLine(env('MAIL_FROM_NAME') || 'Tem Bakehouse').replace(/["<>]/g, '');
  const email = env('MAIL_FROM_EMAIL') || 'no-reply@tembakehouse.com';
  const replyTo = env('MAIL_REPLY_TO') || 'contact@tembakehouse.com';
  return { from: `${name} <${email}>`, email, replyTo };
};

/** "jane.doe@example.com" -> "ja***@example.com", for logs. */
export const maskEmail = (e: string) => {
  const [user, domain] = e.split('@');
  return domain ? `${user.slice(0, 2)}***@${domain}` : '***';
};

export const sendMail = async (m: Mail) => {
  const s = sender();
  const replyTo = (m.replyTo || s.replyTo).trim();
  for (const [field, value] of [['to', m.to], ['from', s.email], ['reply-to', replyTo], ...(m.bcc ? [['bcc', m.bcc]] : [])]) {
    if (!EMAIL.test(value.trim())) throw new MailError(`Invalid ${field} address`, false);
  }
  const mail = { ...m, to: m.to.trim(), bcc: m.bcc?.trim(), subject: oneLine(m.subject), replyTo };
  if (env('RESEND_API_KEY')) return sendWithResend(mail, s.from);
  if (env('SMTP_HOST')) return sendWithSmtp(mail, s.from);
  throw new MailError('Email is not configured (set RESEND_API_KEY)', false);
};

const sendWithResend = async (m: Mail & { replyTo: string }, from: string) => {
  let res: Response;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
        ...(m.idempotencyKey ? { 'Idempotency-Key': m.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from,
        to: [m.to],
        ...(m.bcc ? { bcc: [m.bcc] } : {}),
        reply_to: m.replyTo,
        subject: m.subject,
        html: m.html,
        text: m.text,
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    throw new MailError(`Resend unreachable (${(e as Error).name})`, true);
  }
  if (res.ok) {
    const { id } = await res.json().catch(() => ({ id: '' }));
    return { id: String(id ?? '') };
  }
  // Resend errors look like { name: 'validation_error', message: '...' }; neither contains the key.
  const err = await res.json().catch(() => ({}));
  const detail = [err?.name, err?.message].filter(Boolean).join(': ').slice(0, 300);
  throw new MailError(`Resend rejected the email (HTTP ${res.status}${detail ? ', ' + detail : ''})`, res.status === 429 || res.status >= 500);
};

const sendWithSmtp = async (m: Mail & { replyTo: string }, from: string) => {
  // Loaded only when needed: local development (Mailpit). Hosted Edge Functions block ports 25 and 587.
  const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts');
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
      from,
      to: m.to,
      ...(m.bcc ? { bcc: m.bcc } : {}),
      replyTo: m.replyTo,
      subject: m.subject,
      content: m.text,
      // One line: denomailer's encoder leaves a visible "=20" at line breaks.
      html: m.html.replace(/\s*\n\s*/g, ' '),
    });
    return { id: '' };
  } catch (e) {
    throw new MailError(`SMTP send failed (${(e as Error).name})`, true);
  } finally {
    try {
      await client.close();
    } catch {
      // never connected
    }
  }
};

/** The cream TEM logo, hosted in the public `catalog` bucket (same file as the Supabase Auth emails use). */
const logoUrl = () => env('MAIL_LOGO_URL') || (env('SUPABASE_URL') ? `${env('SUPABASE_URL').replace(/\/$/, '')}/storage/v1/object/public/catalog/email/tem-logo.png` : '');

const SANS = 'Helvetica,Arial,sans-serif';
const SERIF = "Georgia,'Times New Roman',serif";

/**
 * TEM's branded email frame, matching the Supabase Auth templates in supabase/templates/.
 * `title` and `sub` go in the burgundy header; `preheader` is the inbox preview line.
 */
export const layout = (title: string, sub: string, body: string, footer: string, preheader = '') => {
  const logo = logoUrl();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;padding:0;background:#F0EED9;-webkit-text-size-adjust:100%">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F0EED9">${preheader}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0EED9"><tr><td align="center" style="padding:32px 14px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FBF8EE;border-radius:22px;overflow:hidden;border:1px solid #E5DCC5">
    <tr><td style="background:#4A1019;padding:34px 36px 32px">
      ${logo ? `<img src="${logo}" width="92" height="32" alt="TEM Bakehouse" style="display:block;width:92px;height:32px;border:0;color:#F0EED9;font-family:${SANS};font-size:20px;font-weight:bold">` : `<div style="font-family:${SANS};font-size:24px;font-weight:900;color:#F0EED9">TEM</div>`}
      <div style="margin-top:28px;font-family:${SERIF};font-size:34px;line-height:1.12;font-style:italic;color:#F0EED9">${title}</div>
      <div style="margin-top:10px;font-family:${SANS};font-size:14px;color:#E5DCC5">${sub}</div>
    </td></tr>
    <tr><td style="padding:34px 36px 8px;font-family:${SANS};font-size:16px;line-height:1.65;color:#3B2519">${body}</td></tr>
    <tr><td style="padding:26px 36px 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #E5DCC5;padding-top:22px;font-family:${SANS};font-size:12px;line-height:1.7;color:#6E5C4D">
        <div style="font-family:${SERIF};font-style:italic;font-size:18px;color:#711D2C;margin-bottom:6px">Made for the moment.</div>
        ${footer}
      </td></tr></table>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
};
