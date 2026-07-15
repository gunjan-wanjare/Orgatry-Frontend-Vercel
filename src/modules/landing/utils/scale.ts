/** Approximate visual density scale — keeps container width & section gaps intact. */
export const LANDING_VISUAL_SCALE = 0.95 as const;

/** Scale a Figma px value by ~5% for premium breathing room. */
export function vs(px: number): number {
  return Math.round(px * LANDING_VISUAL_SCALE * 10) / 10;
}
