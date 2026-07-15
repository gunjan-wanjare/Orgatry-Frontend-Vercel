import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { LandingButtonVariant } from '@/modules/landing/types/landing.types';

export type LandingButtonProps = {
  children: ReactNode;
  variant?: LandingButtonVariant;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  'aria-label'?: string;
};

/** ~0.95× Figma 50×32×14 / 16px type */
const variantClassName: Record<LandingButtonVariant, string> = {
  primary:
    'h-[47.5px] rounded-[100px] bg-gradient-to-r from-[#22c55e] to-[#15803d] px-[30.4px] py-[13.3px] text-[15.2px] font-medium text-white [font-family:Manrope,sans-serif] shadow-[0_6px_20px_rgba(34,197,94,0.22)] hover:opacity-90 hover:shadow-[0_8px_24px_rgba(34,197,94,0.3)] active:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717]',
  secondary:
    'h-[47.5px] rounded-[100px] border-2 border-[#008435] bg-transparent px-[30.4px] py-[13.3px] text-[15.2px] font-medium text-black [font-family:Manrope,sans-serif] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008435]/40',
  dark:
    'h-[47.5px] rounded-[100px] bg-[#171717] px-[30.4px] py-[13.3px] text-[15.2px] font-medium text-white [font-family:Manrope,sans-serif] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
};

/**
 * Landing-scoped button. Isolated from the app design-system Button.
 * Dimensions ≈ Figma × 0.95 for visual breathing room.
 */
export function LandingButton({
  children,
  variant = 'primary',
  className,
  type = 'button',
  disabled,
  onClick,
  'aria-label': ariaLabel
}: LandingButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      data-landing-variant={variant}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap transition-[opacity,box-shadow] duration-300 ease-out disabled:pointer-events-none disabled:opacity-50',
        variantClassName[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
