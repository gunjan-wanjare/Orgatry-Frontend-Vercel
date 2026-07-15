import { useCallback } from 'react';

export function scrollToSectionId(sectionId: string): void {
  if (sectionId === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const target = document.getElementById(sectionId);
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function useSmoothScroll() {
  const scrollToSection = useCallback((sectionId: string) => {
    scrollToSectionId(sectionId);
  }, []);

  return { scrollToSection };
}
