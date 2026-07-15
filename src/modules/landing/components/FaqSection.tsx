import { AnimatePresence, motion } from 'framer-motion';
import { useId } from 'react';
import faqMinus from '@/modules/landing/assets/icons/faq-minus.svg';
import faqPlus from '@/modules/landing/assets/icons/faq-plus.svg';
import { fadeIn, fadeInUp, faqAccordion } from '@/modules/landing/animations/landingMotion';
import { landingFaqs } from '@/modules/landing/constants/content';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { useFaqAccordion } from '@/modules/landing/hooks/useFaqAccordion';
import { SectionBadge } from '@/modules/landing/shared/SectionBadge';
import { cn } from '@/lib/utils';

/** Figma `1:1532` — gap Why→FAQ ≈ `86.4`. */
const SECTION_GAP_TOP = landingTokens.sectionGapMd;
const COLUMN_GAP = 107;
const ACCORDION_WIDTH = 730;
const BORDER = 'border-[rgba(23,23,23,0.12)]';

function FaqBadge() {
  return (
    <SectionBadge
      className={cn(
        'h-[23px] w-[73px] justify-center rounded-[50px] border border-[#008435]',
        'bg-[rgba(34,197,94,0.2)] text-base font-bold text-[#02431d] [font-family:Manrope,sans-serif]'
      )}
    >
      FAQ’S
    </SectionBadge>
  );
}

type FaqItemProps = {
  id: string;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  isFirst: boolean;
};

function FaqItem({ id, question, answer, open, onToggle, isFirst }: FaqItemProps) {
  const panelId = `${id}-panel`;
  const headerId = `${id}-header`;

  return (
    <div
      className={cn(
        'flex w-full flex-col items-start px-5 py-8',
        BORDER,
        'border-b-[1.5px] border-solid',
        isFirst && 'border-t-[1.5px]',
        open && 'gap-5'
      )}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between gap-4 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/40 focus-visible:ring-offset-2"
      >
        <span className="max-w-[672px] text-[clamp(15px,2.6vw,20px)] leading-normal font-semibold text-[#171717] [font-family:Manrope,sans-serif]">
          {question}
        </span>
        <span className="relative size-6 shrink-0" aria-hidden>
          <img
            src={open ? faqMinus : faqPlus}
            alt=""
            width={24}
            height={24}
            className="size-6"
            decoding="async"
          />
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
            <p className="m-0 max-w-[575px] text-base leading-normal font-normal text-[#595959] [font-family:Inter,sans-serif]">
              {answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * FAQ — Figma `1:1532`.
 * Horizontal SPACE_BETWEEN · pad `0 100` · gap `107` · accordion `730`.
 */
export function FaqSection() {
  const listId = useId();
  const { isOpen, toggle } = useFaqAccordion(landingFaqs[0]?.id ?? null);

  return (
    <motion.section
      aria-labelledby="faq-heading"
      data-node-id="1:1532"
      className="relative bg-white"
      style={{ marginTop: SECTION_GAP_TOP }}
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-12 lg:flex-row lg:gap-[107px]"
        style={{
          paddingInline: `clamp(1.5rem, 6vw, ${landingTokens.gutter}px)`,
          columnGap: COLUMN_GAP
        }}
      >
        <motion.div
          className="flex w-full max-w-[290px] shrink-0 flex-col items-start"
          variants={fadeInUp}
          data-node-id="1:1533"
        >
          <div className="relative mb-0 w-full max-w-[267px] min-[1024px]:min-h-[241px]" data-node-id="1:1534">
            <div className="mb-4 min-[1024px]:absolute min-[1024px]:top-0 min-[1024px]:left-0 min-[1024px]:mb-0">
              <FaqBadge />
            </div>
            <h2
              id="faq-heading"
              className="m-0 w-full text-[clamp(32px,5vw,48px)] leading-normal font-bold text-[#171717] [font-family:Manrope,sans-serif] min-[1024px]:absolute min-[1024px]:top-[29px] min-[1024px]:left-0 min-[1024px]:w-[267px] min-[1024px]:text-[48px]"
              data-node-id="1:1537"
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-6 flex flex-col items-start gap-4 min-[1024px]:mt-0" data-node-id="1:1538">
            <p className="m-0 text-base font-medium text-[#595959] [font-family:Inter,sans-serif]">
              Ask any questions
            </p>
            <a
              href="mailto:hello@orgatry.com"
              className="break-all text-[clamp(22px,5vw,32px)] leading-normal font-medium text-[#15803d] no-underline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/40 [font-family:Inter,sans-serif] sm:break-normal sm:whitespace-nowrap"
            >
              hello@orgatry.com
            </a>
          </div>
        </motion.div>

        <motion.div
          id={listId}
          className="flex w-full flex-col items-start"
          style={{ maxWidth: ACCORDION_WIDTH }}
          variants={fadeInUp}
          data-node-id="1:1541"
        >
          {landingFaqs.map((faq, index) => (
            <FaqItem
              key={faq.id}
              id={faq.id}
              question={faq.question}
              answer={faq.answer}
              open={isOpen(faq.id)}
              onToggle={() => toggle(faq.id)}
              isFirst={index === 0}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
