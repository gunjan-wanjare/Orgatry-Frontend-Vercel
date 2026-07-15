import { useEffect, useState } from 'react';

export type UseActiveSectionOptions = {
  sectionIds: readonly string[];
  rootMargin?: string;
  threshold?: number | number[];
};

export function useActiveSection({
  sectionIds,
  rootMargin = '-28% 0px -55% 0px',
  threshold = [0, 0.25, 0.5, 0.75, 1]
}: UseActiveSectionOptions): string {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? 'home');

  useEffect(() => {
    if (sectionIds.length === 0) {
      return;
    }

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      const onScroll = () => {
        if (window.scrollY < 80) {
          setActiveId('home');
        }
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let nextActive = sectionIds[0] ?? 'home';
        let bestRatio = -1;

        for (const id of sectionIds) {
          const ratio = visibility.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            nextActive = id;
          }
        }

        if (window.scrollY < 80) {
          nextActive = 'home';
        }

        setActiveId(nextActive);
      },
      { root: null, rootMargin, threshold }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sectionIds, rootMargin, threshold]);

  return activeId;
}
