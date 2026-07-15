import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type FormFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string | undefined;
  type?: string | undefined;
  textarea?: boolean;
  placeholder?: string | undefined;
  autoComplete?: string | undefined;
  /** Optional UI-only class overrides (does not affect RHF register). */
  className?: string | undefined;
  labelClassName?: string | undefined;
  inputClassName?: string | undefined;
};

export function FormField<T extends FieldValues>({
  label,
  name,
  register,
  error,
  type = 'text',
  textarea,
  placeholder,
  autoComplete,
  className,
  labelClassName,
  inputClassName
}: FormFieldProps<T>) {
  const inputProps = {
    id: name,
    placeholder,
    autoComplete,
    ...register(name)
  };

  return (
    <label className={cn('grid gap-2 text-sm', className)}>
      <span className={cn('font-medium text-foreground', labelClassName)}>{label}</span>
      {textarea ? (
        <Textarea {...inputProps} className={inputClassName} />
      ) : (
        <Input type={type} {...inputProps} className={inputClassName} />
      )}
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
