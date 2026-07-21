import { motion } from 'framer-motion';
import { introConfig } from '@/components/intro';
import '@/modules/landing/styles/landing-fonts.css';

/**
 * Suspense fallback for public landing routes — white shell matching the intro loader
 * so the dark app PageSkeleton never flashes before the page mounts.
 */
export function LandingRouteFallback() {
  const size = introConfig.loaderLogoSize;

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white"
      role="status"
      aria-live="polite"
      aria-label="Loading Orgatry"
    >
      <div className="relative z-10 flex flex-col items-center gap-5">
        <img
          src={introConfig.brandLogo}
          alt="YAKA"
          width={size}
          height={size}
          className="object-contain"
          style={{ width: size, height: size }}
          decoding="async"
          fetchPriority="high"
        />

        <div
          className="overflow-hidden rounded-full bg-[#e8e8ea]"
          style={{ width: 80, height: 2 }}
          aria-hidden
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              width: '40%',
              background:
                'linear-gradient(90deg, transparent, rgba(34,197,94,0.85), rgba(21,128,61,0.95), transparent)'
            }}
            animate={{ x: ['-120%', '220%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
}
