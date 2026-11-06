import { Link } from 'react-router-dom';
import { ImageSlot } from '../components/ImageSlot';
import { asset } from '../lib/assets';

const VALUES = [1, 2, 3, 4, 5];

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
        <div style={{ padding: 20, border: '1.5px dashed rgba(245,238,227,0.4)', borderRadius: 18, fontSize: 16, lineHeight: 1.6, color: '#E5DCC5' }}>
          <span className="placeholder-tag" style={{ color: '#F1C9C9' }}>
            TO BE SUPPLIED BY TEM · BRAND INTRODUCTION
          </span>
          <br />A two to three sentence introduction to TEM Bakehouse, in the founder&apos;s words.
        </div>
      </div>
    </section>
    <section style={{ padding: 'clamp(72px,10vw,120px) var(--gutter)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 'clamp(28px,5vw,72px)', alignItems: 'center' }}>
        <ImageSlot src={asset.baker} alt="The TEM Bakehouse baker at work" ratio="4 / 5" radius={24} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 className="h-page" style={{ fontSize: 'clamp(25.6px,3.2vw,46px)', lineHeight: 0.95 }}>
            The baker
          </h2>
          <div className="placeholder-box">
            <span className="placeholder-tag">TO BE SUPPLIED BY TEM · FOUNDER STORY</span>
            <br />
            How TEM started, why cookies, and what the baker cares about — written and approved by TEM Bakehouse.
          </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,210px),1fr))', gap: 14 }}>
          {VALUES.map((n) => (
            <div key={n} style={{ padding: 24, border: '1.5px dashed #C7B593', borderRadius: 20, minHeight: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="placeholder-tag">VALUE 0{n} · TO BE SUPPLIED</span>
              <strong className="h-card">Value title</strong>
              <span style={{ fontSize: 14, color: '#6E5C4D' }}>One sentence from TEM.</span>
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
