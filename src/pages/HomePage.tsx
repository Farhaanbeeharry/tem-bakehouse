import { Hero } from './home/Hero';
import { Manifesto } from './home/Manifesto';
import { FlavourRoom } from './home/FlavourRoom';
import { Collection, Marquee } from './home/Collection';
import { Steps } from './home/Steps';
import { FinalCta, InstaStrip, Moments } from './home/Closing';

export const HomePage = () => (
  <main>
    <Hero />
    <Manifesto />
    <FlavourRoom />
    <Marquee />
    <Collection />
    <Steps />
    <Moments />
    <InstaStrip />
    <FinalCta />
  </main>
);
