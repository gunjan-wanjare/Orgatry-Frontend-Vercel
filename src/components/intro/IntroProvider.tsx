import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { FloatingLogo } from '@/components/intro/FloatingLogo';
import { introConfig } from '@/components/intro/introConfig';
import { Loader } from '@/components/intro/Loader';
import type { DomRectLite, IntroContextValue, IntroPhase } from '@/components/intro/types';
import { IntroContext } from '@/components/intro/useIntro';
import { isMobileViewport, prefersReducedMotion } from '@/components/intro/utils';

type IntroProviderProps = {
  children: ReactNode;
};

function resolveInitialPhase(): IntroPhase {
  if (typeof window === 'undefined') return 'loading';
  if (isMobileViewport(introConfig.mobileBreakpoint) || prefersReducedMotion()) {
    return 'skipped';
  }
  return 'loading';
}

/**
 * Single source of truth for the intro state machine:
 * loading → flying → hero → scrolling → finished
 * (or skipped on mobile / reduced-motion)
 *
 * FlyingLogo mounts only AFTER loader hold + fade complete.
 */
export function IntroProvider({ children }: IntroProviderProps) {
  const [phase, setPhase] = useState<IntroPhase>(() => resolveInitialPhase());
  const [loaderRect, setLoaderRect] = useState<DomRectLite | null>(null);
  const [loaderMounted, setLoaderMounted] = useState(() => resolveInitialPhase() === 'loading');

  useEffect(() => {
    if (phase !== 'loading') return;

    const onResize = () => {
      if (isMobileViewport(introConfig.mobileBreakpoint)) {
        setPhase('skipped');
        setLoaderRect(null);
        setLoaderMounted(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'hero' && phase !== 'scrolling') return;

    const onScroll = () => {
      const y = window.scrollY;
      if (y >= introConfig.scrollStart) {
        setPhase((current) => (current === 'hero' ? 'scrolling' : current));
      } else {
        setPhase((current) => (current === 'scrolling' ? 'hero' : current));
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [phase]);

  const completeLoader = useCallback((rect: DomRectLite) => {
    setLoaderRect(rect);
    setPhase('flying');
  }, []);

  const handleLoaderExited = useCallback(() => {
    setLoaderMounted(false);
  }, []);

  const arriveAtHero = useCallback(() => {
    setPhase((current) => (current === 'flying' ? 'hero' : current));
  }, []);

  const finishIntro = useCallback(() => {
    setPhase('finished');
    setLoaderRect(null);
  }, []);

  const value = useMemo<IntroContextValue>(
    () => ({
      phase,
      // Content may animate in once the loader overlay is gone (flying starts post-fade)
      isContentReady: phase !== 'loading',
      // Permanent navbar icon only after docking completes (or mobile skip)
      showNavbarLogo: phase === 'finished' || phase === 'skipped',
      // Shift while the logo is docking into the navbar
      shiftNavbarControls: phase === 'scrolling',
      loaderRect,
      completeLoader,
      arriveAtHero,
      finishIntro
    }),
    [phase, loaderRect, completeLoader, arriveAtHero, finishIntro]
  );

  const showFloating =
    (phase === 'flying' || phase === 'hero' || phase === 'scrolling') && loaderRect !== null;

  return createElement(
    IntroContext.Provider,
    { value },
    children,
    loaderMounted
      ? createElement(Loader, {
          onComplete: completeLoader,
          onExited: handleLoaderExited
        })
      : null,
    showFloating && loaderRect
      ? createElement(FloatingLogo, { loaderRect, key: 'intro-floating-logo' })
      : null
  );
}
