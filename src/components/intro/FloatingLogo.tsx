import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { introConfig } from '@/components/intro/introConfig';
import type { DomRectLite } from '@/components/intro/types';
import { useIntro } from '@/components/intro/useIntro';
import { clamp, measureAnchor } from '@/components/intro/utils';

type FloatingLogoProps = {
  loaderRect: DomRectLite;
};

/**
 * Fixed-position flying logo.
 * initial = exact loader getBoundingClientRect()
 * → animates to hero anchor (800ms)
 * → holds until scroll
 * → docks to navbar between scrollStart–scrollEnd via motion values
 */
export function FloatingLogo({ loaderRect }: FloatingLogoProps) {
  const { phase, arriveAtHero, finishIntro } = useIntro();
  const [heroTarget, setHeroTarget] = useState<DomRectLite | null>(null);
  const heroRectRef = useRef<DomRectLite | null>(null);
  const navRectRef = useRef<DomRectLite | null>(null);
  const finishedRef = useRef(false);
  const flightDoneRef = useRef(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const scrollProgress = useMotionValue(0);
  const smoothProgress = useSpring(scrollProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.55
  });

  const dockLeft = useTransform(smoothProgress, (t) => {
    const hero = heroRectRef.current;
    const nav = navRectRef.current;
    if (!hero || !nav) return loaderRect.left;
    return hero.left + (nav.left - hero.left) * t;
  });

  const dockTop = useTransform(smoothProgress, (t) => {
    const hero = heroRectRef.current;
    const nav = navRectRef.current;
    if (!hero || !nav) return loaderRect.top;
    return hero.top + (nav.top - hero.top) * t;
  });

  const dockWidth = useTransform(smoothProgress, (t) => {
    const hero = heroRectRef.current;
    const nav = navRectRef.current;
    if (!hero || !nav) return loaderRect.width;
    return hero.width + (nav.width - hero.width) * t;
  });

  const dockHeight = useTransform(smoothProgress, (t) => {
    const hero = heroRectRef.current;
    const nav = navRectRef.current;
    if (!hero || !nav) return loaderRect.height;
    return hero.height + (nav.height - hero.height) * t;
  });

  const brandOpacity = useTransform(smoothProgress, (t) => 1 - t);
  const iconOpacity = useTransform(smoothProgress, (t) => t);

  // Measure hero once flying starts
  useEffect(() => {
    if (phase !== 'flying') return;
    const hero = measureAnchor(introConfig.heroAnchorId);
    if (!hero) {
      arriveAtHero();
      return;
    }
    heroRectRef.current = hero;
    navRectRef.current = measureAnchor(introConfig.navbarAnchorId);
    setHeroTarget(hero);
  }, [phase, arriveAtHero]);

  // Complete dock when progress reaches end
  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (t) => {
      if (phaseRef.current !== 'scrolling' && phaseRef.current !== 'hero') return;
      if (t >= 0.995 && !finishedRef.current) {
        finishedRef.current = true;
        finishIntro();
      }
    });
    return unsubscribe;
  }, [smoothProgress, finishIntro]);

  // Scroll → progress (motion values only — no React state)
  useEffect(() => {
    if (phase !== 'hero' && phase !== 'scrolling') return;

    const refreshAnchors = () => {
      heroRectRef.current = measureAnchor(introConfig.heroAnchorId) ?? heroRectRef.current;
      navRectRef.current = measureAnchor(introConfig.navbarAnchorId) ?? navRectRef.current;
    };

    refreshAnchors();

    const onScroll = () => {
      refreshAnchors();
      const range = introConfig.scrollEnd - introConfig.scrollStart;
      const t = clamp((window.scrollY - introConfig.scrollStart) / range, 0, 1);
      scrollProgress.set(t);
    };

    const onResize = () => {
      refreshAnchors();
      onScroll();
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [phase, scrollProgress]);

  const isFlying = phase === 'flying';
  const isDocking = phase === 'hero' || phase === 'scrolling';

  // —— Flight: loader rect → hero (Framer initial/animate) ——
  if (isFlying) {
    return (
      <motion.div
        className="pointer-events-none fixed z-[100000] will-change-transform"
        initial={{
          left: loaderRect.left,
          top: loaderRect.top,
          width: loaderRect.width,
          height: loaderRect.height
        }}
        animate={
          heroTarget
            ? {
                left: heroTarget.left,
                top: heroTarget.top,
                width: heroTarget.width,
                height: heroTarget.height
              }
            : {
                left: loaderRect.left,
                top: loaderRect.top,
                width: loaderRect.width,
                height: loaderRect.height
              }
        }
        transition={{
          duration: introConfig.flyDuration / 1000,
          ease: [0.16, 1, 0.3, 1]
        }}
        onAnimationComplete={() => {
          if (!heroTarget || flightDoneRef.current) return;
          flightDoneRef.current = true;
          arriveAtHero();
        }}
        aria-hidden
      >
        <img
          src={introConfig.brandLogo}
          alt=""
          className="size-full object-contain"
          draggable={false}
          decoding="async"
        />
      </motion.div>
    );
  }

  // —— Hero hold + scroll dock (motion values) ——
  if (!isDocking) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed z-[100000] will-change-transform"
      style={{
        left: dockLeft,
        top: dockTop,
        width: dockWidth,
        height: dockHeight
      }}
      aria-hidden
    >
      <div className="relative size-full">
        <motion.img
          src={introConfig.brandLogo}
          alt=""
          className="absolute inset-0 size-full object-contain"
          style={{ opacity: brandOpacity }}
          draggable={false}
          decoding="async"
        />
        <motion.img
          src={introConfig.iconLogo}
          alt=""
          className="absolute inset-0 size-full object-contain"
          style={{ opacity: iconOpacity }}
          draggable={false}
          decoding="async"
        />
      </div>
    </motion.div>
  );
}
