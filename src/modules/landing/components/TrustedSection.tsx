import { motion } from 'framer-motion';
import { memo } from 'react';
import adobeLogo from '@/modules/landing/assets/logos/adobe.svg';
import framerLogo from '@/modules/landing/assets/logos/framer.png';
import googleLogo from '@/modules/landing/assets/logos/google.svg';
import microsoftLogo from '@/modules/landing/assets/logos/microsoft.svg';
import openaiLogo from '@/modules/landing/assets/logos/openai.png';
import siemensLogo from '@/modules/landing/assets/logos/siemens.png';
import slackLogo from '@/modules/landing/assets/logos/slack.svg';
import teslaLogo from '@/modules/landing/assets/logos/tesla.png';
import walmartLogo from '@/modules/landing/assets/logos/walmart.svg';
import { fadeIn, fadeInUp } from '@/modules/landing/animations/landingMotion';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { vs } from '@/modules/landing/utils/scale';
import { cn } from '@/lib/utils';

/** Figma `1:1225` — pad `0 230`, gap `10`, height `271`. */
const SECTION_PAD_X = landingTokens.trustedSidePadding;
const LOGO_SIZE = vs(140);
const LOGO_GAP = vs(70);
/** Frame `1:1227` vertical itemSpacing (negative overlap). */
const ROW_OVERLAP = -52;

type LogoItem = {
  id: string;
  name: string;
  src: string;
};

const ROW_ONE: LogoItem[] = [
  { id: '1:1229', name: 'Google', src: googleLogo },
  { id: '1:1236', name: 'Siemens', src: siemensLogo },
  { id: '1:1239', name: 'Microsoft', src: microsoftLogo },
  { id: '1:1245', name: 'Slack', src: slackLogo },
  { id: '1:1255', name: 'Tesla', src: teslaLogo }
];

const ROW_TWO: LogoItem[] = [
  { id: '1:1261', name: 'Walmart', src: walmartLogo },
  { id: '1:1265', name: 'Adobe', src: adobeLogo },
  { id: '1:1269', name: 'Framer', src: framerLogo },
  { id: '1:1281', name: 'OpenAI', src: openaiLogo }
];

const LogoMark = memo(function LogoMark({ name, src }: { name: string; src: string }) {
  return (
    <div className="relative size-[140px] shrink-0 overflow-hidden" style={{ width: LOGO_SIZE, height: LOGO_SIZE }}>
      <img
        src={src}
        alt={`${name} logo`}
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full max-w-none object-contain"
      />
    </div>
  );
});

function LogoRow({ logos, className }: { logos: LogoItem[]; className?: string }) {
  return (
    <div
      className={cn('flex flex-wrap items-center justify-center', className)}
      style={{ gap: LOGO_GAP }}
    >
      {logos.map((logo) => (
        <LogoMark key={logo.id} name={logo.name} src={logo.src} />
      ))}
    </div>
  );
}

/**
 * Trusted Companies — Figma `1:1225`.
 * Title Manrope Medium 24 / “50+” SemiBold · logo cells 140 · gap 70 · row overlap −52.
 */
export function TrustedSection() {
  return (
    <motion.section
      aria-labelledby="trusted-heading"
      data-node-id="1:1225"
      className="relative bg-white"
      style={{
        marginTop: landingTokens.sectionGapLg,
        minHeight: landingTokens.trustedHeight
      }}
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
    >
      <div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-center"
        style={{
          paddingInline: `clamp(1.5rem, 8vw, ${SECTION_PAD_X}px)`,
          gap: 10
        }}
      >
        <motion.h2
          id="trusted-heading"
          variants={fadeInUp}
          className="m-0 text-center text-2xl leading-normal font-medium text-[#171717] [font-family:Manrope,sans-serif]"
          data-node-id="1:1226"
        >
          Trusted by Over <span className="font-semibold">50+</span> Industry Leaders
        </motion.h2>

        <motion.div
          variants={fadeInUp}
          className="flex w-full max-w-[980px] flex-col items-center"
          data-node-id="1:1227"
          style={{ marginBottom: 0 }}
        >
          {/* Desktop: exact two-row overlap layout */}
          <div className="hidden w-full flex-col items-center min-[1100px]:flex" style={{ gap: ROW_OVERLAP }}>
            <LogoRow logos={ROW_ONE} />
            <LogoRow logos={ROW_TWO} />
          </div>

          {/* Tablet / mobile: responsive grid, same assets & size scale */}
          <div className="grid w-full grid-cols-2 place-items-center gap-x-8 gap-y-2 sm:grid-cols-3 md:grid-cols-4 min-[1100px]:hidden">
            {[...ROW_ONE, ...ROW_TWO].map((logo) => (
              <div key={logo.id} className="flex size-[min(140px,28vw)] items-center justify-center">
                <img
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  width={LOGO_SIZE}
                  height={LOGO_SIZE}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full max-w-[140px] object-contain"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
