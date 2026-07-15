import type {
  ContactInfoItem,
  FAQ,
  Feature,
  FooterLinkColumn,
  NavigationItem,
  SocialLink,
  Solution,
  Testimonial,
  WhyChoose
} from '@/modules/landing/types/landing.types';
import contactAddressIcon from '@/modules/landing/assets/icons/contact-address.svg';
import contactEmailIcon from '@/modules/landing/assets/icons/contact-email.svg';
import contactPhoneIcon from '@/modules/landing/assets/icons/contact-phone.svg';
import contactWebIcon from '@/modules/landing/assets/icons/contact-web.svg';
import socialFacebookIcon from '@/modules/landing/assets/icons/social-facebook.svg';
import socialInstagramIcon from '@/modules/landing/assets/icons/social-instagram.svg';
import socialTwitterIcon from '@/modules/landing/assets/icons/social-twitter.svg';
import socialYoutubeIcon from '@/modules/landing/assets/icons/social-youtube.svg';
import { landingNavItems } from '@/modules/landing/constants/navigation';

export const landingNavigation: NavigationItem[] = landingNavItems;

export const landingFeatures: Feature[] = [];

export const landingSolutions: Solution[] = [];

export const landingWhyChoose: WhyChoose[] = [];

/** Realistic HRMS FAQs — first item open by default in FaqSection. */
export const landingFaqs: FAQ[] = [
  {
    id: 'faq-leave',
    question: 'How does leave management work in Orgatry?',
    answer:
      'Employees can apply for leave from the self-service portal, while managers approve requests from a single queue. Policy rules, leave balances, holidays, and accruals stay in sync so HR does not need to chase spreadsheet updates.'
  },
  {
    id: 'faq-attendance',
    question: 'Can we track attendance across office and remote teams?',
    answer:
      'Yes. Orgatry supports biometric, geo-fenced mobile check-in, and web punches. Shift schedules, late marks, overtime, and absences roll into attendance reports that payroll and managers can trust.'
  },
  {
    id: 'faq-payroll',
    question: 'Does Orgatry handle payroll and statutory compliance?',
    answer:
      'Payroll runs from attendance and salary structures already in the system. Deductions, reimbursements, and statutory components are calculated in one cycle, with payslips employees can download anytime.'
  },
  {
    id: 'faq-ess',
    question: 'What can employees do through self-service?',
    answer:
      'Employees update profiles, apply for leave, view attendance, download payslips, submit claims, and track appraisal goals without raising tickets to HR for routine requests.'
  },
  {
    id: 'faq-security',
    question: 'How is employee data kept secure?',
    answer:
      'Access is role-based, sessions are protected, and sensitive fields are restricted by permission. Data is stored on secure cloud infrastructure with audit trails for critical HR actions.'
  }
];

/** Indian personas — no avatars (marquee testimonials). */
export const landingTestimonials: Testimonial[] = [
  {
    id: 't-rahul',
    quote:
      'Leave approvals used to sit in email for days. With Orgatry, managers clear requests the same morning and balances stay accurate without someone updating a sheet.',
    name: 'Rahul Sharma',
    role: 'HR Manager'
  },
  {
    id: 't-priya',
    quote:
      'We run hybrid shifts across two cities. Attendance finally matches what people actually work, and payroll stopped calling us every month about missing punches.',
    name: 'Priya Mehta',
    role: 'People Operations Lead'
  },
  {
    id: 't-amit',
    quote:
      'Onboarding used to mean three tools and a shared drive. Now documents, offers, and day-one access live in one place. New hires get productive faster.',
    name: 'Amit Verma',
    role: 'HR Director'
  },
  {
    id: 't-sneha',
    quote:
      'As a founder I needed HR that does not need a full-time admin. Orgatry covered leave, attendance, and payslips without asking us to hire more process people.',
    name: 'Sneha Kapoor',
    role: 'Founder'
  },
  {
    id: 't-rohit',
    quote:
      'Month-end used to mean reconciling overtime by hand. The reports in Orgatry are close enough that finance and ops review once and move on.',
    name: 'Rohit Bansal',
    role: 'Operations Head'
  }
];

/** Contact panel copy from Figma `1:1626`. */
export const landingContact = {
  headingBefore: 'Get in Touch ',
  headingAccent: 'with',
  headingAfter: ' Us',
  supporting:
    'Let’s discuss how Orgatry Innovations can help transform your business.',
  submitLabel: 'Submit',
  fields: {
    name: { label: 'Name', placeholder: 'Name' },
    email: { label: 'Email', placeholder: 'name@email.com' },
    message: { label: 'Message', placeholder: 'Message' }
  }
} as const;

export const landingContactInfo: ContactInfoItem[] = [
  {
    id: 'address',
    label: 'Address',
    value: 'Sattva Knowledge City, Hi-Tec City,\nHyderabad.',
    iconSrc: contactAddressIcon,
    multiline: true
  },
  {
    id: 'phone',
    label: 'Phone',
    value: '+91 1234567890',
    href: 'tel:+911234567890',
    iconSrc: contactPhoneIcon
  },
  {
    id: 'email',
    label: 'Email',
    value: 'hello@Orgatry.com',
    href: 'mailto:hello@Orgatry.com',
    iconSrc: contactEmailIcon
  },
  {
    id: 'website',
    label: 'Website',
    value: 'Orgatry.com',
    href: 'https://Orgatry.com',
    iconSrc: contactWebIcon
  }
];

/** Footer newsletter + links from Figma `1:1566`. */
export const landingFooter = {
  brand: 'Orgatry',
  subscribeTitle: 'Subscribe',
  subscribeDescription: 'Join our newsletter to stay up to date on features and releases.',
  emailPlaceholder: 'Enter your email',
  subscribeButton: 'Subscribe',
  privacyPrefix: 'By subscribing you agree to with our ',
  privacyLabel: 'Privacy Policy',
  privacyHref: '/privacy-policy',
  copyright: 'Copyright © 2025. All Rights Reserved'
} as const;

export const landingFooterColumns: FooterLinkColumn[] = [
  {
    id: 'quick-links',
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/#home' },
      { label: 'About', href: '/#about' },
      { label: 'Services', href: '/#solutions' },
      { label: 'Contact', href: '/#contact' }
    ]
  },
  {
    id: 'products',
    title: 'Products',
    links: [
      { label: 'Ai Assistant', href: '#' },
      { label: 'Mobile App', href: '#' },
      { label: 'Account', href: '#' },
      { label: 'Market', href: '#' }
    ]
  },
  {
    id: 'legal',
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy', openInNewTab: true },
      { label: 'Terms & Conditions', href: '/terms-and-conditions', openInNewTab: true }
    ]
  }
];

export const landingSocialLinks: SocialLink[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    href: '#',
    iconSrc: socialFacebookIcon
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    href: '#',
    iconSrc: socialTwitterIcon
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: '#',
    iconSrc: socialInstagramIcon
  },
  {
    id: 'youtube',
    label: 'YouTube',
    href: '#',
    iconSrc: socialYoutubeIcon
  }
];
