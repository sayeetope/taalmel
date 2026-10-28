import * as RadixTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';
import { cn } from './cn';

export function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange} className={cn('flex min-h-0 flex-col', className)}>
      {children}
    </RadixTabs.Root>
  );
}

export function TabsList({ children, label }: { children: ReactNode; label: string }) {
  return (
    <RadixTabs.List
      aria-label={label}
      className="grid grid-cols-3 gap-1 rounded-md border border-line bg-base/60 p-1"
    >
      {children}
    </RadixTabs.List>
  );
}

export function TabTrigger({ value, children, badge }: { value: string; children: ReactNode; badge?: ReactNode }) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={cn(
        'relative flex h-8 items-center justify-center gap-1.5 rounded-sm px-1.5 text-xs font-medium text-ink-3 transition-colors duration-[120ms]',
        'hover:bg-raised hover:text-ink-2',
        'data-[state=active]:bg-raised data-[state=active]:text-ink data-[state=active]:shadow-[inset_0_-2px_0_var(--color-accent)]'
      )}
    >
      {children}
      {badge}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadixTabs.Content value={value} className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 focus-visible:outline-offset-4">
      {children}
    </RadixTabs.Content>
  );
}
