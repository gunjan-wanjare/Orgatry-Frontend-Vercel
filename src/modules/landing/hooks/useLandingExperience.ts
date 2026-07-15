import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type YakaSlot = 'splash' | 'hero' | 'nav';

type LandingExperienceValue = {
  splashActive: boolean;
  introReady: boolean;
  yakaSlot: YakaSlot;
  reduceMotion: boolean;
};

const LandingExperienceContext = createContext<LandingExperienceValue | null>(null);

const SPLASH_MS = 5000;
const SCROLL_THRESHOLD = 50;
/** Desktop artboard only — Hero YAKA is hidden on tablet/mobile. */
const DESKTOP_YAKA_MQ = '(min-width: 1440px)';

function isDesktopYakaViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_YAKA_MQ).matches;
}

/** After splash: hero on desktop (top of page), otherwise navbar. */
function resolvePostSplashSlot(scrollY: number): YakaSlot {
  if (!isDesktopYakaViewport()) return 'nav';
  return scrollY > SCROLL_THRESHOLD ? 'nav' : 'hero';
}

export function LandingExperienceProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [splashActive, setSplashActive] = useState(true);
  const [introReady, setIntroReady] = useState(false);
  const [yakaSlot, setYakaSlot] = useState<YakaSlot>('splash');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setSplashActive(false);
      setYakaSlot(resolvePostSplashSlot(window.scrollY));
      setIntroReady(true);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      setYakaSlot(resolvePostSplashSlot(0));
      requestAnimationFrame(() => {
        setSplashActive(false);
        setIntroReady(true);
        document.body.style.overflow = previousOverflow;
      });
    }, SPLASH_MS);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!introReady) {
      return;
    }

    const syncSlot = () => {
      setYakaSlot(resolvePostSplashSlot(window.scrollY));
    };

    syncSlot();
    const desktopMq = window.matchMedia(DESKTOP_YAKA_MQ);
    desktopMq.addEventListener('change', syncSlot);
    window.addEventListener('scroll', syncSlot, { passive: true });
    return () => {
      desktopMq.removeEventListener('change', syncSlot);
      window.removeEventListener('scroll', syncSlot);
    };
  }, [introReady]);

  const value = useMemo(
    () => ({
      splashActive,
      introReady,
      yakaSlot,
      reduceMotion
    }),
    [splashActive, introReady, yakaSlot, reduceMotion]
  );

  return createElement(LandingExperienceContext.Provider, { value }, children);
}

export function useLandingExperience(): LandingExperienceValue {
  const ctx = useContext(LandingExperienceContext);
  if (!ctx) {
    return {
      splashActive: false,
      introReady: true,
      yakaSlot: 'hero',
      reduceMotion: false
    };
  }
  return ctx;
}
