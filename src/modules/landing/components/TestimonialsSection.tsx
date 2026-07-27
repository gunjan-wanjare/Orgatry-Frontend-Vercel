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
import { SectionBadge } from '@/modules/landing/shared/SectionBadge';
import { SectionHeading } from '@/modules/landing/shared/SectionHeading';
import { cn } from '@/lib/utils';

const SECTION_GAP_TOP = landingTokens.sectionGapSm;
const SECTION_PAD_Y_TOP = 20;
const SECTION_PAD_Y_BOTTOM = 20;
const SECTION_STACK_GAP = 31;
const MARQUEE_SPEED = 38;

function TestimonialsBadge() {
  return (
    <SectionBadge
      className={cn(
        'h-[31px] w-[136px] justify-center rounded-[503px] border border-[#008435]',
        'bg-[rgba(34,197,94,0.2)] text-[15px] font-bold text-[#02431d] [font-family:Manrope,sans-serif]'
      )}
    >
      Testimonials
    </SectionBadge>
  );
}

function cardWidthForViewport(width: number) {
  if (width < 768) return Math.min(TESTIMONIAL_CARD_WIDTH_MOBILE, width - 40);
  if (width < 1024) return Math.min(TESTIMONIAL_CARD_WIDTH_TABLET, width - 64);
  return Math.min(TESTIMONIAL_CARD_WIDTH_DESKTOP, width - 80);
}

/**
 * Testimonials — full-bleed marquee with responsive card density.
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
      data-node-id="1:2122"
      className="relative overflow-x-hidden bg-white"
      style={{
        marginTop: SECTION_GAP_TOP,
        paddingTop: SECTION_PAD_Y_TOP,
        paddingBottom: SECTION_PAD_Y_BOTTOM
      }}
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div
        className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-6 lg:px-0"
        style={{ gap: SECTION_STACK_GAP }}
      >
        <motion.div variants={fadeInUp}>
          <TestimonialsBadge />
        </motion.div>

        <motion.div variants={fadeInUp} className="w-full max-w-[564px]">
          <SectionHeading
            alignment="center"
            className="w-full gap-5"
            title={
              <h2
                id="testimonials-heading"
                className="m-0 max-w-[564px] text-center text-[clamp(28px,4vw,45.6px)] font-bold capitalize leading-normal text-[#00173c] [font-family:Manrope,sans-serif]"
              >
                What Our Happy Clients
                <br />
                Are Saying
              </h2>
            }
            subtitle={
              <p className="m-0 max-w-[564px] text-center text-[clamp(15px,2.5vw,19px)] font-normal leading-[1.5] text-[#576a8a] [font-family:Inter,sans-serif]">
                Hear from satisfied clients who have transformed their property management experience with our
                platform.
              </p>
            }
          />
        </motion.div>
      </div>

      <motion.div
        variants={fadeInUp}
        className="relative mt-6 w-full sm:mt-8"
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
                width={cardWidth}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
