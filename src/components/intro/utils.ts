import type { DomRectLite } from '@/components/intro/types';

export function measureElement(el: Element | null): DomRectLite | null {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };
}

export function measureAnchor(id: string): DomRectLite | null {
  return measureElement(document.getElementById(id));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function isMobileViewport(breakpoint: number): boolean {
  return typeof window !== 'undefined' && window.innerWidth < breakpoint;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
