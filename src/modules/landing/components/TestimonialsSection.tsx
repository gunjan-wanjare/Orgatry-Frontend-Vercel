import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TestimonialCard,
  TESTIMONIAL_CARD_GAP,
  TESTIMONIAL_CARD_WIDTH_DESKTOP,
  TESTIMONIAL_CARD_WIDTH_MOBILE,
  TESTIMONIAL_CARD_WIDTH_TABLET
} from '@/modules/landing/cards/TestimonialCard';
import { fadeIn, fadeInUp } from '@/modules/landing/animations/landingMotion';
import { landingTestimonials } from '@/modules/landing/constants/content';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { fluid } from '@/modules/landing/utils/scale';

/** Figma `285:186` — heading 48 / body 24, toned down + fluid. No badge in this design. */
const HEADING_SIZE = fluid(24, 36);
const BODY_SIZE = fluid(15, 18);
const MARQUEE_SPEED = 38;

function cardWidthForViewport(width: number) {
  if (width < 768) return Math.min(TESTIMONIAL_CARD_WIDTH_MOBILE, width - 40);
  if (width < 1024) return Math.min(TESTIMONIAL_CARD_WIDTH_TABLET, width - 64);
  return Math.min(TESTIMONIAL_CARD_WIDTH_DESKTOP, width - 80);
}

/**
 * Testimonials — Figma `285:186` (What Our Happy Clients Are Saying).
 * Left-aligned heading/body, then a full-bleed marquee of bordered cards
 * (kept as a marquee for variety across 5 personas — Figma shows a static
 * 3-card row, but the extra motion doesn't change the section's structure).
 */
export function TestimonialsSection() {
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [cardWidth, setCardWidth] = useState(TESTIMONIAL_CARD_WIDTH_DESKTOP);
  const isTouchRef = useRef(false);

  const loopItems = useMemo(() => {
    const base = landingTestimonials;
    return [...base, ...base].map((item, i) => ({ item, key: `${item.id}-m-${i}` }));
  }, []);

  useEffect(() => {
    isTouchRef.current = window.matchMedia('(hover: none)').matches;
    const syncWidth = () => setCardWidth(cardWidthForViewport(window.innerWidth));
    syncWidth();
    window.addEventListener('resize', syncWidth);
    return () => window.removeEventListener('resize', syncWidth);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => setSegmentWidth(el.scrollWidth / 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loopItems.length, cardWidth]);

  useAnimationFrame((_, delta) => {
    if (paused && !isTouchRef.current) return;
    if (segmentWidth <= 0) return;

    const distance = (MARQUEE_SPEED * delta) / 1000;
    let next = x.get() - distance;
    if (next <= -segmentWidth) {
      next += segmentWidth;
    }
    x.set(next);
  });

  return (
    <motion.section
      aria-labelledby="testimonials-heading"
      className="relative overflow-x-hidden bg-[#f3f3f5] md:py-20 py-10"
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <motion.div
        variants={fadeInUp}
        className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-4"
        style={{ paddingInline: `clamp(1.5rem, 6vw, ${landingTokens.gutter}px)` }}
      >
        <h2
          id="testimonials-heading"
          className="m-0 w-full text-[#000d00] capitalize [font-family:Sora,sans-serif]"
          style={{ fontSize: HEADING_SIZE, fontWeight: 500 }}
        >
          What Our Happy Clients Are Saying
        </h2>
        <p
          className="m-0 w-full max-w-[720px] font-normal text-[#000d00] [font-family:Jost,sans-serif] mb-4"
          style={{ fontSize: BODY_SIZE, lineHeight: 1.5 }}
        >
          Hear from satisfied clients who have transformed their property management experience with our platform.
        </p>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="relative w-full"
        onMouseEnter={() => {
          if (!isTouchRef.current) setPaused(true);
        }}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="w-full overflow-hidden"
          role="region"
          aria-roledescription="marquee"
          aria-label="Client testimonials"
        >
          <motion.div
            ref={trackRef}
            className="flex w-max items-stretch will-change-transform"
            style={{ x, gap: TESTIMONIAL_CARD_GAP, paddingInline: 16 }}
          >
            {loopItems.map(({ item, key }) => (
              <TestimonialCard
                key={key}
                quote={item.quote}
                name={item.name}
                role={item.role}
                avatarSrc={item.avatarSrc}
                width={cardWidth}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
