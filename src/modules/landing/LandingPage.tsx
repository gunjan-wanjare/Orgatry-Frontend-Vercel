import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IntroProvider, useIntro } from '@/components/intro';
import '@/modules/landing/styles/landing-fonts.css';
import '@/modules/landing/styles/landing-shell.css';
import { AboutSection } from '@/modules/landing/components/AboutSection';
import { ContactSection } from '@/modules/landing/components/ContactSection';
import { FaqSection } from '@/modules/landing/components/FaqSection';
import { HeroSection } from '@/modules/landing/components/HeroSection';
import { LandingFooter } from '@/modules/landing/components/LandingFooter';
import { LandingNavbar } from '@/modules/landing/components/LandingNavbar';
import { SolutionsSection } from '@/modules/landing/components/SolutionsSection';
import { TestimonialsSection } from '@/modules/landing/components/TestimonialsSection';
import { TrustedSection } from '@/modules/landing/components/TrustedSection';
import { WhyChooseUsSection } from '@/modules/landing/components/WhyChooseUsSection';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { useLandingDocumentMeta } from '@/modules/landing/hooks/useLandingDocumentMeta';
import { scrollToSectionId } from '@/modules/landing/hooks/useSmoothScroll';

/** Figma `1:1564` — gap Testimonials→Contact/Footer frame `25`. */
const CONTACT_FOOTER_GAP_TOP = landingTokens.sectionGapSm;

/** Scroll to `/#section` after intro so anchors from legal pages land correctly. */
function LandingHashScroller() {
  const location = useLocation();
  const { isContentReady } = useIntro();

  useEffect(() => {
    if (!isContentReady) {
      return;
    }

    const hash = location.hash.replace(/^#/, '');
    if (!hash || hash === 'home') {
      return;
    }

    const timer = window.setTimeout(() => {
      scrollToSectionId(hash);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [isContentReady, location.hash]);

  return null;
}

export function LandingPage() {
  useLandingDocumentMeta();

  return (
    <IntroProvider>
      <LandingHashScroller />
      <main className="relative min-h-screen overflow-x-hidden bg-white text-[#171717] [font-family:Inter,sans-serif]">
        <LandingNavbar />
        <HeroSection />
        <TrustedSection />
        <AboutSection />
        <SolutionsSection />
        <WhyChooseUsSection />
        <FaqSection />
        <TestimonialsSection />
        <div className="relative" style={{ marginTop: CONTACT_FOOTER_GAP_TOP }}>
          <ContactSection />
          <LandingFooter />
        </div>
      </main>
    </IntroProvider>
  );
}
