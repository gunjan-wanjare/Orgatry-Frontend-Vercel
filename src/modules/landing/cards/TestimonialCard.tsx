import { memo } from 'react';
import quoteIcon from '@/modules/landing/assets/icons/testimonial-quote.svg';
import { fluid } from '@/modules/landing/utils/scale';
import { cn } from '@/lib/utils';

export type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatarSrc?: string | undefined;
  className?: string;
  width?: number;
};

/** Comfortable marquee widths by breakpoint. */
export const TESTIMONIAL_CARD_WIDTH_DESKTOP = 460;
export const TESTIMONIAL_CARD_WIDTH_TABLET = 400;
export const TESTIMONIAL_CARD_WIDTH_MOBILE = 300;
export const TESTIMONIAL_CARD_GAP = 20;

/** @deprecated use breakpoint widths — kept for imports */
export const TESTIMONIAL_CARD_WIDTH = TESTIMONIAL_CARD_WIDTH_DESKTOP;

const QUOTE_SIZE = fluid(15, 17);
const NAME_SIZE = fluid(14, 15);
const ROLE_SIZE = fluid(12.5, 13.5);

function AvatarOrInitials({ src, name }: { src?: string | undefined; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={54}
        height={54}
        loading="lazy"
        decoding="async"
        className="size-[54px] shrink-0 rounded-[10px] object-cover"
      />
    );
  }

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      aria-hidden
      className="flex size-[54px] shrink-0 items-center justify-center rounded-[10px] bg-[#188f44] text-[18px] font-semibold text-white [font-family:Jost,sans-serif]"
    >
      {initials}
    </div>
  );
}

/**
 * Testimonial card — Figma `285:192`, bordered white panel / radius 16,
 * responsive density for the marquee.
 */
export const TestimonialCard = memo(function TestimonialCard({
  quote,
  name,
  role,
  company,
  avatarSrc,
  className,
  width = TESTIMONIAL_CARD_WIDTH_DESKTOP
}: TestimonialCardProps) {
  return (
    <article
      className={cn(
        'box-border flex shrink-0 flex-col items-start overflow-hidden rounded-[16px] border !border-[#D4D4D499] bg-white mb-4',
        className
      )}
      style={{ width, padding: fluid(20, 32), gap: fluid(20, 32) }}
    >
      <img src={quoteIcon} alt="" width={20} height={20} className="size-5 shrink-0" decoding="async" aria-hidden />

      <div className="flex w-full flex-col items-start" style={{ gap: fluid(20, 32) }}>
        <p
          className="m-0 w-full font-normal text-[#000d00] [font-family:Sora,sans-serif]"
          style={{ fontSize: QUOTE_SIZE, lineHeight: 1.4 }}
        >
          {quote}
        </p>

        <div className="flex items-center gap-4">
          <AvatarOrInitials src={avatarSrc} name={name} />
          <div className="flex min-w-0 flex-col items-start gap-1">
            <p
              className="m-0 truncate font-bold text-[#000d00] [font-family:Jost,sans-serif]"
              style={{ fontSize: NAME_SIZE }}
            >
              {name}
            </p>
            <p
              className="m-0 truncate font-normal text-[#878c91] [font-family:Jost,sans-serif]"
              style={{ fontSize: ROLE_SIZE }}
            >
              {company ? `${role}, ${company}` : role}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
});
