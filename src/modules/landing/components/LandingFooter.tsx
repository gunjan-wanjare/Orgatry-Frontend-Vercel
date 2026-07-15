import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/modules/landing/animations/landingMotion';
import {
  landingFooter,
  landingFooterColumns,
} from '@/modules/landing/constants/content';
import { scrollToSectionId } from '@/modules/landing/hooks/useSmoothScroll';



const FOOTER_OVERLAP = 298;
const CONTENT_PAD_TOP = 392;
const CONTENT_PAD_BOTTOM = 48;
const CONTENT_WIDTH = 1240;
const LINK_COLUMNS_GAP = 110;
const ROW_GAP = 200;
const SECTION_STACK_GAP = 28;
const BORDER_COLOR = 'rgba(23,23,23,0.08)';

function handleNavClick(href: string) {
  if (href.startsWith('#')) {
    const id = href.slice(1);
    if (id) scrollToSectionId(id);
  }
}

function NewsletterBlock() {


  return (
    <div className="flex w-full max-w-[439px] flex-col gap-5">
      <div className="flex w-full max-w-[402px] flex-col gap-6">
        <p className="text-[36px] font-bold leading-8 tracking-[-0.6px] text-[#15803d] [font-family:Inter,sans-serif]">
          {landingFooter.brand}
        </p>
        <p className="text-[#15803d] text-sm">A <span className="font-bold">YAKA</span> Brand</p>
        
      </div>

      <div className="flex w-full flex-col gap-3.5">


        <p className="text-[11px] font-normal leading-normal text-[#595959] [font-family:Inter,sans-serif]">
          {landingFooter.privacyPrefix}
          <a
            href={landingFooter.privacyHref}
            className="font-medium text-[#171717] underline decoration-solid underline-offset-from-font [font-family:Inter,sans-serif] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/40"
          >
            {landingFooter.privacyLabel}
          </a>
        </p>
      </div>
    </div>
  );
}

function FooterLinkColumns() {
  return (
    <nav
      aria-label="Footer"
      className="flex w-full flex-wrap gap-x-[110px] gap-y-8 lg:max-w-[565px] lg:flex-nowrap lg:justify-between"
      style={{ columnGap: LINK_COLUMNS_GAP }}
    >
      {landingFooterColumns.map((column) => (
        <div key={column.id} className="flex min-w-[88px] flex-col gap-3.5">
          <p className="text-[15px] font-bold text-[#171717] [font-family:Manrope,sans-serif]">
            {column.title}
          </p>
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
            {column.links.map((link) => (
              <li key={`${column.id}-${link.label}`}>
                <a
                  href={link.href}
                  onClick={(event) => {
                    if (link.href.startsWith('#')) {
                      event.preventDefault();
                      handleNavClick(link.href);
                    }
                  }}
                  className="text-sm font-normal text-[#595959] transition-colors [font-family:Inter,sans-serif] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]/40"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}



export function LandingFooter() {
  return (
    <footer
      className="relative bg-[#f0f0f2]"
      style={{
        marginTop: -FOOTER_OVERLAP,
        paddingTop: CONTENT_PAD_TOP,
        paddingBottom: CONTENT_PAD_BOTTOM
      }}
    >
      <motion.div
        className="relative z-0 mx-auto w-full max-w-[1240px] px-6 lg:px-0"
        style={{ maxWidth: CONTENT_WIDTH }}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex flex-col" style={{ gap: SECTION_STACK_GAP }}>
          <motion.div
            className="flex flex-col gap-10 border-b-[1.5px] pb-9 lg:flex-row lg:items-start"
            style={{
              borderColor: BORDER_COLOR,
              columnGap: ROW_GAP
            }}
            variants={fadeInUp}
          >
            <NewsletterBlock />
            <FooterLinkColumns />
          </motion.div>

          <motion.div
            className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center"
            variants={fadeInUp}
          >
            <p className="text-[13px] font-normal text-[#595959] [font-family:Inter,sans-serif]">
              {landingFooter.copyright}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}

/** Exported for layout docs / LandingPage gap coordination. */
export const landingFooterOverlapPx = FOOTER_OVERLAP;
