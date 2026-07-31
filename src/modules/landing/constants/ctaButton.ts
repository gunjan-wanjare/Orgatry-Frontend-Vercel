import { fluid } from '@/modules/landing/utils/scale';

/**
 * Shared "Get In Touch" pill CTA spec — reused verbatim across Hero, Solutions,
 * and other sections in the current Figma file (rounded-12, solid #188f44,
 * uppercase Jost). Toned down from the literal Figma numbers (h-66/text-26.67)
 * and made fluid so it scales smoothly instead of jumping between breakpoints.
 */
export const CTA_BUTTON_HEIGHT = fluid(46, 56);
export const CTA_BUTTON_PAD_X = fluid(20, 28);
export const CTA_BUTTON_PAD_Y = fluid(12, 16);
export const CTA_BUTTON_TEXT = fluid(14, 16);

export const CTA_BUTTON_CLASSNAME =
  'h-auto rounded-[12px] bg-none bg-[#188f44] uppercase shadow-none [font-family:Jost,sans-serif] hover:shadow-none';

export const ctaButtonStyle = {
  height: CTA_BUTTON_HEIGHT,
  paddingInline: CTA_BUTTON_PAD_X,
  paddingBlock: CTA_BUTTON_PAD_Y,
  fontSize: CTA_BUTTON_TEXT
} as const;
