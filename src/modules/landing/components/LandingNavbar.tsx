import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navbarFadeIn } from '@/modules/landing/animations/landingMotion';
import { landingNavItems, landingNavSectionIds } from '@/modules/landing/constants/navigation';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { useActiveSection } from '@/modules/landing/hooks/useActiveSection';
import { useLandingExperience } from '@/modules/landing/hooks/useLandingExperience';
import { useSmoothScroll } from '@/modules/landing/hooks/useSmoothScroll';
import { LandingButton } from '@/modules/landing/shared/LandingButton';
import { YakaMarkMotion } from '@/modules/landing/shared/YakaMarkMotion';
import { cn } from '@/lib/utils';

const NAVBAR_WIDTH = landingTokens.contentWidth;
const NAVBAR_HEIGHT = landingTokens.navbarHeight;
const NAVBAR_TOP = landingTokens.navbarTop;
const NAVBAR_PAD_Y = 12;
const NAVBAR_PAD_X = 30;
const NAV_LINK_GAP = 50;

const NAV_PILL_STYLE = {
  backgroundColor: '#171717',
  backgroundImage:
    'radial-gradient(ellipse 280px 60px at 23% 70%, rgba(33,192,92,0.1) 0%, rgba(22,135,64,0) 100%)'
} as const;

function OrgatryLogo({ onNavigate }: { onNavigate: () => void }) {
  return (
    <button
      type="button"
      onClick={onNavigate}
      className="shrink-0 text-left text-[clamp(28px,4vw,36px)] font-bold leading-8 tracking-[-0.6px] text-white [font-family:Inter,sans-serif] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717]"
      aria-label="Orgatry home"
    >
      Orgatry
    </button>
  );
}

function LandingNavbarComponent() {
  const menuId = useId();
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLgNav, setIsLgNav] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isOnLanding = location.pathname === '/';
  const activeId = useActiveSection({
    sectionIds: isOnLanding ? landingNavSectionIds : []
  });
  const { scrollToSection } = useSmoothScroll();
  const { introReady, yakaSlot } = useLandingExperience();
  const showNavYaka = yakaSlot === 'nav';

  const handleNavigate = useCallback(
    (sectionId: string) => {
      if (!isOnLanding) {
        navigate(
          sectionId === 'home'
            ? { pathname: '/' }
            : { pathname: '/', hash: sectionId }
        );
        setMobileOpen(false);
        return;
      }
      scrollToSection(sectionId);
      setMobileOpen(false);
    },
    [isOnLanding, navigate, scrollToSection]
  );

  const handleHome = useCallback(() => {
    handleNavigate('home');
  }, [handleNavigate]);

  const handleContact = useCallback(() => {
    handleNavigate('contact');
  }, [handleNavigate]);

  const onNavItemClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const sectionId = event.currentTarget.dataset.sectionId;
      if (sectionId) {
        handleNavigate(sectionId);
      }
    },
    [handleNavigate]
  );

  const toggleMobile = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstFocusable = menuPanelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        menuToggleRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => {
      const matches = mq.matches;
      setIsLgNav(matches);
      if (matches) setMobileOpen(false);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const onMenuKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !menuPanelRef.current) return;
    const focusables = Array.from(
      menuPanelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
      variants={navbarFadeIn}
      initial="hidden"
      animate={introReady ? 'visible' : 'hidden'}
    >
      <div
        className={cn(
          'relative mx-auto hidden w-full max-w-[1440px] lg:block',
          introReady ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        style={{ height: NAVBAR_TOP + NAVBAR_HEIGHT }}
      >
        <nav
          aria-label="Primary"
          className="absolute left-1/2 flex -translate-x-1/2 items-center justify-between"
          style={{
            top: NAVBAR_TOP,
            width: `min(${NAVBAR_WIDTH}px, calc(100% - 48px))`,
            height: NAVBAR_HEIGHT,
            paddingTop: NAVBAR_PAD_Y,
            paddingBottom: NAVBAR_PAD_Y,
            paddingLeft: NAVBAR_PAD_X,
            paddingRight: NAVBAR_PAD_X,
            borderRadius: landingTokens.radiusPill,
            ...NAV_PILL_STYLE
          }}
        >
          <OrgatryLogo onNavigate={handleHome} />

          <ul className="m-0 flex list-none items-center p-0" style={{ gap: NAV_LINK_GAP }}>
            {landingNavItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    data-section-id={item.id}
                    onClick={onNavItemClick}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'text-base font-normal leading-normal text-white transition-opacity duration-200 [font-family:Inter,sans-serif] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717]',
                      isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-3">
            <motion.div layout className="shrink-0">
              <LandingButton
                variant="primary"
                onClick={handleContact}
                className="w-[150px] shrink-0"
                aria-label="Get In Touch"
              >
                Get In Touch
              </LandingButton>
            </motion.div>
            {showNavYaka && isLgNav ? <YakaMarkMotion size="nav" /> : null}
          </div>
        </nav>
      </div>

      {/* Tablet / Mobile — hamburger until lg (avoids cramped 5-link mid breakpoints) */}
      <div
        className={cn(
          'mx-auto w-full max-w-[1440px] px-4 pt-4 lg:hidden',
          introReady ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <nav
          aria-label="Primary"
          className="flex items-center justify-between rounded-[100px] px-4 py-3"
          style={{
            minHeight: 56,
            backgroundColor: NAV_PILL_STYLE.backgroundColor,
            backgroundImage:
              'radial-gradient(ellipse 200px 48px at 20% 70%, rgba(33,192,92,0.1) 0%, rgba(22,135,64,0) 100%)'
          }}
        >
          <OrgatryLogo onNavigate={handleHome} />

          <div className="flex items-center gap-2">
            <LandingButton
              variant="primary"
              onClick={handleContact}
              className="hidden h-10 px-5 text-sm sm:inline-flex"
              aria-label="Get In Touch"
            >
              Get In Touch
            </LandingButton>

            {showNavYaka && !isLgNav ? <YakaMarkMotion size="nav" /> : null}

            <button
              ref={menuToggleRef}
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/50"
              aria-expanded={mobileOpen}
              aria-controls={menuId}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={toggleMobile}
            >
              {mobileOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </nav>

        <AnimatePresence initial={false}>
          {mobileOpen ? (
            <motion.div
              id={menuId}
              key="mobile-menu"
              ref={menuPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: landingTokens.motion.durationBase, ease: landingTokens.motion.easeOut }}
              className="mt-2 overflow-hidden rounded-[24px] bg-[#171717]"
              onKeyDown={onMenuKeyDown}
            >
              <ul className="flex flex-col gap-1 p-3">
                {landingNavItems.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        data-section-id={item.id}
                        onClick={onNavItemClick}
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(
                          'w-full rounded-xl px-4 py-3 text-left text-base text-white transition-opacity [font-family:Inter,sans-serif] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/50',
                          isActive ? 'bg-white/10 opacity-100' : 'opacity-80 hover:opacity-100'
                        )}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
                <li className="pt-2">
                  <LandingButton variant="primary" onClick={handleContact} className="w-full">
                    Get In Touch
                  </LandingButton>
                </li>
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

export const LandingNavbar = memo(LandingNavbarComponent);
