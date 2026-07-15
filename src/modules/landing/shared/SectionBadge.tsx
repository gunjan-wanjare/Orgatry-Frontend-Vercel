import { cn } from '@/lib/utils';
import type { SectionBadgeProps } from '@/modules/landing/types/landing.types';

export function SectionBadge({ children, className }: SectionBadgeProps) {
  return <span className={cn('inline-flex items-center', className)}>{children}</span>;
}
