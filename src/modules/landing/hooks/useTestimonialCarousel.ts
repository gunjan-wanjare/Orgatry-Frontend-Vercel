import { useCallback, useMemo, useState } from 'react';

export type UseTestimonialCarouselResult = {
  index: number;
  count: number;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
};

export function useTestimonialCarousel(count: number, initialIndex = 0): UseTestimonialCarouselResult {
  const safeCount = Math.max(0, count);
  const [index, setIndex] = useState(() => {
    if (safeCount === 0) {
      return 0;
    }
    return Math.min(Math.max(initialIndex, 0), safeCount - 1);
  });

  const normalizedIndex = useMemo(() => {
    if (safeCount === 0) {
      return 0;
    }
    return ((index % safeCount) + safeCount) % safeCount;
  }, [index, safeCount]);

  const next = useCallback(() => {
    if (safeCount === 0) {
      return;
    }
    setIndex((current) => (current + 1) % safeCount);
  }, [safeCount]);

  const previous = useCallback(() => {
    if (safeCount === 0) {
      return;
    }
    setIndex((current) => (current - 1 + safeCount) % safeCount);
  }, [safeCount]);

  const goTo = useCallback(
    (target: number) => {
      if (safeCount === 0) {
        return;
      }
      setIndex(((target % safeCount) + safeCount) % safeCount);
    },
    [safeCount]
  );

  return {
    index: normalizedIndex,
    count: safeCount,
    next,
    previous,
    goTo
  };
}
