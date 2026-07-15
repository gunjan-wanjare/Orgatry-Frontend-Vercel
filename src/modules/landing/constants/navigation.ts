import type { NavigationItem } from '@/modules/landing/types/landing.types';

export const landingNavItems: NavigationItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About Us', href: '#about' },
  { id: 'solutions', label: 'Solutions', href: '#solutions' },
  { id: 'why-us', label: 'Why us', href: '#why-us' },
  { id: 'contact', label: 'Contact', href: '#contact' }
];

export const landingNavSectionIds = landingNavItems.map((item) => item.id) as readonly string[];
