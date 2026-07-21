import { createContext, useContext } from 'react';
import type { IntroContextValue } from '@/components/intro/types';

export const IntroContext = createContext<IntroContextValue | null>(null);

const SKIPPED_FALLBACK: IntroContextValue = {
  phase: 'skipped',
  isContentReady: true,
  showNavbarLogo: false,
  shiftNavbarControls: false,
  loaderRect: null,
  completeLoader: () => undefined,
  arriveAtHero: () => undefined,
  finishIntro: () => undefined
};

/**
 * Read the intro state machine. Safe outside IntroProvider (legal pages, etc.) —
 * returns a skipped/no-op fallback so anchors and nav keep working.
 */
export function useIntro(): IntroContextValue {
  return useContext(IntroContext) ?? SKIPPED_FALLBACK;
}
