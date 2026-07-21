import { motion } from 'framer-motion';
import whyAutomation from '@/modules/landing/assets/icons/why-automation.svg';
import whyExperience from '@/modules/landing/assets/icons/why-experience.svg';
import whyHrms from '@/modules/landing/assets/icons/why-hrms.svg';
import whyInsights from '@/modules/landing/assets/icons/why-insights.svg';
import whySecure from '@/modules/landing/assets/icons/why-secure.svg';
import whySupport from '@/modules/landing/assets/icons/why-support.svg';
import { fadeIn, fadeInUp, featureCardStagger } from '@/modules/landing/animations/landingMotion';
import { LandingFeatureCard } from '@/modules/landing/cards/LandingFeatureCard';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { SectionBadge } from '@/modules/landing/shared/SectionBadge';
import { cn } from '@/lib/utils';

/** Figma `1:2071` — gap Solutions→Why ≈ `86.4`. */
const SECTION_GAP_TOP = landingTokens.sectionGapMd;
const HEADER_WIDTH = 715;
const GRID_MAX = 1245;
const GRID_GAP = 23;

const WHY_CARDS = [
  {
    id: 'automation',
    title: 'Smart HR Automation',
    description:
      'Automate repetitive tasks with HR automation software and save valuable time.',
    icon: whyAutomation,
    iconSize: 33,
    background: 'white' as const,
    descriptionClassName: 'max-w-[340px]'
  },
  {
    id: 'experience',
    title: 'Employee-Centric Experience',
    description:
      'A seamless, intuitive experience for HR teams and employees alike.',
    icon: whyExperience,
    iconSize: 36,
    background: 'white' as const,
    descriptionClassName: 'max-w-[370px]'
  },
  {
    id: 'secure',
    title: 'Secure & Scalable',
    description:
      'A cloud-based compliance management software that grows with your business.',
    icon: whySecure,
    iconSize: 35,
    background: 'mint' as const,
    descriptionClassName: 'max-w-[328px]'
  },
  {
    id: 'hrms',
    title: 'One Unified Platform',
    description:
      'Manage recruitment, onboarding, attendance, leave, and performance without switching tools.',
    icon: whyHrms,
    iconSize: 35,
    background: 'white' as const,
    descriptionClassName: 'max-w-[332px]'
  },
  {
    id: 'insights',
    title: 'Real-Time Insights',
    description:
      'Confident workplace decisions with powerful analytics and customizable reports.',
    icon: whyInsights,
    iconSize: 33,
    background: 'white' as const,
    descriptionClassName: 'max-w-[342px]'
  },
  {
    id: 'support',
    title: 'Dedicated Support',
    description: 'Get expert help from day one, anytime, anywhere.',
    icon: whySupport,
    iconSize: 32,
    background: 'white' as const,
    descriptionClassName: 'max-w-[342px]'
  }
] as const;

function WhyChooseBadge() {
  return (
    <SectionBadge
      className={cn(
        'h-[33px] w-[143px] justify-center rounded-[503px] border border-[#026229]',
        'bg-[rgba(34,197,94,0.2)] text-base font-bold text-[#02431d] [font-family:Manrope,sans-serif]'
      )}
    >
      Why Choose Us
    </SectionBadge>
  );
}

/**
 * Why Choose Us — Figma `1:2071` (The Orgatry Advantage).
 * Badge · heading · body · 2×3 panel grid gap `23` · one mint card.
 */
export function WhyChooseUsSection() {
  return (
    <motion.section
      id="why-us"
      aria-labelledby="why-us-heading"
      data-node-id="1:2071"
      className="relative scroll-mt-28 overflow-x-hidden bg-white"
      style={{ marginTop: SECTION_GAP_TOP }}
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[26px] pb-12 md:pb-14"
        style={{ paddingInline: `clamp(1.5rem, 6vw, ${landingTokens.gutter}px)` }}
      >
        <motion.header
          className="flex w-full flex-col items-center gap-[26px]"
          style={{ maxWidth: HEADER_WIDTH }}
          variants={fadeInUp}
        >
          <WhyChooseBadge />
          <h2
            id="why-us-heading"
            className="m-0 text-center text-[clamp(32px,4vw,48px)] font-bold text-[#171717] [font-family:Manrope,sans-serif] min-[900px]:whitespace-nowrap"
            data-node-id="1:2117"
          >
            The Orgatry Advantage
          </h2>
          <p
            className="m-0 w-full text-center text-base leading-[23.448px] font-semibold text-[#595959] [font-family:Inter,sans-serif]"
            data-node-id="1:2118"
          >
            We combine intelligent HR technology with hands-on expertise to simplify your workforce management and drive
            your business growth.
          </p>
        </motion.header>

        {/* Header→grid spacing from Figma: badge@3068, heading@3118, body@3210, grid@3288 → body-to-grid ≈ 28 */}
        <motion.div
          className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ maxWidth: GRID_MAX, gap: GRID_GAP, marginTop: 2 }}
          variants={featureCardStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          data-node-id="1:2072"
        >
          {WHY_CARDS.map((card) => (
            <LandingFeatureCard
              key={card.id}
              variant="panel"
              density="why"
              background={card.background}
              iconSrc={card.icon}
              iconSize={card.iconSize}
              title={card.title}
              description={card.description}
              descriptionClassName={card.descriptionClassName}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
