import { LayoutGroup } from 'framer-motion';
import '@/modules/landing/styles/landing-fonts.css';
import '@/modules/landing/styles/landing-shell.css';
import { AboutSection } from '@/modules/landing/components/AboutSection';
import { ContactSection } from '@/modules/landing/components/ContactSection';
import { FaqSection } from '@/modules/landing/components/FaqSection';
import { HeroSection } from '@/modules/landing/components/HeroSection';
import { LandingFooter } from '@/modules/landing/components/LandingFooter';
import { LandingNavbar } from '@/modules/landing/components/LandingNavbar';
import { LandingSplash } from '@/modules/landing/components/LandingSplash';
import { SolutionsSection } from '@/modules/landing/components/SolutionsSection';
import { TestimonialsSection } from '@/modules/landing/components/TestimonialsSection';
import { TrustedSection } from '@/modules/landing/components/TrustedSection';
import { WhyChooseUsSection } from '@/modules/landing/components/WhyChooseUsSection';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { LandingExperienceProvider } from '@/modules/landing/hooks/useLandingExperience';
import { useLandingDocumentMeta } from '@/modules/landing/hooks/useLandingDocumentMeta';

/** Figma `1:1564` — gap Testimonials→Contact/Footer frame `25`. */
const CONTACT_FOOTER_GAP_TOP = landingTokens.sectionGapSm;

export function LandingPage() {
  useLandingDocumentMeta();

  return (
    <LandingExperienceProvider>
      <LayoutGroup id="orgatry-landing-yaka">
        <LandingSplash />
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
      </LayoutGroup>
    </LandingExperienceProvider>
  );
}
