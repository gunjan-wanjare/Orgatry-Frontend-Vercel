import { motion } from 'framer-motion';
import { heroItem, heroStagger } from '@/modules/landing/animations/landingMotion';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { LandingContainer } from '@/modules/landing/shared/LandingContainer';
import { SectionBadge } from '@/modules/landing/shared/SectionBadge';
import { cn } from '@/lib/utils';

type LegalHeroProps = {
  badge: string;
  title: string;
  subtitle: string;
};

function LegalBadge({ label }: { label: string }) {
  return (
    <SectionBadge
      className={cn(
        'h-[34px] min-w-[88px] justify-center rounded-[50px] border border-[#008435] px-4',
        'bg-[rgba(34,197,94,0.2)] text-base font-bold text-[#026229] [font-family:Manrope,sans-serif]'
      )}
    >
      {label}
    </SectionBadge>
  );
}

/** Clean legal-page hero — same badge / type language as landing sections. */
export function LegalHero({ badge, title, subtitle }: LegalHeroProps) {
  return (
    <section
      aria-labelledby="legal-hero-heading"
      className="relative overflow-hidden bg-white"
      style={{
        paddingTop: landingTokens.navbarTop + landingTokens.navbarHeight + 72,
        paddingBottom: 56
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(34,197,94,0.14),transparent_60%)]"
      />

      <LandingContainer className="relative z-10">
        <motion.div
          className="mx-auto flex max-w-[760px] flex-col items-center text-center"
          variants={heroStagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={heroItem}>
            <LegalBadge label={badge} />
          </motion.div>
          <motion.h1
            id="legal-hero-heading"
            variants={heroItem}
            className="m-0 mt-5 text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-[-0.04em] text-[#171717] [font-family:Inter,sans-serif]"
          >
            {title}
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="m-0 mt-4 max-w-[560px] text-base leading-7 text-[#595959] [font-family:Inter,sans-serif] md:text-lg md:leading-8"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </LandingContainer>
    </section>
  );
}
