import { motion } from 'framer-motion';
import { Loader2, Mail, MapPin, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useId, useState } from 'react';
import { toast } from 'sonner';
import { fadeInUp, staggerContainer } from '@/modules/landing/animations/landingMotion';
import {
  landingContact,
  landingContactInfo
} from '@/modules/landing/constants/content';
import { CTA_BUTTON_CLASSNAME, ctaButtonStyle } from '@/modules/landing/constants/ctaButton';
import { landingTokens } from '@/modules/landing/constants/tokens';
import { LandingButton } from '@/modules/landing/shared/LandingButton';
import { fluid } from '@/modules/landing/utils/scale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { contactApi, getContactErrorMessage } from '@/services/api/contact.api';

/**
 * Contact — Figma `479:2659` (How can we help you today?).
 * Light gray section, heading + contact-info rows on the left, a bordered
 * white card with the enquiry form on the right.
 */
const HEADING_SIZE = fluid(24, 36);
const BODY_SIZE = fluid(15, 18);
const INFO_LABEL_SIZE = fluid(16, 19);
const INFO_VALUE_SIZE = fluid(14, 15.5);
const FIELD_LABEL_SIZE = fluid(12.5, 14);
const FIELD_TEXT_SIZE = fluid(13, 14);

const CONTACT_ICONS: Record<string, LucideIcon> = {
  email: Mail,
  phone: Phone,
  office: MapPin
};

const fieldClassName = cn(
  'h-[52px] w-full rounded-[10px] border !border-[#FFFFFF1A] bg-[rgba(0,0,0,0.04)] px-5 py-3 shadow-none',
  'text-[#000d00] [font-family:Jost,sans-serif] placeholder:text-[#6d6d6d]',
  'focus:border-[#188f44]/40 focus:ring-2 focus:ring-[#188f44]/30',
  'transition-[box-shadow,background-color] duration-200'
);

function ContactInfoList() {
  return (
    <ul
      className="m-0 flex list-none flex-col items-start p-0"
      style={{ gap: fluid(24, 32) }}
      aria-label="Contact information"
    >
      {landingContactInfo.map((item) => {
        const Icon = CONTACT_ICONS[item.id];
        const text = (
          <>
            <p
              className="m-0 font-bold text-[#131313] [font-family:'Bricolage_Grotesque',sans-serif]"
              style={{ fontSize: INFO_LABEL_SIZE, letterSpacing: '-0.02em' }}
            >
              {item.label}
            </p>
            <p
              className="m-0 font-normal text-[#545454] [font-family:Jost,sans-serif]"
              style={{ fontSize: INFO_VALUE_SIZE, lineHeight: 1.6 }}
            >
              {item.value}
            </p>
          </>
        );

        return (
          <li key={item.id} className="flex items-center" style={{ gap: fluid(16, 24) }}>
            <span
              className="inline-flex shrink-0 items-center justify-center rounded-[20px] border !border-[#D4D4D499] bg-white"
              style={{ width: fluid(60,60), height: fluid(60,60) }}
              aria-hidden
            >
              {Icon ? <Icon className="size-[45%] text-[#188f44]" strokeWidth={1.75} /> : null}
            </span>
            {item.href ? (
              <a
                href={item.href}
                className="flex flex-col items-start gap-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#188f44]/40 focus-visible:ring-offset-2"
              >
                {text}
              </a>
            ) : (
              <div className="flex flex-col items-start gap-2">{text}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  description: string;
};

const INITIAL_CONTACT_VALUES: ContactFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  description: ''
};

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required.';
  }
  if (!values.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  }
  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.subject.trim()) {
    errors.subject = 'Subject is required.';
  }
  if (!values.description.trim()) {
    errors.description = 'Description is required.';
  }

  return errors;
}

function ContactForm() {
  const formId = useId();
  const firstNameId = `${formId}-first-name`;
  const lastNameId = `${formId}-last-name`;
  const emailId = `${formId}-email`;
  const subjectId = `${formId}-subject`;
  const descriptionId = `${formId}-description`;

  const [values, setValues] = useState<ContactFormValues>(INITIAL_CONTACT_VALUES);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFieldChange(field: keyof ContactFormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = validateContactForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await contactApi.submit({
        fullName: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        description: values.description.trim(),
        brand: 'orgatry'
      });

      toast.success('Your message has been submitted successfully.');
      setValues(INITIAL_CONTACT_VALUES);
    } catch (error) {
      toast.error(getContactErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col"
      style={{ gap: fluid(16, 20) }}
      aria-labelledby={`${formId}-title`}
      noValidate
    >
      <span id={`${formId}-title`} className="sr-only">
        Contact form
      </span>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <Label
            htmlFor={firstNameId}
            className="font-normal text-[#000d00] [font-family:Jost,sans-serif]"
            style={{ fontSize: FIELD_LABEL_SIZE }}
          >
            {landingContact.fields.firstName.label}
          </Label>
          <Input
            id={firstNameId}
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            placeholder={landingContact.fields.firstName.placeholder}
            className={fieldClassName}
            style={{ fontSize: FIELD_TEXT_SIZE }}
            value={values.firstName}
            onChange={handleFieldChange('firstName')}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? `${firstNameId}-error` : undefined}
          />
          {errors.firstName ? (
            <span id={`${firstNameId}-error`} className="text-xs text-rose-600">
              {errors.firstName}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label
            htmlFor={lastNameId}
            className="font-normal text-[#000d00] [font-family:Jost,sans-serif]"
            style={{ fontSize: FIELD_LABEL_SIZE }}
          >
            {landingContact.fields.lastName.label}
          </Label>
          <Input
            id={lastNameId}
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            placeholder={landingContact.fields.lastName.placeholder}
            className={fieldClassName}
            style={{ fontSize: FIELD_TEXT_SIZE }}
            value={values.lastName}
            onChange={handleFieldChange('lastName')}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? `${lastNameId}-error` : undefined}
          />
          {errors.lastName ? (
            <span id={`${lastNameId}-error`} className="text-xs text-rose-600">
              {errors.lastName}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor={emailId}
          className="font-normal text-[#000d00] [font-family:Jost,sans-serif]"
          style={{ fontSize: FIELD_LABEL_SIZE }}
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
          style={{ fontSize: FIELD_TEXT_SIZE }}
          value={values.email}
          onChange={handleFieldChange('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
        />
        {errors.email ? (
          <span id={`${emailId}-error`} className="text-xs text-rose-600">
            {errors.email}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor={subjectId}
          className="font-normal text-[#000d00] [font-family:Jost,sans-serif]"
          style={{ fontSize: FIELD_LABEL_SIZE }}
        >
          {landingContact.fields.subject.label}
        </Label>
        <Input
          id={subjectId}
          name="subject"
          type="text"
          required
          placeholder={landingContact.fields.subject.placeholder}
          className={fieldClassName}
          style={{ fontSize: FIELD_TEXT_SIZE }}
          value={values.subject}
          onChange={handleFieldChange('subject')}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? `${subjectId}-error` : undefined}
        />
        {errors.subject ? (
          <span id={`${subjectId}-error`} className="text-xs text-rose-600">
            {errors.subject}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor={descriptionId}
          className="font-normal text-[#000d00] [font-family:Jost,sans-serif]"
          style={{ fontSize: FIELD_LABEL_SIZE }}
        >
          {landingContact.fields.description.label}
        </Label>
        <Textarea
          id={descriptionId}
          name="description"
          required
          placeholder={landingContact.fields.description.placeholder}
          className={cn(fieldClassName, 'min-h-[130px] resize-none py-4')}
          style={{ fontSize: FIELD_TEXT_SIZE }}
          value={values.description}
          onChange={handleFieldChange('description')}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? `${descriptionId}-error` : undefined}
        />
        {errors.description ? (
          <span id={`${descriptionId}-error`} className="text-xs text-rose-600">
            {errors.description}
          </span>
        ) : null}
      </div>

      <LandingButton
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        style={ctaButtonStyle}
        className={CTA_BUTTON_CLASSNAME}
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {isSubmitting ? 'Submitting...' : landingContact.submitLabel}
      </LandingButton>
    </form>
  );
}

export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-28 bg-[#f3f3f5] lg:py-20 py-10"
    >
      <motion.div
        className="mx-auto flex w-full max-w-[1440px] flex-col items-start lg:flex-row lg:justify-between"
        style={{ paddingInline: `clamp(1.5rem, 6vw, ${landingTokens.gutter}px)`, gap: fluid(40, 80) }}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div
          className="flex w-full shrink-0 flex-col items-start justify-between gap-10 lg:max-w-[420px]"
          variants={fadeInUp}
        >
          <div className="flex w-full flex-col items-start" style={{ gap: fluid(20, 32) }}>
            <h2
              id="contact-heading"
              className="m-0 w-full text-[#000d00] capitalize [font-family:'Bricolage_Grotesque',sans-serif]"
              style={{ fontSize: HEADING_SIZE, fontWeight: 500 }}
            >
              {landingContact.heading}
            </h2>
            <p
              className="m-0 w-full font-normal text-[#000d00] [font-family:Jost,sans-serif]"
              style={{ fontSize: BODY_SIZE, lineHeight: 1.5 }}
            >
              {landingContact.supporting}
            </p>
          </div>

          <ContactInfoList />
        </motion.div>

        <motion.div
          className="w-full rounded-[16px] border !border-[#D4D4D499] bg-white lg:max-w-[600px]"
          style={{ padding: fluid(20, 32) }}
          variants={fadeInUp}
        >
          <ContactForm />
        </motion.div>
      </motion.div>
    </section>
  );
}
