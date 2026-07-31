import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeIn, fadeInUp, featureCardStagger } from '@/modules/landing/animations/landingMotion';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { useSmoothScroll } from '@/modules/landing/hooks/useSmoothScroll';
import { fluid } from '@/modules/landing/utils/scale';

/** Figma `273:2364` — heading 48 / body 24, toned down + fluid. */
const HEADING_SIZE = fluid(24, 36);
const BODY_SIZE = fluid(15, 18);
const CARD_TITLE_SIZE = fluid(18, 24);
const TAG_TEXT_SIZE = fluid(13, 14.5);
const CARD_BODY_SIZE = fluid(14, 15.5);
const CARD_PAD = fluid(20, 32);
const ARROW_BUTTON_SIZE = fluid(44, 56);
const GRID_GAP = fluid(20, 28);

type AboutCard = {
  id: string;
  title: string;
  tags: readonly string[];
  description: string;
  cardBorder: string;
  tagBg: string;
  tagBorder: string;
};

const ABOUT_CARDS: readonly AboutCard[] = [
  {
    id: 'vision',
    title: 'Our Vision',
    tags: ['Innovation Driven', 'People First', 'Future Ready'],
    description: 'Empowering organizations with intelligent HR technology that drives growth and employee success.',
    cardBorder: 'rgba(216,241,255,0.6)',
    tagBg: '#f2faff',
    tagBorder: '#d8f1ff'
  },
  {
    id: 'mission',
    title: 'Our Mission',
    tags: ['Reliable Solutions', 'Simple Experience', 'Continuous Growth'],
    description: 'Delivering user-friendly HRMS solutions that automate operations and improve workplace productivity.',
    cardBorder: 'rgba(255,216,216,0.6)',
    tagBg: '#fff2f2',
    tagBorder: '#ffd8d8'
  },
  {
    id: 'expertise',
    title: 'Our Expertise',
    tags: ['Payroll', 'Recruitment', 'Performance'],
    description: 'From hiring to payroll, we simplify every stage of the employee lifecycle with seamless HR management.',
    cardBorder: 'rgba(255,216,239,0.6)',
    tagBg: '#fff2fb',
    tagBorder: '#ffd8ef'
  },
  {
    id: 'values',
    title: 'Our Values',
    tags: ['Innovation', 'Trust', 'Customer Success'],
    description: 'We build secure, transparent, and reliable HR solutions that businesses can trust.',
    cardBorder: 'rgba(198,245,188,0.6)',
    tagBg: '#f2fff2',
    tagBorder: '#c6f5bc'
  }
] as const;

function AboutCardPanel({ card, onArrowClick }: { card: AboutCard; onArrowClick: () => void }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="flex w-full flex-col items-start justify-end gap-5 rounded-[24px] border bg-white"
      style={{ borderColor: card.cardBorder, padding: CARD_PAD, gap: fluid(16, 24) }}
    >
      <div className="flex w-full flex-col items-start" style={{ gap: fluid(12, 20) }}>
        <h3
          className="m-0 text-[#000d00] [font-family:'Bricolage_Grotesque',sans-serif]"
          style={{ fontSize: CARD_TITLE_SIZE, fontWeight: 500, letterSpacing: '-0.03em' }}
        >
          {card.title}
        </h3>
        <div className="flex flex-wrap items-start gap-2.5">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center justify-center rounded-[8px] border whitespace-nowrap text-black [font-family:Jost,sans-serif]"
              style={{
                backgroundColor: card.tagBg,
                borderColor: card.tagBorder,
                fontSize: TAG_TEXT_SIZE,
                padding: `${fluid(8, 12)} ${fluid(12, 16)}`
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-4">
        <p
          className="m-0 max-w-[558px] font-normal text-[#878c91] [font-family:Jost,sans-serif]"
          style={{ fontSize: CARD_BODY_SIZE, lineHeight: 1.5 }}
        >
          {card.description}
        </p>
        <button
          type="button"
          onClick={onArrowClick}
          aria-label={`Learn more about ${card.title}`}
          className="inline-flex shrink-0 items-center justify-center rounded-[16px] bg-[#188f44] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#188f44]/50 focus-visible:ring-offset-2"
          style={{ width: ARROW_BUTTON_SIZE, height: ARROW_BUTTON_SIZE }}
        >
          <ArrowRight className="size-[43%] text-white" aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}

/**
 * About — Figma `273:2364`. Heading + body copy, then a 2x2 grid of
 * color-tagged cards (Vision / Mission / Expertise / Values), each with
 * three theme pills, a description, and an arrow CTA.
 */
export function AboutSection() {
  const { scrollToSection } = useSmoothScroll();
  const goContact = () => scrollToSection('contact');

  return (
    <motion.section
      id="about"
      aria-label="About Us"
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
        <motion.div className="flex w-full flex-col items-start gap-4 text-left" variants={fadeInUp}>
          <h2
            className="m-0 w-full text-[#000d00] capitalize [font-family:'Bricolage_Grotesque',sans-serif]"
            style={{ fontSize: HEADING_SIZE, fontWeight: 500 }}
          >
            HR Infrastructure for Modern Enterprises
          </h2>
          <p
            className="m-0 w-full max-w-[1061px] font-normal text-[#000d00] [font-family:Jost,sans-serif]"
            style={{ fontSize: BODY_SIZE, lineHeight: 1.5 }}
          >
            Managing people is complex. Orgatry makes it simple. Manage your entire workforce on a single platform <br className="hidden md:block" />
            with our smart, secure HR solutions.
          </p>
        </motion.div>

        <motion.div
          className="grid w-full grid-cols-1 lg:grid-cols-2"
          style={{ gap: GRID_GAP }}
          variants={featureCardStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {ABOUT_CARDS.map((card) => (
            <AboutCardPanel key={card.id} card={card} onArrowClick={goContact} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
