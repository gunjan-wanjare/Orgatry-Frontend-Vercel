/** Layout and motion constants from Figma frame `1:1139` (Orgatry landing). */
export const landingTokens = {
  artboardWidth: 1440,
  /** Home Page frame (`186:116`) content column — 1890 canvas minus the 174px side margins. */
  contentWidth: 1542,
  /** Home Page frame (`186:116`) consistent content margin (About/Solutions/Why Us/FAQ/Testimonials). */
  gutter: 174,
  trustedSidePadding: 230,
  sectionGapLg: 60,
  sectionGapMd: 60,
  sectionGapSm: 25,
  radiusPill: 100,
  radiusCard: 20,
  radiusPanel: 40,
  radiusIconTile: 12,
  /** Home Page frame (`186:116`) Header (`186:119`) real height. */
  navbarHeight: 111,
  /** Header is flush against the viewport top in the current design (no floating gap). */
  navbarTop: 0,
  /** Effective clearance for section anchors ≈ top + height. */
  navbarScrollOffset: 112,
  heroHeight: 880,
  aboutHeight: 717,
  trustedHeight: 271,
  buttonHeight: 50,
  buttonPaddingX: 32,
  buttonPaddingY: 14,
  motion: {
    durationFast: 0.22,
    durationBase: 0.42,
    durationSlow: 0.65,
    stagger: 0.09,
    easeOut: [0.16, 1, 0.3, 1] as const
  }
} as const;

export type LandingTokens = typeof landingTokens;
