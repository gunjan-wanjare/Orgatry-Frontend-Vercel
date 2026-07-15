import { memo } from 'react';
import quoteIcon from '@/modules/landing/assets/icons/testimonial-quote.svg';
import { cn } from '@/lib/utils';

export type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
  company?: string;
  className?: string;
  width?: number;
};

/** Comfortable marquee widths by breakpoint. */
export const TESTIMONIAL_CARD_WIDTH_DESKTOP = 620;
export const TESTIMONIAL_CARD_WIDTH_TABLET = 460;
export const TESTIMONIAL_CARD_WIDTH_MOBILE = 300;
export const TESTIMONIAL_CARD_GAP = 16;

/** @deprecated use breakpoint widths — kept for imports */
export const TESTIMONIAL_CARD_WIDTH = TESTIMONIAL_CARD_WIDTH_DESKTOP;

/**
 * Testimonial card — Figma `#F3F3F5` / radius 20, responsive density for marquee.
 */
export const TestimonialCard = memo(function TestimonialCard({
  quote,
  name,
  role,
  company,
  className,
  width = TESTIMONIAL_CARD_WIDTH_DESKTOP
}: TestimonialCardProps) {
  return (
    <article
      className={cn(
        'box-border flex shrink-0 flex-col items-start overflow-hidden rounded-[20px] bg-[#f3f3f5]',
        'p-4 sm:p-5 md:p-6',
        className
      )}
      style={{ width }}
      data-node-id="1:2131"
    >
      <div className="flex w-full flex-col items-start gap-3 sm:gap-4 md:gap-5">
        <img
          src={quoteIcon}
          alt=""
          width={40}
          height={40}
          className="size-8 shrink-0 sm:size-9 md:size-10"
          decoding="async"
          aria-hidden
        />

        <p className="m-0 w-full text-[13px] leading-[1.55] font-normal text-[#576a8a] [font-family:Montserrat,sans-serif] sm:text-[14px] md:text-[16px]">
          {quote}
        </p>

        <div className="flex min-w-0 flex-col items-start gap-0.5">
          <p className="m-0 truncate text-[14px] font-semibold leading-normal text-[#00173c] [font-family:Montserrat,sans-serif] sm:text-[15px] md:text-lg">
            {name}
          </p>
          <p className="m-0 text-[12px] leading-[1.5] font-light text-[#576a8a] [font-family:Montserrat,sans-serif] sm:text-[13px] md:text-sm">
            {company ? `${role}, ${company}` : role}
          </p>
        </div>
      </div>
    </article>
  );
});
