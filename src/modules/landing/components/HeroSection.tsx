import { motion } from 'framer-motion';
import { useCallback } from 'react';
import heroVisual from '@/modules/landing/assets/images/hero-visual.png';
import { floatingDashboard, heroFadeIn, heroItem, heroStagger } from '@/modules/landing/animations/landingMotion';
import { introConfig } from '@/components/intro';
import { useIntro } from '@/components/intro/useIntro';
import { useSmoothScroll } from '@/modules/landing/hooks/useSmoothScroll';
import { LandingButton } from '@/modules/landing/shared/LandingButton';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { CTA_BUTTON_CLASSNAME, ctaButtonStyle } from '@/modules/landing/constants/ctaButton';
import { fluid } from '@/modules/landing/utils/scale';
import { cn } from '@/lib/utils';

/** Fluid type/spacing scale for the hero copy block — interpolates 375px → 1440px viewport. */
const HERO_HEADING_SIZE = fluid(28, 60);
const HERO_BODY_SIZE = fluid(16, 18);

/** BG Line Objects — faint vertical rhythm lines behind hero content. */
// const LINE_PAD = 32;
// const LINE_GAP = 55.04;
// const LINE_COUNT = 26;
// const LINE_OPACITY = 0.02;
// const LINE_WEIGHT = 2;

// function VerticalGuideLines() {
//   return (
//     <div aria-hidden className="pointer-events-none absolute inset-0">
//       {Array.from({ length: LINE_COUNT }, (_, index) => {
//         const left = LINE_PAD + index * LINE_GAP;
//         return (
//           <span
//             key={left}
//             className="absolute top-0 h-full"
//             style={{
//               left,
//               width: LINE_WEIGHT,
//               marginLeft: -LINE_WEIGHT / 2,
//               backgroundColor: `rgba(0,0,0,${LINE_OPACITY})`
//             }}
//           />
//         );
//       })}
//     </div>
//   );
// }

function HeroCopy({
  onPrimary,
  onSecondary,
  introReady
}: {
  onPrimary: () => void;
  onSecondary: () => void;
  introReady: boolean;
}) {
  return (
    <motion.div
      className="flex w-full max-w-[600px] flex-col items-center gap-10 text-center lg:max-w-[575px] lg:items-start lg:text-left"
      variants={heroStagger}
      initial="hidden"
      animate={introReady ? 'visible' : 'hidden'}
    >
      <div className="flex w-full flex-col items-center gap-6 lg:items-start">
        <motion.h1
          variants={heroItem}
          style={{ fontSize: HERO_HEADING_SIZE }}
          className="m-0 w-full leading-[1.26] tracking-[-0.02em] text-[#000d00] capitalize [font-family:'Bricolage_Grotesque',sans-serif]"
        >
          <span className="font-bold">Simplifying HR Management </span>
          <span className="font-thin">for a Modern Workplace</span>
        </motion.h1>
        <motion.p
          variants={heroItem}
          style={{ fontSize: HERO_BODY_SIZE }}
          className="m-0 w-full leading-[1.5] font-normal text-[#000d00]/70 [font-family:Jost,sans-serif]"
        >
          Orgatry delivers smart HRMS solutions that streamline operations, empower employees, and drive business
          growth.
        </motion.p>
      </div>
      <motion.div
        variants={heroItem}
        className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row lg:items-start"
      >
        <LandingButton
          variant="primary"
          onClick={onPrimary}
          style={ctaButtonStyle}
          className={cn(CTA_BUTTON_CLASSNAME, 'w-full sm:w-auto')}
          aria-label="Get in touch"
        >
          Get in Touch
        </LandingButton>
        <LandingButton
          variant="secondary"
          onClick={onSecondary}
          style={ctaButtonStyle}
          className="h-auto w-full rounded-[12px] border !border-[#e2e2e2] bg-white uppercase [font-family:Jost,sans-serif] text-[#000d00] focus-visible:ring-[#188f44]/40 sm:w-auto"
          aria-label="Request a demo"
        >
          Request a Demo
        </LandingButton>
      </motion.div>
    </motion.div>
  );
}

/**
 * Hero Section — two-column layout (copy left, dashboard visual right) that
 * collapses to a stacked, centered layout below `lg`. The dashboard visual
 * (`hero-visual.png`) is a single pre-composed asset that already includes
 * the floating metric cards and scroll accent, so it renders as one image.
 */
export function HeroSection() {
  const { scrollToSection } = useSmoothScroll();
  const { isContentReady } = useIntro();

  const goContact = useCallback(() => {
    scrollToSection('contact');
  }, [scrollToSection]);

  return (
    <motion.section
      id="home"
      aria-label="Hero"
      className="relative scroll-mt-0 overflow-hidden"
      variants={heroFadeIn}
      initial="hidden"
      animate={isContentReady ? 'visible' : 'hidden'}
    >
      {/* Measured destination for the flying brand logo — invisible anchor only */}
      <div
        id={introConfig.heroAnchorId}
        className="pointer-events-none absolute top-[140px] right-6 z-40 hidden min-[768px]:block min-[1440px]:top-[169px] min-[1440px]:right-auto min-[1440px]:left-1/2 min-[1440px]:ml-[578px]"
        style={{
          width: introConfig.heroLogoSize,
          height: introConfig.heroLogoSize
        }}
        aria-hidden
      />
{/* 
      <VerticalGuideLines /> */}

      <div
        className="relative mx-auto flex max-w-[1440px] flex-col items-center pt-[140px] pb-16 md:pt-[160px] md:pb-20 lg:flex-row lg:items-center lg:justify-between lg:pt-[190px] lg:pb-24"
        style={{ paddingInline: `clamp(1.5rem, 6vw, ${landingTokens.gutter}px)` }}
      >
        <HeroCopy onPrimary={goContact} onSecondary={goContact} introReady={isContentReady} />

        <motion.div
          className="relative z-10 w-full max-w-[520px] sm:max-w-[600px] lg:max-w-none lg:flex-1"
          variants={floatingDashboard}
          initial="hidden"
          animate={isContentReady ? 'visible' : 'hidden'}
        >
          <img
            src={heroVisual}
            alt="Orgatry HR dashboard showing employee metrics, team performance analytics, and workforce growth statistics"
            width={2063}
            height={1000}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            draggable={false}
            className="h-full w-full select-none"
          />
        </motion.div>
      </div>

      {/* Bottom fade — softens the section boundary into the next block. No blur: it was bleeding onto the CTA row above it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-12 md:h-16 lg:h-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(243,243,245,0) 0%, rgba(243,243,245,0.3) 47.99%, rgb(243,243,245) 100%)'
        }}
      />
    </motion.section>
  );
}
