import { AnimatePresence, motion } from 'framer-motion';
import { splashLoadingBar, splashMark } from '@/modules/landing/constants/splashVisual';
import { YakaMarkMotion } from '@/modules/landing/shared/YakaMarkMotion';
import { useLandingExperience } from '@/modules/landing/hooks/useLandingExperience';
import { landingTokens } from '@/modules/landing/constants/tokens';

/**
 * Full-screen white splash overlay + centered YAKA (shared layoutId).
 * Landing content renders underneath; overlay hides it for ~5s.
 */
export function LandingSplash() {
  const { splashActive, yakaSlot, reduceMotion } = useLandingExperience();

  if (reduceMotion) return null;

  return (
    <>
      {/* YAKA lives outside the fading panel so layoutId can travel to hero */}
      {yakaSlot === 'splash' ? (
        <div className="pointer-events-none fixed inset-0 z-[99999] flex items-center justify-center">
          <YakaMarkMotion size="splash" showCaption />
        </div>
      ) : null}

      <AnimatePresence>
        {splashActive ? (
          <motion.div
            key="landing-splash"
            className="fixed inset-0 z-[99998] flex flex-col items-center justify-center bg-white"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: {
                duration: landingTokens.motion.durationSlow,
                ease: landingTokens.motion.easeOut,
                delay: 0.12
              }
            }}
            aria-busy="true"
            aria-label="Loading Orgatry"
            role="status"
          >
            <div
              aria-hidden
              style={{ width: splashMark.spacerW, height: splashMark.spacerH }}
            />

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
                  transition={{
                    duration: 1.35,
                    ease: 'easeInOut',
                    repeat: Infinity
                  }}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
