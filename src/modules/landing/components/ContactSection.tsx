import { motion } from 'framer-motion';
import { type FormEvent, useId } from 'react';
import {
  fadeInUp,
  revealFromLeft,
  staggerContainer
} from '@/modules/landing/animations/landingMotion';
import {
  landingContact,
  landingContactInfo
} from '@/modules/landing/constants/content';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { LandingButton } from '@/modules/landing/shared/LandingButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * Contact — Figma `1:1626` inside Footer frame `1:1564`.
 * Panel `1240×483`, radius `40`, fill `#171717`.
 * Gap Testimonials→this frame: `25` (applied on LandingPage wrapper).
 */

const PANEL_RADIUS = landingTokens.radiusPanel;
const ICON_TILE = 52;
const ICON_GLYPH = 31;
const ICON_RADIUS = 9.75;
const FORM_WIDTH = 354.945;
const FIELD_GAP = 16.433;
const LABEL_GAP = 6.573;
const INPUT_H = 39.438;
const INPUT_PAD = 16.433;
const INPUT_RADIUS = 32.865;
const MESSAGE_H = 164.326;
const MESSAGE_RADIUS = 16.433;
const LABEL_FS = 11.503;

const fieldClassName = cn(
  'h-[39.438px] w-full border-0 bg-[#f5f5f5] p-[16.433px] text-[11.503px] leading-normal',
  'rounded-[32.865px] text-[#171717] shadow-none [font-family:Montserrat,sans-serif]',
  'placeholder:text-[#6d6d6d] focus:border-transparent focus:ring-2 focus:ring-[#22c55e]/45',
  'transition-[box-shadow,background-color] duration-200'
);

const messageClassName = cn(
  'min-h-[164.326px] h-[164.326px] w-full resize-none border-0 bg-[#f5f5f5] p-[16.433px]',
  'rounded-[16.433px] text-[11.503px] leading-normal text-[#171717] shadow-none',
  '[font-family:Montserrat,sans-serif] placeholder:text-[#6d6d6d]',
  'focus:border-transparent focus:ring-2 focus:ring-[#22c55e]/45',
  'transition-[box-shadow,background-color] duration-200'
);

function ContactGridBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px] opacity-60"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(208,213,221,0.32) 1px, transparent 1px),
            linear-gradient(90deg, rgba(208,213,221,0.32) 1px, transparent 1px)
          `,
          backgroundSize: '96px 96px'
        }}
      />
      <div
        className="absolute -left-[10%] top-[-20%] size-[420px] rounded-full opacity-40 blur-[90px]"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.55) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -right-[5%] bottom-[-30%] size-[480px] rounded-full opacity-35 blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(1,247,88,0.35) 0%, transparent 70%)' }}
      />
    </div>
  );
}

function ContactInfoList() {
  return (
    <ul className="mt-[52px] flex list-none flex-col gap-[21px] p-0" aria-label="Contact information">
      {landingContactInfo.map((item) => {
        const content = item.multiline ? (
          <span className="whitespace-pre-line">{item.value}</span>
        ) : (
          item.value
        );

        const text = (
          <span className="font-medium leading-[1.24] text-[clamp(14px,1.6vw,16px)] text-white [font-family:Manrope,sans-serif]">
            {content}
          </span>
        );

        return (
          <li key={item.id} className="flex items-center gap-[29px]">
            <span
              className="inline-flex shrink-0 items-center justify-center bg-[#434440]"
              style={{
                width: ICON_TILE,
                height: ICON_TILE,
                borderRadius: ICON_RADIUS
              }}
              aria-hidden
            >
              <img
                src={item.iconSrc}
                alt=""
                width={ICON_GLYPH}
                height={ICON_GLYPH}
                className="size-[31px] object-contain"
                decoding="async"
              />
            </span>
            {item.href ? (
              <a
                href={item.href}
                className="inline-flex min-h-[52px] items-center transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01f758]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717]"
              >
                {text}
              </a>
            ) : (
              text
            )}
            <span className="sr-only">{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Contact form — Figma `1:1977`. UI only; no API.
 * Field sizes match the scaled instance in the design file (fractional px).
 */
function ContactForm() {
  const formId = useId();
  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const messageId = `${formId}-message`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-[16.433px]"
      style={{ maxWidth: FORM_WIDTH }}
      aria-labelledby={`${formId}-title`}
    >
      <span id={`${formId}-title`} className="sr-only">
        Contact form
      </span>

      <div className="flex flex-col" style={{ gap: FIELD_GAP }}>
        <div className="flex flex-col" style={{ gap: LABEL_GAP }}>
          <Label
            htmlFor={nameId}
            className="font-medium leading-normal text-white [font-family:Montserrat,sans-serif]"
            style={{ fontSize: LABEL_FS }}
          >
            {landingContact.fields.name.label}
          </Label>
          <Input
            id={nameId}
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder={landingContact.fields.name.placeholder}
            className={fieldClassName}
            style={{ height: INPUT_H, padding: INPUT_PAD, borderRadius: INPUT_RADIUS }}
          />
        </div>

        <div className="flex flex-col" style={{ gap: LABEL_GAP }}>
          <Label
            htmlFor={emailId}
            className="font-medium leading-normal text-white [font-family:Montserrat,sans-serif]"
            style={{ fontSize: LABEL_FS }}
          >
            {landingContact.fields.email.label}
          </Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={landingContact.fields.email.placeholder}
            className={fieldClassName}
            style={{ height: INPUT_H, padding: INPUT_PAD, borderRadius: INPUT_RADIUS }}
          />
        </div>

        <div className="flex flex-col" style={{ gap: LABEL_GAP }}>
          <Label
            htmlFor={messageId}
            className="font-medium leading-normal text-white [font-family:Montserrat,sans-serif]"
            style={{ fontSize: LABEL_FS }}
          >
            {landingContact.fields.message.label}
          </Label>
          <Textarea
            id={messageId}
            name="message"
            required
            placeholder={landingContact.fields.message.placeholder}
            className={messageClassName}
            style={{
              height: MESSAGE_H,
              minHeight: MESSAGE_H,
              padding: INPUT_PAD,
              borderRadius: MESSAGE_RADIUS
            }}
          />
        </div>
      </div>

      <LandingButton
        type="submit"
        variant="primary"
        className={cn(
          'h-[39.438px] w-full rounded-[23.827px] px-[19.719px] py-[13.146px]',
          'bg-[linear-gradient(90deg,#22c55e_0%,#1eaf54_32.692%,#199547_64.423%,#136d34_100%)]',
          'text-[13.146px] font-semibold leading-[16.433px] [font-family:Montserrat,sans-serif]',
          'hover:opacity-90 focus-visible:ring-offset-[#171717]'
        )}
      >
        {landingContact.submitLabel}
      </LandingButton>
    </form>
  );
}

export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative z-10 mx-auto w-full max-w-[1240px] scroll-mt-28 px-6 lg:px-0"
    >
      <motion.div
        className="relative overflow-hidden bg-[#171717]"
        style={{
          minHeight: 483,
          borderRadius: PANEL_RADIUS
        }}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
        <ContactGridBackground />

        <div className="relative flex flex-col gap-10 px-6 pb-12 pt-9 sm:px-[68px] lg:flex-row lg:justify-between lg:gap-8 lg:pb-10 lg:pt-9">
          <motion.div className="min-w-0 flex-1" variants={revealFromLeft}>
            <div className="flex max-w-[764px] flex-col gap-4">
              <h2
                id="contact-heading"
                className="font-bold leading-[1.24] text-[clamp(2rem,4vw,48px)] text-white [font-family:Manrope,sans-serif]"
              >
                {landingContact.headingBefore}
                <span className="text-[#01f758]">{landingContact.headingAccent}</span>
                {landingContact.headingAfter}
              </h2>
              <p className="max-w-[624px] text-base leading-normal text-white/80 [font-family:Inter,sans-serif]">
                {landingContact.supporting}
              </p>
            </div>
            <ContactInfoList />
          </motion.div>

          <motion.div className="w-full shrink-0 lg:w-[354.945px]" variants={fadeInUp}>
            <ContactForm />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
