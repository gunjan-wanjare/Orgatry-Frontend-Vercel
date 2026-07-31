import { motion } from 'framer-motion';
import { Clock, LayoutGrid, RefreshCw, Settings2, ShieldCheck, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fadeIn, fadeInUp, featureCardStagger } from '@/modules/landing/animations/landingMotion';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { fluid } from '@/modules/landing/utils/scale';

/** Figma `273:2999` — heading 48 / body 24, toned down + fluid. */
const HEADING_SIZE = fluid(24, 36);
const BODY_SIZE = fluid(15, 18);
const CARD_TITLE_SIZE = fluid(17, 20);
const CARD_BODY_SIZE = fluid(14, 15.5);
const ICON_TILE_SIZE = fluid(48, 60);

type WhyCard = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tileBg: string;
  tileBorder: string;
  iconColor: string;
};

const WHY_CARDS: readonly WhyCard[] = [
  {
    id: 'automation',
    title: 'Smart HR Automation',
    description: 'Automate repetitive tasks with HR automation software and save valuable time.',
    icon: RefreshCw,
    tileBg: '#f2faff',
    tileBorder: '#d8f1ff',
    iconColor: '#188f44'
  },
  {
    id: 'experience',
    title: 'Employee-Centric Experience',
    description: 'A seamless, intuitive experience for HR teams and employees alike.',
    icon: Users,
    tileBg: '#fff2f2',
    tileBorder: '#ffd8d8',
    iconColor: '#e0575b'
  },
  {
    id: 'secure',
    title: 'Secure & Scalable',
    description: 'A cloud-based compliance management software that grows with your business.',
    icon: ShieldCheck,
    tileBg: '#f2fff2',
    tileBorder: '#c6f5bc',
    iconColor: '#188f44'
  },
  {
    id: 'hrms',
    title: 'One Unified Platform',
    description: 'Manage recruitment, onboarding, attendance, leave, and performance without switching tools.',
    icon: LayoutGrid,
    tileBg: '#f8f3ff',
    tileBorder: '#e7d8ff',
    iconColor: '#8b5cf6'
  },
  {
    id: 'insights',
    title: 'Real-Time Insights',
    description: 'Confident workplace decisions with powerful analytics and customizable reports.',
    icon: Clock,
    tileBg: '#fff2fb',
    tileBorder: '#ffd8ef',
    iconColor: '#d63d94'
  },
  {
    id: 'support',
    title: 'Dedicated Support',
    description: 'Get expert help from day one, anytime, anywhere.',
    icon: Settings2,
    tileBg: '#fff6ee',
    tileBorder: '#ffecd8',
    iconColor: '#e08a2f'
  }
] as const;

function WhyCardPanel({ card }: { card: WhyCard }) {
  const Icon = card.icon;
  return (
    <motion.div
      variants={fadeInUp}
      className="flex w-full flex-col items-start gap-5 rounded-[16px] border !border-[#D4D4D499] bg-white"
      style={{ padding: fluid(20, 32) }}
    >
      <div
        className="flex shrink-0 items-center justify-center rounded-[10px] border"
        style={{ width: ICON_TILE_SIZE, height: ICON_TILE_SIZE, backgroundColor: card.tileBg, borderColor: card.tileBorder }}
      >
        <Icon className="size-[45%]" style={{ color: card.iconColor }} aria-hidden strokeWidth={1.75} />
      </div>
      <div className="flex w-full flex-col items-start gap-2.5">
        <h3
          className="m-0 text-[#000d00] [font-family:Sora,sans-serif]"
          style={{ fontSize: CARD_TITLE_SIZE, letterSpacing: '-0.03em' }}
        >
          {card.title}
        </h3>
        <p
          className="m-0 font-normal text-[#878c91] [font-family:Jost,sans-serif]"
          style={{ fontSize: CARD_BODY_SIZE, lineHeight: 1.5 }}
        >
          {card.description}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Why Choose Us — Figma `273:2999` (The Orgatry Advantage).
 * Heading + body, then a 3x2 grid of icon-tile cards (no badge in this design).
 */
export function WhyChooseUsSection() {
  return (
    <motion.section
      id="why-us"
      aria-labelledby="why-us-heading"
      className="relative scroll-mt-4 overflow-x-hidden bg-[#f3f3f5] md:py-20 py-10"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-start"
        style={{ paddingInline: `clamp(1.5rem, 6vw, ${landingTokens.gutter}px)`, gap: fluid(32, 60) }}
      >
        <motion.header className="flex w-full flex-col items-start gap-4" variants={fadeInUp}>
          <h2
            id="why-us-heading"
            className="m-0 w-full text-[#000d00] capitalize [font-family:Sora,sans-serif]"
            style={{ fontSize: HEADING_SIZE, fontWeight: 500 }}
          >
            The Orgatry Advantage
          </h2>
          <p
            className="m-0 w-full max-w-[720px] font-normal text-[#000d00] [font-family:Jost,sans-serif]"
            style={{ fontSize: BODY_SIZE, lineHeight: 1.5 }}
          >
            We combine intelligent HR technology with hands-on expertise to simplify your workforce management and
            drive your business growth.
          </p>
        </motion.header>

        <motion.div
          className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: fluid(20, 30) }}
          variants={featureCardStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {WHY_CARDS.map((card) => (
            <WhyCardPanel key={card.id} card={card} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
