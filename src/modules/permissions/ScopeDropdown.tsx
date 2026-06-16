import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PermissionScope } from './permission-matrix.types';
import { SCOPE_OPTIONS } from './permission-matrix.types';

type ScopeDropdownProps = {
  value: PermissionScope;
  disabled?: boolean;
  isPending?: boolean;
  onChange: (scope: PermissionScope) => void;
  className?: string;
};

export function ScopeDropdown({
  value,
  disabled = false,
  isPending = false,
  onChange,
  className,
}: ScopeDropdownProps) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(next) => onChange(next as PermissionScope)}
    >
      <SelectTrigger
        className={cn(
          'h-9 w-full min-w-[120px] max-w-[160px] transition-colors',
          isPending && 'border-amber-400/50 bg-amber-500/5',
          className,
        )}
      >
        <SelectValue placeholder="Scope" />
      </SelectTrigger>
      <SelectContent>
        {SCOPE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
