import { cn } from '@/lib/utils';
import type { SectionHeadingProps } from '@/modules/landing/types/landing.types';

const alignmentClassName = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right'
} as const;

export function SectionHeading({
  title,
  subtitle,
  badge,
  alignment = 'left',
  className
}: SectionHeadingProps) {
  return (
    <header className={cn('flex flex-col gap-4', alignmentClassName[alignment], className)}>
      {badge ? <div>{badge}</div> : null}
      {typeof title === 'string' ? <h2>{title}</h2> : title}
      {subtitle ? (typeof subtitle === 'string' ? <p>{subtitle}</p> : subtitle) : null}
    </header>
  );
}
