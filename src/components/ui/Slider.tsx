import * as RadixSlider from '@radix-ui/react-slider';
import { useId, type ReactNode } from 'react';
import { cn } from './cn';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  onCommit?: () => void;
  help?: ReactNode;
  disabled?: boolean;
  valueLabel?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
  onCommit,
  help,
  disabled = false,
  valueLabel,
}: SliderProps) {
  const id = useId();
  const helpId = `${id}-help`;

  const clamp = (raw: number) => Math.min(max, Math.max(min, raw));

  return (
    <div className={cn('space-y-1', disabled && 'opacity-50')}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`${id}-number`} className="text-[13px] font-medium text-ink-2">
          {label}
        </label>
        <span className="flex items-baseline gap-1">
          <input
            id={`${id}-number`}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            aria-describedby={help ? helpId : undefined}
            onChange={(event) => {
              const next = Number(event.currentTarget.value);
              if (Number.isFinite(next)) onChange(clamp(next));
            }}
            onBlur={onCommit}
            className="tnum h-7 w-14 rounded-sm border border-line-strong bg-base px-1.5 text-right text-xs text-ink focus-visible:border-accent disabled:cursor-not-allowed"
          />
          {unit && <span className="w-4 text-[11px] text-ink-3">{unit}</span>}
        </span>
      </div>

      <RadixSlider.Root
        className="relative flex h-6 w-full touch-none select-none items-center"
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={(next) => onChange(next[0])}
        onValueCommit={() => onCommit?.()}
      >
        <RadixSlider.Track className="relative h-1.5 grow rounded-full bg-[#2b3559]">
          <RadixSlider.Range className="absolute h-full rounded-full bg-accent" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          aria-label={label}
          aria-valuetext={valueLabel ?? `${value}${unit ? ` ${unit}` : ''}`}
          className="block size-4 rounded-full border-2 border-surface bg-accent transition-transform duration-[120ms] hover:scale-110"
        />
      </RadixSlider.Root>

      {help && (
        <p id={helpId} className="text-[11px] leading-snug text-ink-3">
          {help}
        </p>
      )}
    </div>
  );
}
