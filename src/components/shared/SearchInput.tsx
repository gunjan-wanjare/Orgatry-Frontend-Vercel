import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';

type SearchInputProps = {
  debounceMs?: number;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  showSearchButton?: boolean;
  searchButtonLabel?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
};

export function SearchInput({
  debounceMs = 350,
  onValueChange,
  onSubmit,
  showSearchButton = false,
  searchButtonLabel = 'Search',
  placeholder = 'Search...',
  className,
  containerClassName,
}: SearchInputProps) {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    if (debounceMs > 0 && onValueChange) {
      onValueChange(debouncedValue);
    }
  }, [debouncedValue, debounceMs, onValueChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit?.(value);
    }
  };

  return (
    <div className={cn('flex w-full items-center gap-2', containerClassName)}>
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn('pl-9', className)}
        />
      </div>
      {showSearchButton && (
        <Button variant="secondary" size="sm" onClick={() => onSubmit?.(value)} className="shrink-0">
          {searchButtonLabel}
        </Button>
      )}
    </div>
  );
}
