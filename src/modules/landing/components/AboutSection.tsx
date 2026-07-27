import { motion } from 'framer-motion';
import { memo } from 'react';
import expertiseIcon from '@/modules/landing/assets/icons/about-expertise.svg';
import missionIcon from '@/modules/landing/assets/icons/about-mission.svg';
import visionIcon from '@/modules/landing/assets/icons/about-vision.svg';
import aboutPhoneMockup from '@/modules/landing/assets/images/about-phone-mockup.png';
import {
  featureCardStagger,
  revealFromLeft,
  revealFromRight
} from '@/modules/landing/animations/landingMotion';
import { LandingFeatureCard } from '@/modules/landing/cards/LandingFeatureCard';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { cn } from '@/lib/utils';
import { vs } from '@/modules/landing/utils/scale';

/** Figma `1:1332` — phone column 576×717 (×0.95 visual scale). */
const PHONE_COL_W = vs(576);
const PHONE_COL_H = vs(717);
const PHONE_COL_LEFT = vs(764);
const COPY_LEFT = vs(100);
const COPY_TOP = vs(78);
const COPY_WIDTH = vs(505);

const ABOUT_FEATURES = [
  {
    id: 'vision',
    title: 'Our Vision',
    description:
      'We want to ensure HR technology for businesses that can scale without friction.',
    icon: visionIcon
  },
  {
    id: 'mission',
    title: 'Our Mission',
    description:
      "We deliver HRMS infrastructure that's reliable, intelligent, and built to scale with you.",
    icon: missionIcon
  },
  {
    id: 'expertise',
    title: 'Our Expertise',
    description:
      'We specialize in solving every operational HR problem across recruitment, attendance, leave, onboarding, and performance.',
    icon: expertiseIcon,
    descriptionClassName: 'max-w-[403px]'
  }
] as const;

function FeatureList({ fluid }: { fluid?: boolean }) {
  return (
    <motion.div className="flex w-full flex-col items-start gap-8" data-node-id="1:1297" variants={featureCardStagger}>
      {ABOUT_FEATURES.map((feature) => {
        const descriptionClassName =
          !fluid && 'descriptionClassName' in feature ? feature.descriptionClassName : undefined;
        return (
          <LandingFeatureCard
            key={feature.id}
            variant="inline"
            iconSrc={feature.icon}
            iconSize={24}
            title={feature.title}
            description={feature.description}
            {...(descriptionClassName ? { descriptionClassName } : {})}
          />
        );
      })}
    </motion.div>
  );
}

const PhoneMockup = memo(function PhoneMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative overflow-visible', className)}
      style={{ width: PHONE_COL_W, height: PHONE_COL_H }}
      data-node-id="1:1332"
    >
      <img
        src={aboutPhoneMockup}
        alt="Orgatry mobile app showing payroll summary, send and receive actions, and recent transactions"
        width={PHONE_COL_W}
        height={PHONE_COL_H}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full max-w-none object-contain object-top"
      />
    </div>
  );
});

export function AboutSection() {
  return (
    <section
      id="about"
      aria-label="About Us"
      data-node-id="1:1292"
      className="relative scroll-mt-28 overflow-x-hidden bg-white"
      style={{ marginTop: landingTokens.sectionGapLg }}
    >
      {/* Desktop artboard (Strictly 1440px and up) */}
      <div
        className="relative mx-auto hidden min-[1440px]:block"
        style={{ width: landingTokens.artboardWidth, height: landingTokens.aboutHeight }}
      >
        <motion.div
          className="absolute flex flex-col items-start gap-10"
          style={{ left: COPY_LEFT, top: COPY_TOP, width: COPY_WIDTH }}
          data-node-id="1:1293"
          variants={revealFromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex w-[475px] flex-col items-start gap-4 leading-normal" data-node-id="1:1294">
            <h2
              className="m-0 w-full text-[45.6px] font-bold text-[#171717] [font-family:Manrope,sans-serif]"
              data-node-id="1:1295"
            >
              HR Infrastructure for Modern Enterprises
            </h2>
            <p
              className="m-0 w-full text-base font-normal text-[#595959] [font-family:Inter,sans-serif]"
              data-node-id="1:1296"
            >
              Managing people is complex.
            </p>
            <p className="m-0 w-full text-base font-normal text-[#595959] [font-family:Inter,sans-serif]">
              Orgatry makes it simple.
            </p>
            <p className="m-0 w-full text-base font-normal text-[#595959] [font-family:Inter,sans-serif]">
              Manage your entire workforce on a single platform with our smart, secure HR solutions.
            </p>
          </div>
          <FeatureList />
        </motion.div>

        <motion.div
          className="absolute top-0"
          style={{ left: PHONE_COL_LEFT }}
          variants={revealFromRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <PhoneMockup />
        </motion.div>
      </div>

      {/* Fluid Responsive container (< 1440px down to Mobile) */}
      {/* lg:flex-row keeps them side-by-side down to 1024px; flex-col stacks them below 1024px */}
      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row lg:items-center lg:justify-between gap-12 px-6 py-0 min-[1440px]:hidden md:px-16">
        
        <motion.div
          className="flex w-full lg:max-w-[50%] flex-col items-start gap-10"
          variants={revealFromLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex w-full flex-col items-start gap-4">
            <h2 className="m-0 text-[clamp(32px,6vw,48px)] font-bold text-[#171717] [font-family:Manrope,sans-serif]">
              HR Infrastructure for Modern Enterprises
            </h2>
            <p className="m-0 max-w-[475px] text-base text-[#595959] [font-family:Inter,sans-serif]">
              Managing people is complex.
            </p>
            <p className="m-0 max-w-[475px] text-base text-[#595959] [font-family:Inter,sans-serif]">
              Orgatry makes it simple.
            </p>
            <p className="m-0 max-w-[475px] text-base text-[#595959] [font-family:Inter,sans-serif]">
              Manage your entire workforce on a single platform with our smart, secure HR solutions.
            </p>
          </div>
          <FeatureList fluid />
        </motion.div>

        <motion.div
          /* Controls the image size dynamically:
            - Caps maximum size on tablets/small laptops (max-w-[400px] / max-w-[45%])
            - Scales up safely on mobile viewports (max-w-[576px])
          */
          className="mx-auto w-full max-w-[440px] lg:max-w-[42%] xl:max-w-[48%] shrink-0"
          variants={revealFromRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="relative aspect-[576/717] w-full">
            <img
              src={aboutPhoneMockup}
              alt="Orgatry mobile app showing payroll summary, send and receive actions, and recent transactions"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-contain object-top"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}