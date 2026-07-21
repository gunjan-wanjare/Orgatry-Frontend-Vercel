/**
 * ─────────────────────────────────────────────────────────────────────────────
 * INTRO ANIMATION CONFIG — edit THIS file when porting to another website.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * What to change per site:
 * 1. `brandLogo`  — full mark (icon + wordmark). Used on the loader + hero flight.
 * 2. `iconLogo`   — icon-only mark. Used for the navbar end-state + scroll crossfade.
 * 3. Sizes / timings below if the brand mark needs different scale or duration.
 * 4. Anchor IDs only if your Hero / Navbar use different element ids.
 *
 * Do NOT put asset paths or timing magic numbers anywhere else in the intro system.
 */

import brandLogoAsset from '@/assets/yaka_brand.png';
import iconLogoAsset from '@/assets/yaka_logo.png';
import type { IntroConfig } from '@/components/intro/types';

export const introConfig: IntroConfig = {
  /** Full brand mark (logo + text). */
  brandLogo: brandLogoAsset,

  /** Icon-only mark for the navbar end state. */
  iconLogo: iconLogoAsset,

  /** Loader centered logo max width/height (px). */
  loaderLogoSize: 140,

  /** Hero destination box size (px). */
  heroLogoSize: 110,

  /** Navbar destination / permanent icon size (px). */
  navbarLogoSize: 34,

  /** How long the fullscreen loader stays fully visible (ms). */
  loaderDuration: 3200,

  /** Loader backdrop fade-out duration (ms). */
  loaderFadeDuration: 600,

  /** Scroll Y (px) where the logo starts leaving the hero. */
  scrollStart: 50,

  /** Scroll Y (px) where the logo finishes docking into the navbar. */
  scrollEnd: 240,

  /** Must match the Hero anchor element `id`. */
  heroAnchorId: 'hero-logo-anchor',

  /** Must match the Navbar anchor element `id`. */
  navbarAnchorId: 'navbar-logo-anchor',

  /** Below this viewport width, skip loader + flying logo entirely. */
  mobileBreakpoint: 768,

  /** Navbar right-side controls shift left by this amount while docking (px). */
  navbarShiftPx: 40,

  /** Duration of the navbar controls shift (ms). */
  navbarShiftDuration: 300,

  /** Loader → hero flight duration (ms). */
  flyDuration: 800,

  /**
   * Radial glow behind the loader logo.
   * Prefer a CSS variable so each site can theme it; green default matches Orgatry/YAKA.
   */
  glowColor: 'var(--intro-glow, rgba(34, 197, 94, 0.18))'
};
