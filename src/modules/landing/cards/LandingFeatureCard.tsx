import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/modules/landing/animations/landingMotion';
import learnMoreChevron from '@/modules/landing/assets/icons/learn-more-chevron.png';
import { vs } from '@/modules/landing/utils/scale';

export type LandingFeatureCardVariant = 'inline' | 'panel' | 'cta';
export type LandingFeatureCardBackground = 'transparent' | 'white' | 'mint' | 'gradient';
export type LandingFeatureCardAlignment = 'left' | 'center';
export type LandingFeatureCardDensity = 'solution' | 'why';

export type LandingFeatureCardProps = {
  title: string;
  description: string;
  iconSrc?: string;
  iconSize?: number;
  variant?: LandingFeatureCardVariant;
  background?: LandingFeatureCardBackground;
  alignment?: LandingFeatureCardAlignment;
  density?: LandingFeatureCardDensity;
  className?: string;
  descriptionClassName?: string;
  iconAlt?: string;
  learnMoreHref?: string;
  learnMoreLabel?: string;
  onLearnMore?: () => void;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

const CARD_SHADOW = 'shadow-[1px_1px_10px_0px_rgba(0,0,0,0.15)]';

const backgroundClassName: Record<LandingFeatureCardBackground, string> = {
  transparent: 'bg-transparent',
  white: 'bg-[#fefefe]',
  mint: 'bg-[#f1f9f3]',
  gradient: 'bg-[linear-gradient(-68deg,#22c55e_4%,#15803d_74%)]'
};

/**
 * Shared landing card — Figma About / Solutions / Why, visual scale ~0.95.
 */
export function LandingFeatureCard({
  title,
  description,
  iconSrc,
  iconSize = 24,
  variant = 'inline',
  background = 'transparent',
  alignment = 'left',
  density = 'solution',
  className,
  descriptionClassName,
  iconAlt = '',
  learnMoreHref,
  learnMoreLabel = 'Learn More',
  onLearnMore,
  ctaLabel = 'Get in Touch',
  onCtaClick
}: LandingFeatureCardProps) {
  const scaledIcon = vs(iconSize);

  if (variant === 'cta') {
    return (
      <motion.article
        variants={fadeInUp}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className={cn(
          'group relative flex w-full flex-col items-start',
          CARD_SHADOW,
          backgroundClassName.gradient,
          'transition-shadow duration-200 hover:shadow-[2px_6px_18px_0px_rgba(0,0,0,0.18)]',
          className
        )}
        style={{
          height: vs(261),
          borderRadius: vs(25),
          paddingTop: vs(24),
          paddingRight: vs(53),
          paddingBottom: vs(78),
          paddingLeft: vs(22),
          gap: vs(12)
        }}
      >
        <h3
          className="m-0 w-full font-semibold leading-normal text-white [font-family:Inter,sans-serif]"
          style={{ maxWidth: vs(298), fontSize: vs(24) }}
        >
          {title}
        </h3>
        <p
          className="m-0 w-full font-semibold text-[#dcdcdc] [font-family:Inter,sans-serif]"
          style={{ maxWidth: vs(325), fontSize: vs(12.2), lineHeight: `${vs(19.312)}px` }}
        >
          {description}
        </p>
        <button
          type="button"
          onClick={onCtaClick}
          className="mt-auto inline-flex cursor-pointer items-center justify-center rounded-[50px] bg-white font-semibold text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 [font-family:Inter,sans-serif]"
          style={{ height: vs(33), width: vs(132), fontSize: vs(16) }}
        >
          {ctaLabel}
        </button>
      </motion.article>
    );
  }

  if (variant === 'panel') {
    const isWhy = density === 'why';
    const showLearnMore = Boolean(learnMoreHref || onLearnMore);

    return (
      <motion.article
        variants={fadeInUp}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className={cn(
          'group relative flex h-full w-full flex-col',
          CARD_SHADOW,
          'transition-shadow duration-200 hover:shadow-[2px_6px_18px_0px_rgba(0,0,0,0.18)]',
          backgroundClassName[background === 'transparent' ? 'white' : background],
          alignment === 'center' ? 'items-center text-center' : 'items-start text-left',
          className
        )}
        style={{
          borderRadius: vs(20),
          minHeight: isWhy ? vs(209) : vs(262),
          paddingLeft: vs(28),
          paddingRight: vs(28),
          paddingTop: vs(30),
          paddingBottom: isWhy ? vs(24) : vs(28)
        }}
      >
        {iconSrc ? (
          <span
            className="mb-4 flex shrink-0 items-center justify-center bg-[#f1f9f3]"
            style={{ width: vs(47), height: vs(47), borderRadius: vs(9.75) }}
          >
            <img
              src={iconSrc}
              alt={iconAlt}
              width={scaledIcon}
              height={scaledIcon}
              className="object-contain transition-transform duration-200 group-hover:scale-105"
              style={{ width: scaledIcon, height: scaledIcon }}
              decoding="async"
              aria-hidden={!iconAlt}
            />
          </span>
        ) : null}

        <h3
          className="m-0 mb-3 font-semibold leading-normal text-[#171717] [font-family:Inter,sans-serif]"
          style={{ fontSize: vs(24) }}
        >
          {title}
        </h3>
        <p
          className={cn(
            'm-0 flex-1 font-normal text-[#595959] [font-family:Inter,sans-serif]',
            descriptionClassName
          )}
          style={{ fontSize: vs(14.5), lineHeight: isWhy ? `${vs(21.5)}px` : `${vs(21)}px` }}
        >
          {description}
        </p>

        {showLearnMore ? (
          <a
            href={learnMoreHref ?? '#'}
            onClick={(event) => {
              if (onLearnMore) {
                event.preventDefault();
                onLearnMore();
              }
            }}
            className="mt-auto inline-flex items-center gap-1.5 pt-4 font-semibold text-[#15803d] no-underline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/40 [font-family:Inter,sans-serif]"
            style={{ fontSize: vs(11) }}
          >
            {learnMoreLabel}
            <img
              src={learnMoreChevron}
              alt=""
              width={5}
              height={8}
              className="object-contain"
              style={{ height: vs(8), width: vs(5) }}
              decoding="async"
              aria-hidden
            />
          </a>
        ) : null}
      </motion.article>
    );
  }

  return (
    <motion.article
      variants={fadeInUp}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn('group flex w-full items-start', className)}
      style={{ gap: vs(24) }}
    >
      {iconSrc ? (
        <span
          className="flex shrink-0 items-center justify-center bg-[#f1f9f3] transition-shadow duration-200 group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
          style={{ width: vs(52), height: vs(52), borderRadius: vs(12) }}
        >
          <img
            src={iconSrc}
            alt={iconAlt}
            width={scaledIcon}
            height={scaledIcon}
            className="object-contain transition-transform duration-200 group-hover:scale-105"
            style={{ width: scaledIcon, height: scaledIcon }}
            decoding="async"
            aria-hidden={!iconAlt}
          />
        </span>
      ) : null}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col leading-normal',
          alignment === 'center' ? 'items-center text-center' : 'items-start text-left'
        )}
        style={{ gap: vs(16) }}
      >
        <h3
          className="m-0 w-full font-semibold text-[#171717] [font-family:Manrope,sans-serif]"
          style={{ fontSize: vs(24) }}
        >
          {title}
        </h3>
        <p
          className={cn(
            'm-0 w-full font-normal text-[#595959] [font-family:Inter,sans-serif]',
            descriptionClassName
          )}
          style={{ fontSize: vs(16) }}
        >
          {description}
        </p>
      </div>
    </motion.article>
  );
}

export type LandingFeatureCardListProps = {
  children: ReactNode;
  className?: string;
};

export function LandingFeatureCardList({ children, className }: LandingFeatureCardListProps) {
  return <div className={cn('flex w-full flex-col items-start gap-8', className)}>{children}</div>;
}
