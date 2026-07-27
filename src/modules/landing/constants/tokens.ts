/** Layout and motion constants from Figma frame `1:1139` (Orgatry landing). */
export const landingTokens = {
  artboardWidth: 1440,
  contentWidth: 1240,
  gutter: 100,
  trustedSidePadding: 230,
  sectionGapLg: 40,
  sectionGapMd: 40,
  sectionGapSm: 25,
  radiusPill: 100,
  radiusCard: 20,
  radiusPanel: 40,
  radiusIconTile: 12,
  navbarHeight: 74,
  /** Fixed navbar top offset (Figma). */
  navbarTop: 32,
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
