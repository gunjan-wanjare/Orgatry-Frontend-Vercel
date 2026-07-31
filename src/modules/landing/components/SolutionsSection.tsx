import { motion } from 'framer-motion';
import { useCallback } from 'react';
import solutionsPhoneMockup from '@/modules/landing/assets/images/solutions-phone-mockup.png';
import { fadeIn, fadeInUp, featureCardStagger } from '@/modules/landing/animations/landingMotion';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { CTA_BUTTON_CLASSNAME, ctaButtonStyle } from '@/modules/landing/constants/ctaButton';
import { useSmoothScroll } from '@/modules/landing/hooks/useSmoothScroll';
import { LandingButton } from '@/modules/landing/shared/LandingButton';
import { fluid } from '@/modules/landing/utils/scale';

/** Figma `273:2760` — heading 48 / body 24, toned down + fluid. */
const HEADING_SIZE = fluid(24, 36);
const BODY_SIZE = fluid(15, 18);
const CARD_TITLE_SIZE = fluid(17, 20);
const CARD_BODY_SIZE = fluid(14, 15.5);

const SOLUTION_ITEMS = [
  {
    id: 'employee',
    title: 'Employee Management',
    description:
      'Manage your complete employee lifecycle with centralized records, onboarding, and HR workflows for every department.'
  },
  {
    id: 'compliance',
    title: 'Employee Compliance',
    description:
      'Get a complete compliance view of every employee, right from previous companies worked at, number of offers held, hike history, to absconding records, all in one place.'
  },
  {
    id: 'leave',
    title: 'Leave & Performance',
    description:
      'With our comprehensive performance management software, track leaves, goals, performance, and appraisals in one place.'
  },
  {
    id: 'recruit',
    title: 'Recruitment & Onboarding',
    description: 'Hire and onboard top talent faster without any paperwork with digital onboarding software.'
  },
  {
    id: 'custom',
    title: 'Need a Custom HR Solution?',
    description: 'Build the HR system your business actually needs.'
  }
] as const;

function SolutionListItem({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex w-full flex-col items-start gap-2.5 rounded-[16px] border !border-[#D4D4D499] bg-white"
      style={{ padding: fluid(16, 20) }}
    >
      <h3
        className="m-0 text-[#000d00] [font-family:Sora,sans-serif]"
        style={{ fontSize: CARD_TITLE_SIZE, letterSpacing: '-0.03em' }}
      >
        {title}
      </h3>
      <p
        className="m-0 font-normal text-[#878c91] [font-family:Jost,sans-serif]"
        style={{ fontSize: CARD_BODY_SIZE, lineHeight: 1.5 }}
      >
        {description}
      </p>
    </motion.div>
  );
}

/**
 * Solutions — Figma `273:2760` (One System for Every HR Workflow).
 * Heading + CTA row, then a phone-mockup image beside a stacked list of
 * five workflow items (not a card grid).
 */
export function SolutionsSection() {
  const { scrollToSection } = useSmoothScroll();

  const goContact = useCallback(() => {
    scrollToSection('contact');
  }, [scrollToSection]);

  return (
    <motion.section
      id="solutions"
      aria-labelledby="solutions-heading"
      className="relative scroll-mt-4 overflow-x-hidden bg-white md:py-20 py-10"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-start"
        style={{ paddingInline: `clamp(1.5rem, 6vw, ${landingTokens.gutter}px)`, gap: fluid(32, 60) }}
      >
        <motion.header
          className="flex w-full flex-col items-start justify-between gap-6 lg:flex-row lg:items-start"
          variants={fadeInUp}
        >
          <div className="flex w-full flex-col items-start gap-4 lg:max-w-[720px]">
            <h2
              id="solutions-heading"
              className="m-0 w-full text-[#000d00] capitalize [font-family:Sora,sans-serif]"
              style={{ fontSize: HEADING_SIZE, fontWeight: 500 }}
            >
              One System for Every HR Workflow
            </h2>
            <p
              className="m-0 w-full max-w-[720px] font-normal text-[#000d00] [font-family:Jost,sans-serif]"
              style={{ fontSize: BODY_SIZE, lineHeight: 1.5 }}
            >
              Our end-to-end HRMS software for workforce management eliminates all manual work to drive your business
              growth.
            </p>
          </div>
          <LandingButton
            variant="primary"
            onClick={goContact}
            style={ctaButtonStyle}
            className={CTA_BUTTON_CLASSNAME}
            aria-label="Get in touch"
          >
            Get In Touch
          </LandingButton>
        </motion.header>

        <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-stretch lg:gap-12">
          <motion.div
            className="w-full max-w-[600px] shrink-0 w-full m-auto"
            variants={fadeInUp}
          >
            <img
              src={solutionsPhoneMockup}
              alt="Orgatry mobile app home screen showing quick access shortcuts, tasks, attendance, leave balance, and payslip"
              loading="lazy"
              decoding="async"
              className="h-auto w-full max-w-full select-none"
            />
          </motion.div>

          <motion.div
            className="flex w-full flex-col items-start gap-4 lg:flex-1"
            variants={featureCardStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {SOLUTION_ITEMS.map((item) => (
              <SolutionListItem key={item.id} title={item.title} description={item.description} />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
