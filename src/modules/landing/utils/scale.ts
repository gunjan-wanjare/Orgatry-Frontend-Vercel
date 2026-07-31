/** Approximate visual density scale — keeps container width & section gaps intact. */
export const LANDING_VISUAL_SCALE = 0.95 as const;

/** Scale a Figma px value by ~5% for premium breathing room. */
export function vs(px: number): number {
  return Math.round(px * LANDING_VISUAL_SCALE * 10) / 10;
}

/**
 * Fluid interpolation between two viewport widths — the "universal" scale unit
 * for the landing page. Below `minVw` the value holds at `minPx`; above `maxVw`
 * it holds at `maxPx`; in between it scales linearly with the viewport.
 * Use for font-size, height, and padding so nothing jumps between fixed
 * breakpoint values — it scales continuously in both directions.
 */
export function fluid(minPx: number, maxPx: number, minVw = 375, maxVw = 1440): string {
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const intercept = minPx - slope * minVw;
  return `clamp(${minPx}px, ${intercept.toFixed(3)}px + ${(slope * 100).toFixed(4)}vw, ${maxPx}px)`;
}
