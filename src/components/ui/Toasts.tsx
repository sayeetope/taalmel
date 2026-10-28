import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react';
import { cn } from './cn';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; run: () => void };
}

const ICONS = {
  info: Info,
  success: CheckCircle,
  warning: WarningCircle,
  error: WarningCircle,
} as const;

const TONES: Record<ToastTone, string> = {
  info: 'border-line-strong text-ink',
  success: 'border-success/50 text-ink',
  warning: 'border-warning/50 text-ink',
  error: 'border-danger/60 text-ink',
};

const ICON_TONES: Record<ToastTone, string> = {
  info: 'text-ink-2',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
};

export function Toasts({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      data-toasts=""
      className="pointer-events-none fixed inset-x-0 bottom-40 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-24"
      aria-live="polite"
      aria-atomic="false"
    >
      {items.map((toast) => {
        const Icon = ICONS[toast.tone];
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-md items-center gap-2.5 rounded-md border bg-surface px-3 py-2 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)]',
              TONES[toast.tone]
            )}
          >
            <Icon size={16} aria-hidden="true" className={cn('shrink-0', ICON_TONES[toast.tone])} />
            <p className="flex-1 text-sm leading-snug">{toast.message}</p>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.run();
                  onDismiss(toast.id);
                }}
                className="shrink-0 rounded-sm px-2 py-1 text-xs font-semibold text-accent underline decoration-accent/40 underline-offset-2 hover:bg-accent-soft"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded-sm p-1 text-ink-3 hover:bg-raised hover:text-ink"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
