import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useId } from 'react';
import { fadeIn, fadeInUp, faqAccordion, featureCardStagger } from '@/modules/landing/animations/landingMotion';
import { landingFaqs } from '@/modules/landing/constants/content';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { CTA_BUTTON_CLASSNAME, ctaButtonStyle } from '@/modules/landing/constants/ctaButton';
import { useFaqAccordion } from '@/modules/landing/hooks/useFaqAccordion';
import { useSmoothScroll } from '@/modules/landing/hooks/useSmoothScroll';
import { LandingButton } from '@/modules/landing/shared/LandingButton';
import { fluid } from '@/modules/landing/utils/scale';

/** Figma `273:3605` — heading 48 / body 24, toned down + fluid. */
const HEADING_SIZE = fluid(24, 36);
const BODY_SIZE = fluid(15, 18);
const QUESTION_SIZE = fluid(16, 20);
const ANSWER_SIZE = fluid(14, 18);

type FaqItemProps = {
  id: string;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
};

function FaqItem({ id, question, answer, open, onToggle }: FaqItemProps) {
  const panelId = `${id}-panel`;
  const headerId = `${id}-header`;

  return (
    <div
      className="flex w-full flex-col items-start gap-2.5 rounded-[16px] border !border-[#D4D4D499] bg-white"
      style={{ padding: fluid(16, 20) }}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-start justify-between gap-4 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#188f44]/40 focus-visible:ring-offset-2"
      >
        <span
          className="text-[#000d00] [font-family:Sora,sans-serif]"
          style={{ fontSize: QUESTION_SIZE, letterSpacing: '-0.02em' }}
        >
          {question}
        </span>
        <span className="mt-0.5 shrink-0 text-[#000d00]" aria-hidden>
          {open ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && answer ? (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            variants={faqAccordion}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="w-full overflow-hidden"
          >
            <p
              className="m-0 font-normal text-[#878c91] [font-family:Jost,sans-serif]"
              style={{ fontSize: ANSWER_SIZE, lineHeight: 1.5 }}
            >
              {answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * FAQ — Figma `273:3605`. Heading + supporting copy + CTA on the left,
 * a stack of bordered accordion cards on the right (no badge in this design).
 */
export function FaqSection() {
  const listId = useId();
  const { isOpen, toggle } = useFaqAccordion(landingFaqs[0]?.id ?? null);
  const { scrollToSection } = useSmoothScroll();

  return (
    <motion.section
      aria-labelledby="faq-heading"
      className="relative bg-white md:py-20 py-10"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-start lg:flex-row lg:justify-between"
        style={{ paddingInline: `clamp(1.5rem, 6vw, ${landingTokens.gutter}px)`, gap: fluid(32, 60) }}
      >
        <motion.div
          className="flex w-full shrink-0 flex-col items-start justify-between gap-10 lg:max-w-[500px]"
          variants={fadeInUp}
        >
          <h2
            id="faq-heading"
            className="m-0 w-full text-[#000d00] capitalize [font-family:Sora,sans-serif]"
            style={{ fontSize: HEADING_SIZE, fontWeight: 500 }}
          >
            General questions asked by customers
          </h2>

          <div className="flex w-full flex-col items-start gap-6">
            <p
              className="m-0 w-full font-normal text-[#000d00] [font-family:Jost,sans-serif]"
              style={{ fontSize: BODY_SIZE, lineHeight: 1.5 }}
            >
              Our friendly team is always here to help you with quick, clear and reliable answers whenever needed.
            </p>
            <LandingButton
              variant="primary"
              onClick={() => scrollToSection('contact')}
              style={ctaButtonStyle}
              className={CTA_BUTTON_CLASSNAME}
              aria-label="Get in touch"
            >
              Get In Touch
            </LandingButton>
          </div>
        </motion.div>

        <motion.div
          id={listId}
          className="flex w-full flex-col items-start"
          style={{ gap: fluid(16, 20) }}
          variants={featureCardStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {landingFaqs.map((faq) => (
            <FaqItem
              key={faq.id}
              id={faq.id}
              question={faq.question}
              answer={faq.answer}
              open={isOpen(faq.id)}
              onToggle={() => toggle(faq.id)}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
