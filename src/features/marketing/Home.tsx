import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { FeaturesSection, HowItWorksSection, ProblemSection, TwoFixesSection } from './sections/Sections';
import {
  AudienceSection,
  FaqSection,
  FinalCta,
  Footer,
  StatsSection,
  UnderTheHoodSection,
} from './sections/Explainer';

export function Home({ onLaunch }: { onLaunch: () => void }) {
  return (
    <>
      <Header onLaunch={onLaunch} />
      <main id="main">
        <Hero onLaunch={onLaunch} />
        <ProblemSection />
        <HowItWorksSection />
        <TwoFixesSection />
        <FeaturesSection />
        <UnderTheHoodSection />
        <StatsSection />
        <AudienceSection />
        <FaqSection />
        <FinalCta onLaunch={onLaunch} />
      </main>
      <Footer />
    </>
  );
}
