import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { introConfig } from '@/components/intro/introConfig';
import type { DomRectLite } from '@/components/intro/types';
import { measureElement } from '@/components/intro/utils';

type LoaderProps = {
  /**
   * Fired AFTER the full hold (3200ms) + fade (600ms) complete,
   * with the logo rect measured at the end of the hold (while still visible).
   */
  onComplete: (rect: DomRectLite) => void;
  /** Fired after the backdrop has fully faded out (same moment as onComplete). */
  onExited?: () => void;
};

/**
 * Fullscreen brand loader.
 * Hold 3200ms → fade 600ms → then hand off. FlyingLogo must not start before this finishes.
 */
export function Loader({ onComplete, onExited }: LoaderProps) {
  const logoRef = useRef<HTMLImageElement>(null);
  const measuredRect = useRef<DomRectLite | null>(null);
  const [visible, setVisible] = useState(true);
  const startedFade = useRef(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const holdTimer = window.setTimeout(() => {
      if (startedFade.current) return;
      startedFade.current = true;

      const size = introConfig.loaderLogoSize;
      measuredRect.current = measureElement(logoRef.current) ?? {
        left: (window.innerWidth - size) / 2,
        top: (window.innerHeight - size) / 2,
        width: size,
        height: size
      };

      // Begin fade — logo stays visible while the whole overlay fades out
      setVisible(false);
    }, introConfig.loaderDuration);

    return () => {
      window.clearTimeout(holdTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const size = introConfig.loaderLogoSize;

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = '';
        const rect = measuredRect.current;
        if (rect) {
          onComplete(rect);
        }
        onExited?.();
      }}
    >
      {visible ? (
        <motion.div
          key="intro-loader"
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: introConfig.loaderFadeDuration / 1000,
              ease: 'easeInOut'
            }
          }}
          aria-busy="true"
          aria-label="Loading"
          role="status"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute rounded-full"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              width: size * 2.6,
              height: size * 2.6,
              background: `radial-gradient(circle, ${introConfig.glowColor} 0%, transparent 70%)`,
              filter: 'blur(28px)'
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-5">
            <motion.img
              ref={logoRef}
              src={introConfig.brandLogo}
              alt=""
              width={size}
              height={size}
              className="object-contain"
              style={{ width: size, height: size }}
              initial={{ scale: 3.5, opacity: 0, filter: 'blur(18px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              decoding="async"
              draggable={false}
            />

            {/* Shimmer outside the logo scale so it always sweeps at full size */}
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
                    'linear-gradient(90deg, transparent, rgba(34,197,94,0.9), rgba(21,128,61,1), transparent)'
                }}
                initial={{ x: '-120%' }}
                animate={{ x: '220%' }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
