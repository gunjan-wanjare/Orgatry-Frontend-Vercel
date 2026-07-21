export type IntroPhase =
  | 'loading'
  | 'flying'
  | 'hero'
  | 'scrolling'
  | 'finished'
  | 'skipped';

/** Minimal DOM rect used for measured logo handoffs. */
export type DomRectLite = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type IntroConfig = {
  brandLogo: string;
  iconLogo: string;
  loaderLogoSize: number;
  heroLogoSize: number;
  navbarLogoSize: number;
  loaderDuration: number;
  loaderFadeDuration: number;
  scrollStart: number;
  scrollEnd: number;
  heroAnchorId: string;
  navbarAnchorId: string;
  mobileBreakpoint: number;
  navbarShiftPx: number;
  navbarShiftDuration: number;
  flyDuration: number;
  glowColor: string;
};

export type IntroContextValue = {
  phase: IntroPhase;
  /** True once content under the loader may animate in (or intro was skipped). */
  isContentReady: boolean;
  /** True when the permanent navbar icon should render. */
  showNavbarLogo: boolean;
  /** True while navbar right-side controls should sit shifted left. */
  shiftNavbarControls: boolean;
  /** Measured loader logo rect — handed to FloatingLogo. */
  loaderRect: DomRectLite | null;
  /** Called by Loader with the measured brand-logo rect. */
  completeLoader: (rect: DomRectLite) => void;
  /** Called by FloatingLogo when the flight to the hero anchor finishes. */
  arriveAtHero: () => void;
  /** Called by FloatingLogo when scroll docking finishes. */
  finishIntro: () => void;
};
