import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import yakaMark from '@/modules/landing/assets/illustrations/yaka-mark.svg';
import '@/modules/landing/styles/landing-fonts.css';
import '@/modules/auth/auth-shell.css';

type AuthLayoutProps = {
  children: ReactNode;
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

/**
 * Auth shell — pure white Orgatry branding aligned with the landing page.
 * No dark gradients / glass / cyan accents.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="orgatry-auth grid min-h-screen overflow-x-hidden bg-white text-[#171717] lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand panel — desktop */}
      <section className="relative hidden overflow-hidden border-r border-[#ececee] bg-[#fafafa] p-10 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 size-[420px] rounded-full opacity-50 blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-0 size-[360px] rounded-full opacity-40 blur-[90px]"
          style={{ background: 'radial-gradient(circle, rgba(21,128,61,0.16) 0%, transparent 70%)' }}
        />

        <motion.div className="relative z-10" variants={fadeIn} initial="hidden" animate="visible">
          <Link to="/" className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/45 focus-visible:ring-offset-2">
            <img src={yakaMark} alt="" width={40} height={36} className="h-9 w-10 object-contain" decoding="async" aria-hidden />
            <span className="text-[32px] font-bold leading-8 tracking-[-0.6px] text-[#15803d] [font-family:Inter,sans-serif]">
              Orgatry
            </span>
          </Link>
        </motion.div>

        <motion.div
          className="relative z-10 max-w-lg"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#15803d] [font-family:Manrope,sans-serif]">
            Smart HRMS
          </p>
          <h1 className="m-0 text-[clamp(2rem,3.2vw,2.75rem)] font-bold leading-[1.2] text-[#171717] [font-family:Manrope,sans-serif]">
            Simplifying HR for a modern workplace
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[#595959] [font-family:Inter,sans-serif]">
            Sign in to manage attendance, leave, payroll, and people operations — built for growing Indian
            organizations.
          </p>
          <ul className="mt-8 grid gap-3">
            {['Centralized employee records', 'Leave & attendance in one place', 'Secure role-based access'].map(
              (item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-[#e8e8ea] bg-white px-4 py-3 text-sm text-[#171717] [font-family:Inter,sans-serif]"
                >
                  <span className="inline-flex size-2 shrink-0 rounded-full bg-gradient-to-r from-[#22c55e] to-[#15803d]" aria-hidden />
                  {item}
                </li>
              )
            )}
          </ul>
        </motion.div>

        <p className="relative z-10 text-xs text-[#8b8b8b] [font-family:Inter,sans-serif]">
          A YAKA Brand product
        </p>
      </section>

      {/* Form column */}
      <section className="relative grid place-items-center bg-white px-5 py-10 sm:px-8">
        <div className="mb-8 flex w-full max-w-[420px] items-center justify-center lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/45"
          >
            <img src={yakaMark} alt="" width={32} height={29} className="h-8 w-9 object-contain" decoding="async" aria-hidden />
            <span className="text-[28px] font-bold tracking-[-0.6px] text-[#15803d] [font-family:Inter,sans-serif]">
              Orgatry
            </span>
          </Link>
        </div>
        <div className="w-full max-w-[420px]">{children}</div>
      </section>
    </main>
  );
}
