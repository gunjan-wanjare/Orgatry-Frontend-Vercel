import type { ReactNode } from 'react';

export type LandingAlignment = 'left' | 'center' | 'right';

export type LandingButtonVariant = 'primary' | 'secondary' | 'dark';

export type Feature = {
  id: string;
  title: string;
  description: string;
  icon?: string;
};

export type Solution = {
  id: string;
  title: string;
  description: string;
  href?: string;
  icon?: string;
};

export type WhyChoose = {
  id: string;
  title: string;
  description: string;
  icon?: string;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarSrc?: string;
  company?: string;
  rating?: number;
};

export type ContactInfoItem = {
  id: string;
  label: string;
  value: string;
  href?: string;
  iconSrc: string;
  multiline?: boolean;
};

export type FooterLink = {
  label: string;
  href: string;
  /** Open in a new tab with `rel="noopener noreferrer"`. */
  openInNewTab?: boolean;
};

export type FooterLinkColumn = {
  id: string;
  title: string;
  links: FooterLink[];
};

export type SocialLink = {
  id: string;
  label: string;
  href: string;
  iconSrc: string;
};

export type NavigationItem = {
  id: string;
  label: string;
  href: string;
};

export type SectionHeadingProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  alignment?: LandingAlignment;
  className?: string;
};

export type SectionBadgeProps = {
  children: ReactNode;
  className?: string;
};

export type LandingContainerProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main';
};

export type LandingButtonProps = {
  children: ReactNode;
  variant?: LandingButtonVariant;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
};

export type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
};
