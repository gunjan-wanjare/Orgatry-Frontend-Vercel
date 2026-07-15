import { motion } from 'framer-motion';
import { fadeInUp } from '@/modules/landing/animations/landingMotion';
import type { LegalBlock, LegalSection } from '@/modules/landing/legal/types';
import { cn } from '@/lib/utils';

const CARD_SHADOW = 'shadow-[1px_1px_10px_0px_rgba(0,0,0,0.15)]';
const CARD_HOVER_SHADOW = 'hover:shadow-[2px_6px_18px_0px_rgba(0,0,0,0.18)]';

function BlockContent({ block }: { block: LegalBlock }) {
  if (block.type === 'paragraph') {
    return (
      <p className="m-0 text-[15px] leading-7 text-[#595959] [font-family:Inter,sans-serif] md:text-base md:leading-8">
        {block.text}
      </p>
    );
  }

  if (block.type === 'list') {
    return (
      <ul className="m-0 flex list-disc flex-col gap-2.5 pl-5 text-[15px] leading-7 text-[#595959] [font-family:Inter,sans-serif] md:text-base md:leading-8">
        {block.items.map((item) => (
          <li key={item} className="pl-1">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className="m-0 grid gap-4 sm:grid-cols-3">
      {block.entries.map((entry) => {
        const isEmail = entry.label.toLowerCase() === 'email';
        return (
          <div key={entry.label} className="flex flex-col gap-1.5">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#15803d] [font-family:Manrope,sans-serif]">
              {entry.label}
            </dt>
            <dd className="m-0 text-base font-medium text-[#171717] [font-family:Inter,sans-serif]">
              {isEmail ? (
                <a
                  href={`mailto:${entry.value}`}
                  className="underline decoration-[#15803d]/40 underline-offset-4 transition-colors duration-300 ease-in-out hover:text-[#15803d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/40"
                >
                  {entry.value}
                </a>
              ) : (
                entry.value
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

type LegalSectionCardProps = {
  section: LegalSection;
  className?: string;
};

/** Premium legal content card — matches landing FeatureCard panel language. */
export function LegalSectionCard({ section, className }: LegalSectionCardProps) {
  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{ y: -3, transition: { duration: 0.3, ease: 'easeInOut' } }}
      className={cn(
        'group rounded-[20px] border border-[#e9e9eb] bg-[#fefefe] p-6 md:p-8',
        CARD_SHADOW,
        CARD_HOVER_SHADOW,
        'transition-shadow duration-300 ease-in-out',
        className
      )}
    >
      <h2 className="m-0 text-xl font-semibold tracking-tight text-[#171717] [font-family:Inter,sans-serif] md:text-2xl">
        {section.title}
      </h2>
      <div className="mt-4 flex flex-col gap-4">
        {section.blocks.map((block, index) => (
          <BlockContent key={`${section.id}-${block.type}-${index}`} block={block} />
        ))}
      </div>
    </motion.article>
  );
}
