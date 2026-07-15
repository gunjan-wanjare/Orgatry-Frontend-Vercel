import { motion } from 'framer-motion';
import { memo } from 'react';
import yakaMark from '@/modules/landing/assets/illustrations/yaka-mark.svg';
import { splashMark } from '@/modules/landing/constants/splashVisual';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { vs } from '@/modules/landing/utils/scale';
import { cn } from '@/lib/utils';

export const YAKA_LAYOUT_ID = 'orgatry-yaka-mark';

export type YakaMarkSize = 'splash' | 'hero' | 'nav';

const SIZE_MAP: Record<Exclude<YakaMarkSize, 'splash'>, { w: number; h: number }> = {
  hero: { w: vs(64), h: vs(58) },
  nav: { w: vs(40), h: vs(36) }
};

type YakaMarkMotionProps = {
  size: YakaMarkSize;
  className?: string;
  /** Show “A YAKA Enterprise” caption (hero / splash only) */
  showCaption?: boolean;
};

/** Soft spring — Apple/Linear-like travel; low stiffness, higher damping, no snap. */
const layoutTransition = {
  type: 'spring' as const,
  stiffness: 32,
  damping: 28,
  mass: 1.05,
  restDelta: 0.001,
  restSpeed: 0.001
};

/**
 * Shared-layout YAKA mark — one live instance via `layoutId` across splash → hero → nav.
 * Splash size is ~30% smaller than before and scales with viewport width.
 */
export const YakaMarkMotion = memo(function YakaMarkMotion({
  size,
  className,
  showCaption = false
}: YakaMarkMotionProps) {
  const isSplash = size === 'splash';
  const dim = isSplash ? null : SIZE_MAP[size];

  return (
    <motion.div
      layout
      layoutId={YAKA_LAYOUT_ID}
      initial={false}
      transition={layoutTransition}
      className={cn(
        'flex flex-col items-center will-change-transform',
        showCaption ? (isSplash ? '' : 'gap-[5px]') : 'gap-0',
        className
      )}
      style={
        isSplash
          ? { width: splashMark.width, gap: showCaption ? splashMark.gap : 0 }
          : { width: dim!.w }
      }
    >
      <motion.img
        layout="preserve-aspect"
        src={yakaMark}
        alt="YAKA Enterprise"
        width={isSplash ? splashMark.maxW : dim!.w}
        height={isSplash ? splashMark.maxH : dim!.h}
        className="block object-contain"
        style={
          isSplash
            ? { width: splashMark.width, height: splashMark.height }
            : { width: dim!.w, height: dim!.h }
        }
        transition={layoutTransition}
        decoding="async"
        draggable={false}
      />
      {showCaption ? (
        <p
          className="m-0 whitespace-nowrap text-center leading-none text-[#168540] [font-family:Inter,sans-serif]"
          style={{ fontSize: isSplash ? splashMark.captionSize : vs(9.09) }}
        >
          A YAKA Enterprise
        </p>
      ) : null}
    </motion.div>
  );
});

export const yakaLayoutSpring = layoutTransition;
export const yakaMotionDuration = landingTokens.motion.durationSlow;
