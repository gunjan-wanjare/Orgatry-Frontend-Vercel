
export const splashMark = {
  /** Intrinsic / layout max (70% of prior 120×109). */
  maxW: 84,
  maxH: 76,
  width: 'clamp(52px, 14vw, 84px)',
  height: 'clamp(47px, 12.7vw, 76px)',
  captionSize: 'clamp(12.5px, 4.45vw, 12.4px)',
  gap: 'clamp(3px, 0.8vw, 4px)',
  /** Reserved space on splash panel under the mark. */
  spacerW: 'clamp(52px, 14vw, 84px)',
  spacerH: 'clamp(64px, 16vw, 98px)'
} as const;

export const splashLoadingBar = {
  width: 'min(196px, 49vw)',
  height: 'clamp(2px, 0.35vw, 2.1px)'
} as const;
