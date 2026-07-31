import type {
  ContactInfoItem,
  FAQ,
  FooterLinkColumn,
  NavigationItem,
  SocialLink,
  Testimonial
} from '@/modules/landing/types/landing.types';
import socialFacebookIcon from '@/modules/landing/assets/icons/social-facebook.svg';
import socialInstagramIcon from '@/modules/landing/assets/icons/social-instagram.svg';
import socialTwitterIcon from '@/modules/landing/assets/icons/social-twitter.svg';
import socialYoutubeIcon from '@/modules/landing/assets/icons/social-youtube.svg';
import testimonialAvatarPriya from '@/modules/landing/assets/images/testimonial-avatar-priya.png';
import testimonialAvatarAmit from '@/modules/landing/assets/images/testimonial-avatar-amit.png';
import testimonialAvatarSneha from '@/modules/landing/assets/images/testimonial-avatar-sneha.png';
import testimonialAvatarRahul from '@/modules/landing/assets/images/testimonial-avatar-rahul.png';
import testimonialAvatarRohit from '@/modules/landing/assets/images/testimonial-avatar-rohit.png';
import { landingNavItems } from '@/modules/landing/constants/navigation';

export const landingNavigation: NavigationItem[] = landingNavItems;

/** Realistic HRMS FAQs — first item open by default in FaqSection. */
export const landingFaqs: FAQ[] = [
  {
    id: 'faq-sizes',
    question: 'Is Orgatry suitable for businesses of all sizes?',
    answer: 'Yes, Orgatry works for startups, growing teams, and large enterprises alike.'
  },
  {
    id: 'faq-processes',
    question: 'What HR processes does Orgatry manage?',
    answer:
      'Orgatry manages everything, from employee attendance and leave to recruitment, onboarding, and performance, all in one place.'
  },
  {
    id: 'faq-recruitment',
    question: 'Can Orgatry handle recruitment and onboarding?',
    answer: 'Yes, Orgatry manages the full employee lifecycle, including recruitment and onboarding.'
  },
  {
    id: 'faq-ai',
    question: 'Does Orgatry use AI?',
    answer:
      'Yes, Orgatry uses AI to automate repetitive HR tasks and produce real-time workforce insights.'
  }
];

/** Indian personas — marquee testimonials. Rahul/Priya/Rohit have Figma avatars; Amit/Sneha fall back to initials. */
export const landingTestimonials: Testimonial[] = [
  {
    id: 't-rahul',
    quote:
      'Leave approvals used to sit in email for days. With Orgatry, managers clear requests the same morning and balances stay accurate without someone updating a sheet.',
    name: 'Rahul Sharma',
    role: 'HR Manager',
    avatarSrc: testimonialAvatarRahul
  },
  {
    id: 't-priya',
    quote:
      'We run hybrid shifts across two cities. Attendance finally matches what people actually work, and payroll stopped calling us every month about missing punches.',
    name: 'Priya Mehta',
    role: 'People Operations Lead',
    avatarSrc: testimonialAvatarPriya
  },
  {
    id: 't-amit',
    quote:
      'Onboarding used to mean three tools and a shared drive. Now documents, offers, and day-one access live in one place. New hires get productive faster.',
    name: 'Amit Verma',
    role: 'HR Director',
    avatarSrc: testimonialAvatarAmit
  },
  {
    id: 't-sneha',
    quote:
      'As a founder I needed HR that does not need a full-time admin. Orgatry covered leave, attendance, and payslips without asking us to hire more process people.',
    name: 'Sneha Kapoor',
    role: 'Founder',
    avatarSrc: testimonialAvatarSneha
  },
  {
    id: 't-rohit',
    quote:
      'Month-end used to mean reconciling overtime by hand. The reports in Orgatry are close enough that finance and ops review once and move on.',
    name: 'Rohit Bansal',
    role: 'Operations Head',
    avatarSrc: testimonialAvatarRohit
  }
];

/** Contact panel copy — Figma `479:2659`. */
export const landingContact = {
  heading: 'How can we help you today?',
  supporting: "Tell us about your business. We'll show you how Orgatry fits.",
  submitLabel: 'Submit',
  fields: {
    firstName: { label: 'Full Name*', placeholder: 'Enter your first name' },
    lastName: { label: 'Last Name*', placeholder: 'Enter your last name' },
    email: { label: 'Email', placeholder: 'Enter your email' },
    subject: { label: 'Subject', placeholder: 'Enter your subject' },
    description: { label: 'Description', placeholder: 'Please describe what you need' }
  }
} as const;

export const landingContactInfo: ContactInfoItem[] = [
  {
    id: 'email',
    label: 'Email',
    value: 'hello@orgatry.com',
    href: 'mailto:hello@orgatry.com'
  },
  {
    id: 'phone',
    label: 'Phone',
    value: '+91 1234567890',
    href: 'tel:+911234567890'
  },
  {
    id: 'office',
    label: 'Office',
    value: 'Sattva Knowledge City, Hi-Tec City, Hyderabad.'
  }
];

/** Footer newsletter + links — Figma `285:365`. */
export const landingFooter = {
  brand: 'Orgatry',
  tagline: 'A YAKA Enterprise',
  headline: ['Your Trusted Partner,', 'Because Employee Matters'] as const,
  emailPlaceholder: 'Enter your email',
  subscribeButton: 'Subscribe',
  copyright: 'Copyright © 2026. All Rights Reserved'
} as const;

export const landingFooterColumns: FooterLinkColumn[] = [
  {
    id: 'quick-links',
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '/#home' },
      { label: 'About Us', href: '/#about' },
      { label: 'Service', href: '/#solutions' },
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
      { label: 'T&C', href: '/terms-and-conditions', openInNewTab: true }
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
