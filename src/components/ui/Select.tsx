import { CaretDown } from '@phosphor-icons/react';
import { useId } from 'react';
import { cn } from './cn';

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  label,
  value,
  options,
  onChange,
  help,
  className,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  help?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink-2">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          aria-describedby={help ? `${id}-help` : undefined}
          className="h-9 w-full appearance-none rounded-md border border-line-strong bg-raised pl-2.5 pr-8 text-sm text-ink transition-colors hover:border-ink-3 focus-visible:border-accent"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <CaretDown
          size={14}
          weight="bold"
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3"
        />
      </div>
      {help && (
        <p id={`${id}-help`} className="text-[11px] leading-snug text-ink-3">
          {help}
        </p>
      )}
    </div>
  );
}
