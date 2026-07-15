import { motion } from 'framer-motion';
import { useCallback } from 'react';
import solutionCustom from '@/modules/landing/assets/icons/solution-custom.svg';
import solutionEmployee from '@/modules/landing/assets/icons/solution-employee.svg';
import solutionLeave from '@/modules/landing/assets/icons/solution-leave.svg';
import solutionPayroll from '@/modules/landing/assets/icons/solution-payroll.svg';
import solutionRecruit from '@/modules/landing/assets/icons/solution-recruit.svg';
import { fadeIn, fadeInUp, featureCardStagger } from '@/modules/landing/animations/landingMotion';
import { LandingFeatureCard } from '@/modules/landing/cards/LandingFeatureCard';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { useSmoothScroll } from '@/modules/landing/hooks/useSmoothScroll';
import { SectionBadge } from '@/modules/landing/shared/SectionBadge';
import { cn } from '@/lib/utils';

/** Figma `1:2000` — gap About→Solutions `102`. */
const SECTION_GAP_TOP = 102;
const HEADER_WIDTH = 715;
const GRID_MAX = 1246;

const SOLUTION_CARDS = [
  {
    id: 'employee',
    title: 'Employee Management',
    description:
      'Manage your complete employee lifecycle with centralized records, onboarding, and HR workflows for every department.',
    icon: solutionEmployee,
    iconSize: 37,
    descriptionClassName: 'max-w-[340px]'
  },
  {
    id: 'payroll',
    title: 'Payroll & Attendance',
    description:
      'Automate payroll processing, attendance tracking, overtime calculations, and statutory compliance with accuracy.',
    icon: solutionPayroll,
    iconSize: 30,
    descriptionClassName: 'max-w-[370px]'
  },
  {
    id: 'leave',
    title: 'Leave & Performance',
    description:
      'Track leave requests, employee goals, appraisals, and performance insights to build a productive workforce.',
    icon: solutionLeave,
    iconSize: 39,
    descriptionClassName: 'max-w-[328px]'
  },
  {
    id: 'custom',
    title: 'Need a Custom HR Solution?',
    description:
      "We create tailored HR solutions that adapt to your organization's unique workforce needs and operational goals.",
    icon: solutionCustom,
    iconSize: 39,
    descriptionClassName: 'max-w-[332px]'
  },
  {
    id: 'recruit',
    title: 'Recruitment & Onboarding',
    description:
      'Hire top talent faster with streamlined recruitment, digital onboarding, and employee document management.',
    icon: solutionRecruit,
    iconSize: 37,
    descriptionClassName: 'max-w-[342px]'
  }
] as const;

function SolutionsBadge() {
  return (
    <SectionBadge
      className={cn(
        'h-[32.583px] w-[128px] justify-center rounded-[503px] border border-[#008435]',
        'bg-[rgba(34,197,94,0.2)] text-base font-bold text-[#026229] [font-family:Manrope,sans-serif]'
      )}
    >
      Our Expertise
    </SectionBadge>
  );
}

/**
 * Solutions — Figma `1:2000` (Comprehensive HR Solutions).
 * Vertical stack gap `28` · header `715` gap `26` · grid gaps ~`21–22` × `20`.
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
      data-node-id="1:2000"
      className="relative scroll-mt-28 overflow-x-hidden bg-white"
      style={{ marginTop: SECTION_GAP_TOP }}
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-center pb-12 md:pb-14"
        style={{ gap: 28, paddingInline: `clamp(1.5rem, 6vw, ${landingTokens.gutter}px)` }}
      >
        <motion.header
          className="flex w-full flex-col items-center"
          style={{ maxWidth: HEADER_WIDTH, gap: 26 }}
          variants={fadeInUp}
          data-node-id="1:2001"
        >
          <SolutionsBadge />
          <h2
            id="solutions-heading"
            className="m-0 w-full text-center text-[clamp(32px,4vw,48px)] font-bold text-[#171717] [font-family:Manrope,sans-serif]"
            data-node-id="1:2005"
          >
            Comprehensive HR Solutions
          </h2>
          <p
            className="m-0 w-full text-center text-base leading-[23.448px] font-semibold text-[#595959] [font-family:Inter,sans-serif]"
            data-node-id="1:2006"
          >
            We deliver end-to-end HRMS solutions designed to simplify workforce management and drive business growth
            through intelligent automation.
          </p>
        </motion.header>

        <motion.div
          className="grid w-full grid-cols-1 gap-x-[21px] gap-y-5 md:grid-cols-2 lg:grid-cols-3"
          style={{ maxWidth: GRID_MAX }}
          variants={featureCardStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          data-node-id="1:2007"
        >
          {SOLUTION_CARDS.map((card) => (
            <LandingFeatureCard
              key={card.id}
              variant="panel"
              density="solution"
              background="white"
              iconSrc={card.icon}
              iconSize={card.iconSize}
              title={card.title}
              description={card.description}
              descriptionClassName={card.descriptionClassName}
              onLearnMore={goContact}
              learnMoreHref="#contact"
            />
          ))}
          <LandingFeatureCard
            variant="cta"
            title="HR Analytics & Reports"
            description="Make informed HR decisions with real-time dashboards, workforce analytics, and comprehensive business reports."
            ctaLabel="Get in Touch"
            onCtaClick={goContact}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
