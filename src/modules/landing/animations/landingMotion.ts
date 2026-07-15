import type { Variants } from 'framer-motion';
import { landingTokens } from '@/modules/landing/constants/tokens';

const { durationBase, durationSlow, stagger, easeOut } = landingTokens.motion;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durationBase, ease: easeOut }
  }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeOut }
  }
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.06
    }
  }
};

export const navbarFadeIn: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeOut }
  }
};

export const heroStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.14
    }
  }
};

export const floatingDashboard: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationSlow, ease: easeOut }
  }
};

/** Subtle continuous float for hero metric cards (Figma Loop). */
export const floatLoop = {
  y: [0, -5, 0],
  transition: {
    duration: 4.8,
    repeat: Infinity,
    ease: 'easeInOut' as const
  }
};

export const heroFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durationSlow, ease: easeOut }
  }
};

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeOut }
  }
};

export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeOut }
  }
};

export const faqAccordion: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: durationBase, ease: easeOut }
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: durationBase, ease: easeOut }
  }
};

export const testimonialSlide: Variants = {
  enter: { opacity: 0, x: 16 },
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: durationBase, ease: easeOut }
  },
  exit: {
    opacity: 0,
    x: -16,
    transition: { duration: durationBase, ease: easeOut }
  }
};

export const revealFromLeft: Variants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durationSlow, ease: easeOut }
  }
};

export const revealFromRight: Variants = {
  hidden: { opacity: 0, x: 14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durationSlow, ease: easeOut }
  }
};

export const featureCardStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.12
    }
  }
};
