import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import {
  designationApi,
  type DesignationTemplate,
} from '@/services/api/designation.api';

type DesignationAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectTemplate?: (template: DesignationTemplate) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

export function DesignationAutocomplete({
  value,
  onChange,
  onSelectTemplate,
  placeholder = 'Enter designation…',
  className,
  inputClassName,
}: DesignationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(value.trim(), 300);

  const searchQuery = useQuery({
    queryKey: ['designations', 'search', debouncedQuery],
    queryFn: () => designationApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 1 && open,
    staleTime: 30_000,
  });

  const suggestions = searchQuery.data ?? [];
  const showDropdown = open && debouncedQuery.length >= 1;

  useEffect(() => {
    setHighlightIndex(-1);
  }, [debouncedQuery, suggestions.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectTemplate = (template: DesignationTemplate) => {
    onChange(template.designation);
    onSelectTemplate?.(template);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
    } else if (event.key === 'Enter' && highlightIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[highlightIndex];
      if (selected) {
        selectTemplate(selected);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
      />

      {showDropdown ? (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-slate-950 shadow-lg">
          {searchQuery.isLoading ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              Searching…
            </li>
          ) : suggestions.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              No matches — continue typing a custom designation.
            </li>
          ) : (
            suggestions.map((template, index) => (
              <li key={template.id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition-colors hover:bg-white/5',
                    index === highlightIndex && 'bg-white/10',
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectTemplate(template)}
                >
                  <span className="font-medium text-foreground">
                    {template.designation}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {template.department}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
