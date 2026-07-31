import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import darkLogo from '@/assets/orgatry_dark_logo.png';
import { fadeInUp, staggerContainer } from '@/modules/landing/animations/landingMotion';
import {
  landingFooter,
  landingFooterColumns,
} from '@/modules/landing/constants/content';
import { ctaButtonStyle } from '@/modules/landing/constants/ctaButton';
import { scrollToSectionId } from '@/modules/landing/hooks/useSmoothScroll';
import { fluid } from '@/modules/landing/utils/scale';

const FOOTER_OVERLAP = 0;
const CONTENT_PAD_TOP = 40;
const CONTENT_PAD_BOTTOM = 0;
const CONTENT_WIDTH = 1240;
const STANDALONE_PAD_TOP = 72;
const BOTTOM_BAR_HEIGHT = 16;

const TAGLINE_SIZE = fluid(14, 16);
const HEADLINE_SIZE = fluid(20, 28);
const COLUMN_TITLE_SIZE = fluid(15, 18);
const LINK_SIZE = fluid(14, 15.5);
const COPYRIGHT_SIZE = fluid(12.5, 13.5);
const EMAIL_INPUT_TEXT_SIZE = fluid(14, 16);

function handleNavClick(href: string) {
  if (href.startsWith('/#')) {
    const id = href.slice(2);
    if (id) scrollToSectionId(id);
    return;
  }

  if (href.startsWith('#')) {
    const id = href.slice(1);
    if (id) scrollToSectionId(id);
  }
}

function NewsletterBlock() {
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-4">
      <img src={darkLogo} alt="Orgatry" className="h-10 w-[160px]" loading="lazy" />
      <p
        className="m-0 text-[#040505] [font-family:Jost,sans-serif]"
        style={{ fontSize: TAGLINE_SIZE }}
      >
        {landingFooter.tagline}
      </p>
      <p
        className="m-0 font-bold text-[#000d00] capitalize [font-family:Sora,sans-serif]"
        style={{ fontSize: HEADLINE_SIZE, lineHeight: 1.3 }}
      >
        {landingFooter.headline.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}

function FooterLinkColumns() {
  const location = useLocation();
  const isOnLanding = location.pathname === '/';

  return (
    <nav
      aria-label="Footer"
      className="flex w-full flex-wrap items-start justify-between gap-x-10 gap-y-8 lg:max-w-[589px] lg:flex-nowrap"
    >
      {landingFooterColumns.map((column) => (
        <div key={column.id} className="flex min-w-[88px] flex-col gap-4">
          <p
            className="m-0 font-medium text-black [font-family:Jost,sans-serif]"
            style={{ fontSize: COLUMN_TITLE_SIZE }}
          >
            {column.title}
          </p>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {column.links.map((link) => {
              const isHash =
                link.href.startsWith('#') || link.href.startsWith('/#');

              return (
                <li key={`${column.id}-${link.label}`}>
                  <a
                    href={link.href}
                    {...(link.openInNewTab
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    onClick={(event) => {
                      if (isHash && isOnLanding) {
                        event.preventDefault();
                        handleNavClick(link.href);
                      }
                    }}
                    className="font-normal text-[rgba(4,5,5,0.8)] transition-colors [font-family:Jost,sans-serif] hover:text-[#000d00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/40"
                    style={{ fontSize: LINK_SIZE }}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NewsletterForm() {
  return (
    <form
      className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
      onSubmit={(event) => event.preventDefault()}
    >
      <div
        className="flex items-center gap-2.5 rounded-[10px] border border-[rgba(4,5,5,0.24)]"
        style={{ paddingInline: fluid(16, 24), paddingBlock: fluid(10, 14), width: 'min(360px, 100%)' }}
      >
        <Mail className="size-5 shrink-0 text-[rgba(4,5,5,0.8)]" aria-hidden />
        <input
          type="email"
          name="email"
          placeholder={landingFooter.emailPlaceholder}
          aria-label={landingFooter.emailPlaceholder}
          className="w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[rgba(4,5,5,0.8)] outline-none [font-family:Jost,sans-serif] placeholder:text-[rgba(4,5,5,0.8)]"
          style={{ fontSize: EMAIL_INPUT_TEXT_SIZE }}
        />
      </div>
      <button
        type="submit"
        style={ctaButtonStyle}
        className="h-auto shrink-0 rounded-[12px] bg-[#15803d] uppercase text-white shadow-none [font-family:Jost,sans-serif] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/50 focus-visible:ring-offset-2"
      >
        {landingFooter.subscribeButton}
      </button>
    </form>
  );
}

type LandingFooterProps = {
  /** When true (default), footer overlaps the contact panel as on the homepage. */
  withContactOverlap?: boolean;
};

export function LandingFooter({ withContactOverlap = true }: LandingFooterProps) {
  return (
    <footer
      className="relative bg-white"
      style={{
        marginTop: withContactOverlap ? -FOOTER_OVERLAP : 0,
        paddingTop: withContactOverlap ? CONTENT_PAD_TOP : STANDALONE_PAD_TOP,
        paddingBottom: CONTENT_PAD_BOTTOM + BOTTOM_BAR_HEIGHT
      }}
    >
      <motion.div
        className="relative z-0 mx-auto w-full px-6 lg:px-0"
        style={{ maxWidth: CONTENT_WIDTH }}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex flex-col" style={{ gap: fluid(40, 60) }}>
          <motion.div
            className="flex flex-col items-start gap-10 lg:flex-row lg:justify-between"
            variants={fadeInUp}
          >
            <NewsletterBlock />
            <FooterLinkColumns />
          </motion.div>

          <motion.div
            className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"
            variants={fadeInUp}
            style={{ paddingBottom: fluid(20, 28) }}
          >
            <p
              className="m-0 font-normal text-[rgba(4,5,5,0.8)] [font-family:Inter,sans-serif]"
              style={{ fontSize: COPYRIGHT_SIZE }}
            >
              {landingFooter.copyright}
            </p>
            <NewsletterForm />
          </motion.div>
        </div>
      </motion.div>

      <div aria-hidden className="absolute inset-x-0 bottom-0 bg-[#15803d]" style={{ height: BOTTOM_BAR_HEIGHT }} />
    </footer>
  );
}

/** Exported for layout docs / LandingPage gap coordination. */
export const landingFooterOverlapPx = FOOTER_OVERLAP;
