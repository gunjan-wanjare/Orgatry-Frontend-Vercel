import { motion } from 'framer-motion';
import yakaMark from '@/modules/landing/assets/illustrations/yaka-mark.svg';
import { splashLoadingBar, splashMark } from '@/modules/landing/constants/splashVisual';
import '@/modules/landing/styles/landing-fonts.css';

/**
 * Suspense fallback for `/` — matches the white Orgatry splash so the
 * dark PageSkeleton / app chrome never flash before LandingPage mounts.
 */
export function LandingRouteFallback() {
  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white"
      role="status"
      aria-live="polite"
      aria-label="Loading Orgatry"
      style={{ background: '#ffffff' }}
    >
      <div className="flex flex-col items-center" style={{ gap: splashMark.gap }}>
        <img
          src={yakaMark}
          alt="YAKA Enterprise"
          width={splashMark.maxW}
          height={splashMark.maxH}
          className="block object-contain"
          style={{ width: splashMark.width, height: splashMark.height }}
          decoding="async"
          fetchPriority="high"
        />
        <p
          className="m-0 whitespace-nowrap text-center leading-none text-[#168540] [font-family:Inter,sans-serif]"
          style={{ fontSize: splashMark.captionSize }}
        >
          A YAKA Enterprise
        </p>
      </div>

      <div
        className="absolute bottom-[22%] left-1/2 -translate-x-1/2"
        style={{ width: splashLoadingBar.width }}
        aria-hidden
      >
        <div
          className="w-full overflow-hidden rounded-full bg-[#e8e8ea]"
          style={{ height: splashLoadingBar.height }}
        >
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#22c55e] to-[#15803d]"
            initial={{ x: '-100%', opacity: 0.55 }}
            animate={{ x: ['-100%', '300%'], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.35, ease: 'easeInOut', repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}
