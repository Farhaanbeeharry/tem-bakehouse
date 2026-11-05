import { Hero } from './home/Hero';
import { Manifesto } from './home/Manifesto';
import { FlavourRoom } from './home/FlavourRoom';
import { Collection } from './home/Collection';
import { Steps } from './home/Steps';
import { FinalCta, GalleryStrip, Moments } from './home/Closing';

export const HomePage = () => (
  <main>
    <Hero />
    <Manifesto />
    <FlavourRoom />
    <Collection />
    <Steps />
    <Moments />
    <GalleryStrip />
    <FinalCta />
  </main>
);
