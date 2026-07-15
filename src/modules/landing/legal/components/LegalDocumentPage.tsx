import { motion } from 'framer-motion';
import '@/modules/landing/styles/landing-fonts.css';
import '@/modules/landing/styles/landing-shell.css';
import { fadeInUp, staggerContainer } from '@/modules/landing/animations/landingMotion';
import { LandingFooter } from '@/modules/landing/components/LandingFooter';
import { LandingNavbar } from '@/modules/landing/components/LandingNavbar';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { useLandingDocumentMeta } from '@/modules/landing/hooks/useLandingDocumentMeta';
import { LegalHero } from '@/modules/landing/legal/components/LegalHero';
import { LegalSectionCard } from '@/modules/landing/legal/components/LegalSectionCard';
import type { LegalPageContent } from '@/modules/landing/legal/types';
import { LandingContainer } from '@/modules/landing/shared/LandingContainer';

type LegalDocumentPageProps = {
  content: LegalPageContent;
};

/**
 * Shared shell for Privacy Policy / Terms pages.
 * Reuses landing navbar, footer, tokens, fonts, and motion — no splash.
 */
export function LegalDocumentPage({ content }: LegalDocumentPageProps) {
  useLandingDocumentMeta({
    title: content.documentTitle,
    description: content.documentDescription,
    ogTitle: content.documentTitle
  });

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white text-[#171717] [font-family:Inter,sans-serif]">
      <LandingNavbar />
      <LegalHero badge={content.badge} title={content.title} subtitle={content.subtitle} />

      <section
        aria-label={`${content.title} content`}
        className="relative bg-white pb-20 md:pb-28"
        style={{ marginTop: landingTokens.sectionGapSm }}
      >
        <LandingContainer>
          <motion.div
            className="mx-auto flex max-w-[820px] flex-col gap-5 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
          >
            <motion.div
              variants={fadeInUp}
              className="flex flex-col gap-4 rounded-[20px] border border-[#e9e9eb] bg-[#f1f9f3] p-6 md:p-8"
            >
              {content.intro.split('\n\n').map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="m-0 text-[15px] leading-7 text-[#595959] [font-family:Inter,sans-serif] md:text-base md:leading-8"
                >
                  {paragraph}
                </p>
              ))}
            </motion.div>

            {content.sections.map((section) => (
              <LegalSectionCard key={section.id} section={section} />
            ))}
          </motion.div>
        </LandingContainer>
      </section>

      <LandingFooter withContactOverlap={false} />
    </main>
  );
}
