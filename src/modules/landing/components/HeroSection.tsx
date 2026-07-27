import { motion } from 'framer-motion';
import { memo, useCallback, type ImgHTMLAttributes } from 'react';
import arrowDownRight from '@/modules/landing/assets/icons/arrow-down-right.svg';
import arrowTopLeft from '@/modules/landing/assets/icons/arrow-top-left.svg';
import arrowUp from '@/modules/landing/assets/icons/arrow-up.svg';
import heroCtaArrow from '@/modules/landing/assets/icons/hero-cta-arrow.svg';
import heroShield from '@/modules/landing/assets/icons/hero-shield.svg';
import heroDashboard from '@/modules/landing/assets/images/hero-dashboard.png';
import heroDashboardOverlay from '@/modules/landing/assets/images/hero-dashboard-overlay.png';
import {
  floatLoop,
  floatingDashboard,
  heroFadeIn,
  heroItem,
  heroStagger
} from '@/modules/landing/animations/landingMotion';
import { introConfig } from '@/components/intro';
import { useIntro } from '@/components/intro/useIntro';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { useSmoothScroll } from '@/modules/landing/hooks/useSmoothScroll';
import { LandingButton } from '@/modules/landing/shared/LandingButton';
import { SectionBadge } from '@/modules/landing/shared/SectionBadge';
import { LANDING_VISUAL_SCALE, vs } from '@/modules/landing/utils/scale';
import { cn } from '@/lib/utils';

/** Artboard width from Figma `1:1140`. */
const ARTBOARD = landingTokens.artboardWidth;
const HERO_HEIGHT = landingTokens.heroHeight;
const SCALED_HERO_HEIGHT = vs(HERO_HEIGHT);

/** BG Line Objects `1:1141` — pad 32, gap 55, 26 strokes. */
const LINE_PAD = 32;
const LINE_GAP = 55.04;
const LINE_COUNT = 26;
const LINE_OPACITY = 0.02;
const LINE_WEIGHT = 2;

const CTA_SHADOW = 'shadow-[4px_11px_22.8px_0px_rgba(0,0,0,0.06)]';
const CARD_SHADOW_SOFT = 'shadow-[-7px_11px_28.5px_0px_rgba(0,0,0,0.05)]';
const CARD_SHADOW_DEEP = 'shadow-[20px_20px_42.1px_0px_rgba(0,0,0,0.15)]';
const CARD_BORDER = 'border-[1.5px] border-[#e9e9eb]';

function VerticalGuideLines({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      data-node-id="1:1141"
    >
      {Array.from({ length: LINE_COUNT }, (_, index) => {
        const left = LINE_PAD + index * LINE_GAP;
        return (
          <span
            key={left}
            className="absolute top-0 h-full"
            style={{
              left,
              width: LINE_WEIGHT,
              marginLeft: -LINE_WEIGHT / 2,
              backgroundColor: `rgba(0,0,0,${LINE_OPACITY})`
            }}
          />
        );
      })}
    </div>
  );
}

function HeroBadge() {
  return (
    <SectionBadge
      className={cn(
        'max-w-full gap-1 rounded-[100px] bg-[#edffef] py-0.5 pr-2 pl-0.5',
        'md:gap-1.5 md:py-0.5 md:pr-2.5 md:pl-1',
        'min-[1440px]:gap-2 min-[1440px]:py-1 min-[1440px]:pr-3 min-[1440px]:pl-1'
      )}
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-[100px] bg-white',
          'md:size-7',
          'min-[1440px]:size-8'
        )}
      >
        <img
          src={heroShield}
          alt=""
          width={20}
          height={20}
          className="size-3.5 md:size-4 min-[1440px]:size-5"
          decoding="async"
        />
      </span>
      <span
        className={cn(
          'min-w-0 max-w-[calc(100vw-5.5rem)] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] leading-normal font-medium text-[#171717] [font-family:Manrope,sans-serif]',
          'md:max-w-[calc(100vw-6rem)] md:text-[13px]',
          'min-[1440px]:max-w-none min-[1440px]:text-base'
        )}
      >
        Smart HR Technology for Growing Businesses
      </span>
    </SectionBadge>
  );
}

type MetricIconProps = {
  src: string;
  className?: string;
  imgClassName?: string;
};

function MetricIconDisc({ src, className, imgClassName }: MetricIconProps) {
  return (
    <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-[100px] bg-[#15833e]', className)}>
      <img src={src} alt="" width={16} height={16} className={cn('size-4', imgClassName)} decoding="async" />
    </span>
  );
}

const PerformanceCard = memo(function PerformanceCard({ introReady }: { introReady: boolean }) {
  return (
    <div
      className="absolute top-[581px] left-[1215px] z-20 origin-center"
      style={{ transform: 'rotate(-18.971deg)' }}
      data-node-id="1:1200"
    >
      <motion.div
        className={cn(
          'flex w-[216px] flex-col items-start rounded-3xl bg-white p-6',
          CARD_BORDER,
          CARD_SHADOW_SOFT
        )}
        initial={{ opacity: 0, y: 16 }}
        animate={introReady ? { opacity: 1, y: floatLoop.y } : { opacity: 0, y: 16 }}
        transition={{
          opacity: { duration: landingTokens.motion.durationSlow, ease: landingTokens.motion.easeOut, delay: 0.45 },
          y: { ...floatLoop.transition, delay: 0.6 }
        }}
      >
        <div className="flex w-[168px] flex-col items-start gap-3">
          <p className="m-0 text-center text-base leading-[1.24] text-[#171717]/80 [font-family:Inter,sans-serif]">
            performance score @
          </p>
          <p className="m-0 text-[32px] leading-[1.24] font-semibold text-[#171717] [font-family:Manrope,sans-serif]">
            95%
          </p>
        </div>
      </motion.div>
    </div>
  );
});

const GrowthPillCard = memo(function GrowthPillCard({ introReady }: { introReady: boolean }) {
  return (
    <motion.div
      className={cn(
        'absolute top-[607px] left-24 z-20 flex flex-col items-start rounded-[100px] bg-white px-4 py-2.5',
        CARD_BORDER,
        CARD_SHADOW_SOFT
      )}
      data-node-id="1:1205"
      initial={{ opacity: 0, y: 12 }}
      animate={introReady ? { opacity: 1, y: floatLoop.y } : { opacity: 0, y: 12 }}
      transition={{
        opacity: { duration: landingTokens.motion.durationBase, ease: landingTokens.motion.easeOut, delay: 0.35 },
        y: { ...floatLoop.transition, delay: 0.2, duration: 5 }
      }}
    >
      <div className="flex items-center justify-center gap-3">
        <MetricIconDisc src={arrowUp} />
        <p className="m-0 text-center text-base leading-[1.24] font-normal text-[#171717] [font-family:Manrope,sans-serif]">
          347.23%
        </p>
      </div>
    </motion.div>
  );
});

const EmployedCard = memo(function EmployedCard({ introReady }: { introReady: boolean }) {
  return (
    <div
      className="absolute top-[702.16px] left-[106px] z-20 origin-center"
      style={{ transform: 'rotate(6.082deg)' }}
      data-node-id="1:1212"
    >
      <motion.div
        className={cn(
          'flex w-[228px] flex-col items-start gap-6 rounded-3xl bg-white p-6',
          CARD_BORDER,
          CARD_SHADOW_DEEP
        )}
        initial={{ opacity: 0, y: 16 }}
        animate={introReady ? { opacity: 1, y: floatLoop.y } : { opacity: 0, y: 16 }}
        transition={{
          opacity: { duration: landingTokens.motion.durationSlow, ease: landingTokens.motion.easeOut, delay: 0.5 },
          y: { ...floatLoop.transition, delay: 1.1, duration: 5.2 }
        }}
      >
        <div className="flex w-[168px] flex-col items-start gap-3">
          <p className="m-0 text-center text-base leading-[1.24] text-[#595959] [font-family:Inter,sans-serif]">
            Employed Handled
          </p>
          <p className="m-0 text-[32px] leading-[1.24] font-semibold text-[#171717] [font-family:Manrope,sans-serif]">
            23,000
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <MetricIconDisc src={arrowDownRight} />
          <p className="m-0 text-center text-base leading-[1.24] font-normal text-[#171717] [font-family:Manrope,sans-serif]">
            234.45%
          </p>
        </div>
      </motion.div>
    </div>
  );
});

const ScrollHintButton = memo(function ScrollHintButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back to top"
      data-node-id="1:1222"
      className={cn(
        'absolute top-[804px] left-[1240px] z-20 flex size-[50px] items-center justify-center rounded-[100px] bg-white',
        CARD_BORDER,
        'cursor-pointer transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/50'
      )}
    >
      <img src={arrowTopLeft} alt="" width={24} height={24} className="size-6" decoding="async" />
    </button>
  );
});

type DashboardMockupProps = {
  className?: string;
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
};

const DashboardMockup = memo(function DashboardMockup({ className, loading = 'eager' }: DashboardMockupProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-[10px]', className)}
      data-node-id="1:1198"
    >
      <img
        src={heroDashboard}
        alt="Orgatry HRMS dashboard showing employee metrics, team performance, and workforce analytics"
        width={979}
        height={696}
        loading={loading}
        decoding="async"
        className="absolute inset-0 size-full max-w-none rounded-[10px] object-cover"
        fetchPriority="high"
      />
      <img
        src={heroDashboardOverlay}
        alt=""
        width={979}
        height={696}
        loading={loading}
        decoding="async"
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[10px] object-cover"
      />
    </div>
  );
});

function HeroCopy({
  onPrimary,
  onSecondary,
  layout = 'desktop',
  introReady
}: {
  onPrimary: () => void;
  onSecondary: () => void;
  layout?: 'desktop' | 'fluid';
  introReady: boolean;
}) {
  const isDesktop = layout === 'desktop';

  return (
    <motion.div
      className={cn('flex flex-col items-center overflow-visible', isDesktop ? 'w-[764px]' : 'w-full max-w-[764px]')}
      data-node-id="1:1168"
      variants={heroStagger}
      initial="hidden"
      animate={introReady ? 'visible' : 'hidden'}
    >
      <div className="flex w-full flex-col items-center gap-6" data-node-id="1:1169">
        <div
          className={cn('flex flex-col items-center gap-3', isDesktop ? 'w-[926px]' : 'w-full')}
          data-node-id="1:1170"
        >
          <motion.div variants={heroItem}>
            <HeroBadge />
          </motion.div>
          <div className="flex w-full flex-col items-center gap-4 text-center text-black" data-node-id="1:1176">
            <motion.h1
              variants={heroItem}
              className={cn(
                'm-0 leading-[1.24] font-semibold [font-family:Sora,sans-serif]',
                isDesktop ? 'w-[926px] text-[54px]' : 'w-full text-[clamp(28px,7vw,40px)]'
              )}
              data-node-id="1:1177"
            >
              Simplify and Scale Up Your Employee Lifecycle
            </motion.h1>
            <motion.p
              variants={heroItem}
              className={cn(
                'm-0 text-base leading-normal font-normal [font-family:Inter,sans-serif]',
                isDesktop ? 'w-[466px]' : 'w-full max-w-[466px]'
              )}
              data-node-id="1:1178"
            >
              Orgatry delivers HR solutions and scalable HRMS software for workplaces built to grow.
            </motion.p>
          </div>
        </div>
        <motion.div
          variants={heroItem}
          className={cn(
            'flex items-start justify-center gap-4',
            isDesktop ? 'w-[393px]' : 'w-full max-w-[393px] flex-wrap'
          )}
          data-node-id="1:1179"
        >
          <LandingButton
            variant="primary"
            onClick={onPrimary}
            className={cn('h-[51px] gap-2.5 px-8 py-[14px]', CTA_SHADOW)}
            aria-label="See What We've Built"
          >
            See What We've Built
            <img src={heroCtaArrow} alt="" width={23} height={23} className="size-[23px] shrink-0" decoding="async" />
          </LandingButton>
          <LandingButton
            variant="secondary"
            onClick={onSecondary}
            className={cn('h-[50px] px-8 py-[14px]', CTA_SHADOW)}
            aria-label="Talk to Our Experts"
          >
            Talk to Our Experts
          </LandingButton>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Hero Section — Figma `1:1140` (1440×880, `#F3F3F5`, clips content).
 * Navbar is rendered separately by LandingPage (Phase 3); copy starts at y:186.
 */
export function HeroSection() {
  const { scrollToSection } = useSmoothScroll();
  const { isContentReady } = useIntro();

  const goContact = useCallback(() => {
    scrollToSection('contact');
  }, [scrollToSection]);

  const goTop = useCallback(() => {
    scrollToSection('home');
  }, [scrollToSection]);

  return (
    <motion.section
      id="home"
      aria-label="Hero"
      data-node-id="1:1140"
      className="relative scroll-mt-0 overflow-hidden bg-[#f3f3f5]"
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

      {/* —— Desktop / large: pixel artboard —— */}
      <div
        className="relative mx-auto hidden overflow-hidden min-[1440px]:block"
        style={{ width: ARTBOARD, height: SCALED_HERO_HEIGHT }}
      >
        <div
          className="relative"
          style={{
            width: ARTBOARD,
            height: HERO_HEIGHT,
            transform: `scale(${LANDING_VISUAL_SCALE})`,
            transformOrigin: 'top center'
          }}
        >
          <VerticalGuideLines />

          <div className="absolute top-[186px] left-1/2 z-10 -translate-x-1/2">
              <HeroCopy onPrimary={goContact} onSecondary={goContact} layout="desktop" introReady={isContentReady} />
          </div>

          <motion.div
            className="absolute top-[587px] left-[259px] z-10 h-[696px] w-[978.647px]"
            variants={floatingDashboard}
            initial="hidden"
            animate={isContentReady ? 'visible' : 'hidden'}
          >
            <DashboardMockup className="size-full" />
          </motion.div>

          <GrowthPillCard introReady={isContentReady} />
          <EmployedCard introReady={isContentReady} />
          <PerformanceCard introReady={isContentReady} />
          <ScrollHintButton onClick={goTop} />

          {/* Bottom fade `1:1197` — y:711, h:211, background blur 2 */}
          <div
            aria-hidden
            data-node-id="1:1197"
            className="pointer-events-none absolute top-[711px] left-0 z-30 h-[211px] w-full backdrop-blur-[1px]"
            style={{
              background:
                'linear-gradient(180deg, rgba(243,243,245,0) 0%, rgba(243,243,245,0.3) 47.99%, rgb(243,243,245) 100%)'
            }}
          />
        </div>
      </div>

      {/* —— Tablet / mobile: dashboard only (no floating metric cards) —— */}
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center overflow-hidden px-6 md:pt-[160px] pb-10 pt-[140px] min-[1440px]:hidden">
        <VerticalGuideLines className="opacity-70" />
        <div className="relative z-10 flex w-full max-w-[720px] flex-col items-center md:max-w-none md:pr-20">
          <HeroCopy onPrimary={goContact} onSecondary={goContact} layout="fluid" introReady={isContentReady} />
        </div>
        <motion.div
          className="relative z-10 mt-10 w-full max-w-[980px]"
          variants={floatingDashboard}
          initial="hidden"
          animate={isContentReady ? 'visible' : 'hidden'}
        >
          <div className="relative aspect-[978.65/696] w-full overflow-hidden rounded-[10px]">
            <DashboardMockup className="size-full" loading="lazy" />
          </div>
        </motion.div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 backdrop-blur-[1px]"
          style={{
            background:
              'linear-gradient(180deg, rgba(243,243,245,0) 0%, rgba(243,243,245,0.3) 48%, rgb(243,243,245) 100%)'
          }}
        />
      </div>
    </motion.section>
  );
}
