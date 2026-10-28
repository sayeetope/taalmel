import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { cn } from './cn';

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog.Root>
  );
}

export function DialogPortal({ children }: { children: ReactNode }) {
  return <RadixDialog.Portal>{children}</RadixDialog.Portal>;
}

export function DialogOverlay({ className }: { className?: string }) {
  return (
    <RadixDialog.Overlay
      className={cn('fixed inset-0 z-40 bg-[#05070f]', 'data-[state=open]:animate-none', className)}
    />
  );
}

export function DialogContent({
  children,
  className,
  labelledBy,
  describedBy,
  onInteractOutside,
  onEscapeKeyDown,
}: {
  children: ReactNode;
  className?: string;
  labelledBy: string;
  describedBy?: string;
  onInteractOutside?: RadixDialog.DialogContentProps['onInteractOutside'];
  onEscapeKeyDown?: RadixDialog.DialogContentProps['onEscapeKeyDown'];
}) {
  return (
    <RadixDialog.Content
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={cn('fixed z-50 outline-none', className)}
      onInteractOutside={onInteractOutside}
      onEscapeKeyDown={onEscapeKeyDown}
      onOpenAutoFocus={(event) => {
        // Announce the dialog itself rather than highlighting the first toolbar button.
        event.preventDefault();
        if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus();
      }}
    >
      {children}
    </RadixDialog.Content>
  );
}

export const DialogTitle = RadixDialog.Title;
export const DialogDescription = RadixDialog.Description;
export const DialogClose = RadixDialog.Close;
