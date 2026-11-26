import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from '../components/Cookie';
import { ProductCard } from '../components/ProductCard';
import { useProductPhoto } from '../components/ProductVisual';
import { COOKIE_SHOTS_CALL, categories, type Product } from '../data/catalog';
import { useSiteContact } from '../lib/contact';
import { useProducts } from '../lib/store';
import { supabase } from '../lib/supabase';

const FORM_ID = 'order-your-moment';
const OCCASIONS = ['Birthday', 'Wedding', 'Baby shower', 'Special gathering', 'Other'];

/** Composes the message TEM receives, so the request reads as one email in their inbox. */
const enquiryMessage = (product: string, f: { phone: string; occasion: string; date: string; guests: string; msg: string }) =>
  [
    `${product} request`,
    f.occasion ? `Occasion: ${f.occasion}` : null,
    f.date ? `Date: ${f.date}` : null,
    f.guests ? `Guests: ${f.guests}` : null,
    f.phone ? `Phone / WhatsApp: ${f.phone}` : null,
    '',
    f.msg,
  ]
    .filter((x) => x !== null)
    .join('\n');

/** A product ordered by message (Cookie Shots): TEM's words and a form, no price or options. */
export const EnquiryProductPage = ({ p }: { p: Product }) => {
  const P = useProducts();
  const contact = useSiteContact();
  const photo = useProductPhoto(p.id);
  const cat = categories.find((c) => c.id === p.cat);
  const recs = P.filter((x) => x.id !== p.id && !x.hidden && x.status === 'available' && (x.cat !== p.cat || x.featured)).slice(0, 4);
  const [f, setF] = useState({ name: '', email: '', phone: '', occasion: '', date: '', guests: '', msg: '', website: '' });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (o: Partial<typeof f>) => setF((x) => ({ ...x, ...o }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    // Browser-only demo: nothing to send to.
    if (!supabase) return setSent(true);
    setBusy(true);
    setErr('');
    const { error } = await supabase.functions.invoke('contact-message', {
      body: { name: f.name, email: f.email, message: enquiryMessage(p.name, f), website: f.website },
    });
    setBusy(false);
    if (error) {
      const detail = await (error as { context?: Response }).context?.json?.().catch(() => null);
      setErr(detail?.error ?? 'Your message couldn’t be sent. Please try again, or reach us on WhatsApp.');
      return;
    }
    setSent(true);
  };

  return (
    <main>
      <div className="page" style={{ paddingTop: 'clamp(96px,10vw,120px)' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 8, fontSize: 13, color: '#6E5C4D', marginBottom: 24, flexWrap: 'wrap' }}>
          <Link to="/cookies" style={{ color: 'inherit' }}>
            Our Cookies
          </Link>
          <span>/</span>
          <span style={{ color: '#1E1310' }} aria-current="page">
            {p.name}
          </span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 'clamp(28px,5vw,80px)', alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 90, aspectRatio: '1 / 1', borderRadius: 28, background: '#E5DCC5', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            {photo ? (
              <img src={photo} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'temFade .5s ease both' }} />
            ) : (
              <div style={{ width: '74%' }}>
                <Cookie flavour={p.flavour} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '.2em', color: '#711D2C' }}>
              {cat?.name ?? p.name}
            </span>
            <h1 className="h-page" style={{ fontSize: 'clamp(33px,3.8vw,61px)', lineHeight: 0.9 }}>
              {p.name}
            </h1>
            {p.enquiry?.map((text, i) => (
              <p key={text} style={{ margin: 0, maxWidth: '54ch', fontSize: i === 0 ? 19 : 17, lineHeight: 1.65, color: i === 0 ? '#3B2519' : '#6E5C4D' }}>
                {text}
              </p>
            ))}
            <div style={{ marginTop: 8 }}>
              <a href={'#' + FORM_ID} className="btn btn-primary" style={{ minHeight: 52 }}>
                Order your Moment
              </a>
            </div>
          </div>
        </div>
      </div>

      <section id={FORM_ID} data-dark="1" style={{ scrollMarginTop: 72, marginTop: 'clamp(64px,8vw,104px)', padding: 'clamp(64px,8vw,104px) var(--gutter)', background: '#4A1019', color: '#F0EED9' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 'clamp(32px,5vw,80px)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.24em', color: '#C7B593' }}>ORDER YOUR MOMENT</span>
            <h2 className="display" style={{ fontSize: 'clamp(32px,4.2vw,60px)' }}>
              {COOKIE_SHOTS_CALL.title}
            </h2>
            {COOKIE_SHOTS_CALL.lines.map((line) => (
              <p key={line} style={{ margin: 0, maxWidth: '46ch', fontSize: 17, lineHeight: 1.6, color: '#E5DCC5' }}>
                {line}
              </p>
            ))}
            <p style={{ margin: 0, maxWidth: '46ch', fontSize: 14, lineHeight: 1.6, color: '#C7B593' }}>
              Send us a message and we’ll reply with all the details and the price.
              {contact.whatsappUrl && (
                <>
                  {' '}Prefer WhatsApp?{' '}
                  <a href={contact.whatsappUrl} target="_blank" rel="noopener" style={{ color: '#F0EED9', fontWeight: 600 }}>
                    Message us on {contact.whatsapp}
                  </a>
                  .
                </>
              )}
            </p>
          </div>

          <form onSubmit={submit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, color: '#1E1310' }}>
            {sent ? (
              <div style={{ padding: '40px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }} role="status">
                <strong className="h-card" style={{ fontSize: 23 }}>
                  Thank you, {f.name.split(' ')[0] || 'friend'}.
                </strong>
                <span style={{ fontSize: 14, color: '#6E5C4D' }}>TEM will reply by email with the details and price.</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 14 }}>
                  <label className="field">
                    Name
                    <input className="input alt" required value={f.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" />
                  </label>
                  <label className="field">
                    Email
                    <input className="input alt" type="email" required value={f.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" />
                  </label>
                  <label className="field">
                    <span>
                      Phone / WhatsApp <span className="hint">optional</span>
                    </span>
                    <input className="input alt" type="tel" value={f.phone} onChange={(e) => set({ phone: e.target.value })} autoComplete="tel" />
                  </label>
                  <label className="field">
                    Occasion
                    <select className="input alt" value={f.occasion} onChange={(e) => set({ occasion: e.target.value })}>
                      <option value="">Choose…</option>
                      {OCCASIONS.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>
                      Date <span className="hint">optional</span>
                    </span>
                    <input className="input alt" type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>
                      Number of guests <span className="hint">optional</span>
                    </span>
                    <input className="input alt" type="number" min={1} inputMode="numeric" value={f.guests} onChange={(e) => set({ guests: e.target.value })} />
                  </label>
                </div>
                <label className="field">
                  Tell us about your celebration
                  <textarea className="input alt" rows={5} required value={f.msg} onChange={(e) => set({ msg: e.target.value })} placeholder="What you’re celebrating, and anything you’d like us to know" />
                </label>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={(e) => set({ website: e.target.value })} style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
                {err && (
                  <p role="alert" style={{ margin: 0, fontSize: 14, color: '#9B2C2C' }}>
                    {err}
                  </p>
                )}
                <button type="submit" className="btn btn-primary" style={{ minHeight: 52 }} disabled={busy}>
                  {busy ? 'Sending…' : 'Order your Moment'}
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {recs.length > 0 && (
        <section aria-label="Goes well with" className="page" style={{ paddingTop: 'clamp(64px,8vw,96px)' }}>
          <h2 className="h-card" style={{ fontSize: 28.2, marginBottom: 24 }}>
            Goes well with
          </h2>
          <div className="product-grid">
            {recs.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
