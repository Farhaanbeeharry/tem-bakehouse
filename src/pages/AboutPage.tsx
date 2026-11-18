import { Link } from 'react-router-dom';
import { ImageSlot } from '../components/ImageSlot';
import { asset } from '../lib/assets';

const VALUES = [
  ['Quality', 'Care in every ingredient, from the first measure to the last crumb.'],
  ['Distinctiveness', 'Original creations, something different, made to be remembered.'],
  ['Simplicity', 'Keeping everything simple, from honest ingredients to a clean look and effortless ordering.'],
];

export const AboutPage = () => (
  <main>
    <section data-dark="1" style={{ padding: 'clamp(120px,14vw,180px) var(--gutter) 80px', background: '#711D2C', color: '#F0EED9' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 48, alignItems: 'end' }}>
        <div>
          <h1 className="display" style={{ fontSize: 'clamp(36px,5.1vw,82px)' }}>
            About TEM
            <br />
            <em>Bakehouse</em>
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: 'clamp(17px,1.5vw,20px)', lineHeight: 1.6, color: '#E5DCC5' }}>
          TEM Bakehouse is more than treats; it is a feeling. Rooted in the belief that the sweetest moments are the ones we share, we bake small-batch cookies and mini bakes made to be gifted, enjoyed and remembered, a little memory for you to carry through life&apos;s journey.
        </p>
      </div>
    </section>
    <section style={{ padding: 'clamp(72px,10vw,120px) var(--gutter)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 'clamp(28px,5vw,72px)', alignItems: 'center' }}>
        <ImageSlot src={asset.baker} alt="The TEM Bakehouse baker at work" ratio="4 / 5" radius={24} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 className="h-page" style={{ fontSize: 'clamp(25.6px,3.2vw,46px)', lineHeight: 0.95 }}>
            The baker
          </h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: '#3B2519' }}>
            TEM Bakehouse began in 2023 with a simple love of baking and a hope of making treats people would remember long after the last bite.
          </p>
          <blockquote style={{ margin: 0, paddingLeft: 20, borderLeft: '2px solid #711D2C', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 17, lineHeight: 1.7, color: '#3B2519', fontStyle: 'italic' }}>
            <p style={{ margin: 0 }}>
              I believe a cookie is a small thing that can make a big moment. It&apos;s easy to share, easy to gift and easy to enjoy. Each cookie is baked in small batches with care and love, in both regular and gluten-free versions, so that everyone has a place at the table.
            </p>
            <p style={{ margin: 0 }}>
              I care about quality that begins with every ingredient and simplicity that lives in every bite. But what matters most is the moment: the feeling, the memory and the warmth that you and your people carry with you long after the last crumb.
            </p>
          </blockquote>
        </div>
      </div>
    </section>
    <section data-dark="1" style={{ padding: 'clamp(72px,10vw,120px) var(--gutter)', background: '#1E1310', color: '#F0EED9' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.24em', color: '#C7B593' }}>THE MEANING</span>
        <h2 className="display" style={{ fontSize: 'clamp(36px,5.8vw,90px)' }}>
          <em>
            Made for
            <br />
            the Moment.
          </em>
        </h2>
        <p style={{ margin: 0, maxWidth: '52ch', fontSize: 18, lineHeight: 1.6, color: '#E5DCC5' }}>
          Every bake is made fresh for your occasion. We help create the moments your cookies are shared in, so they become part of the memory, not just the treat.
        </p>
      </div>
    </section>
    <section style={{ padding: 'clamp(72px,10vw,120px) var(--gutter)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <h2 className="h-page" style={{ marginBottom: 28, fontSize: 'clamp(25.6px,3.2vw,46px)' }}>
          What TEM values
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 14 }}>
          {VALUES.map(([title, text], i) => (
            <div key={title} style={{ padding: 24, border: '1px solid #D9CDB4', background: '#F8F6EC', borderRadius: 20, minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: '#711D2C' }}>0{i + 1}</span>
              <strong className="h-card" style={{ fontSize: 22 }}>
                {title}
              </strong>
              <span style={{ fontSize: 15, lineHeight: 1.55, color: '#6E5C4D' }}>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48 }}>
          <Link to="/cookies" className="btn btn-primary">
            Explore the menu
          </Link>
        </div>
      </div>
    </section>
  </main>
);
