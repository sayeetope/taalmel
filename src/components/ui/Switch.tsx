import * as RadixSwitch from '@radix-ui/react-switch';
import { cn } from './cn';

export function Switch({
  id,
  checked,
  onCheckedChange,
  label,
  className,
}: {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  className?: string;
}) {
  return (
    <RadixSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-[120ms]',
        checked ? 'border-accent bg-accent' : 'border-line-strong bg-raised',
        className
      )}
    >
      <RadixSwitch.Thumb className="block size-3.5 translate-x-0.5 rounded-full bg-on-accent transition-transform duration-[120ms] data-[state=checked]:translate-x-[18px]" />
    </RadixSwitch.Root>
  );
}
