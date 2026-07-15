import { cn } from '@/lib/utils';
import { landingTokens } from '@/modules/landing/constants/tokens';
import type { LandingContainerProps } from '@/modules/landing/types/landing.types';

export function LandingContainer({ children, className, as: Component = 'div' }: LandingContainerProps) {
  return (
    <Component
      className={cn('mx-auto w-full', className)}
      style={{
        maxWidth: landingTokens.contentWidth,
        paddingInline: `clamp(1.5rem, 4vw, ${landingTokens.gutter}px)`
      }}
    >
      {children}
    </Component>
  );
}
