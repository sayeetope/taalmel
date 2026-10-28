import type { ReactNode } from 'react';
import { ArrowsClockwise, Info } from '@phosphor-icons/react';
import { channelColor, groupColor } from '@/design/channelColors';
import { cn } from '@/components/ui/cn';

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className="text-[13px] font-semibold tracking-[0.01em] text-ink">{children}</h3>
      {aside}
    </div>
  );
}

export function MetricRow({
  label,
  value,
  tone = 'default',
  help,
  mono = true,
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: 'default' | 'danger' | 'success' | 'warning' | 'muted';
  help?: string;
  mono?: boolean;
}) {
  const tones = {
    default: 'text-ink',
    danger: 'text-danger',
    success: 'text-success',
    warning: 'text-warning',
    muted: 'text-ink-3',
  } as const;

  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/60 py-1.5 last:border-b-0">
      <span className="flex items-baseline gap-1 text-[13px] text-ink-2">
        {label}
        {help && (
          <span title={help} className="inline-flex items-center text-ink-3">
            <Info size={12} aria-hidden="true" />
            <span className="sr-only">{help}</span>
          </span>
        )}
      </span>
      <span className={cn('text-[13px] font-medium', mono && 'tnum', tones[tone])}>{value}</span>
    </div>
  );
}

export function Note({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'warning' | 'success' | 'danger' }) {
  const tones = {
    neutral: 'border-line bg-base/50 text-ink-2',
    warning: 'border-warning/35 bg-warning-soft text-ink-2',
    success: 'border-success/30 bg-success-soft text-ink-2',
    danger: 'border-danger/35 bg-danger-soft text-ink-2',
  } as const;
  return <div className={cn('rounded-md border px-3 py-2 text-[12px] leading-relaxed', tones[tone])}>{children}</div>;
}

export function EmptyResult({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-line-strong/60 px-4 py-6 text-center">
      <p className="text-[13px] font-medium text-ink">{title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-3">{children}</p>
    </div>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <span className="tnum rounded-sm border border-line bg-base px-1.5 py-0.5 text-[11px] text-ink-2">{children}</span>
  );
}

export function ChannelDot({ channel, maxChannel }: { channel: number; maxChannel: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2.5 rounded-full ring-1 ring-black/40"
      style={{ background: channelColor(channel, Math.max(13, maxChannel)) }}
    />
  );
}

export function GroupDot({ group, count }: { group: number; count: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2.5 rounded-full ring-1 ring-black/40"
      style={{ background: groupColor(group, Math.max(3, count)) }}
    />
  );
}

export function StaleNote({ onRerun, children }: { onRerun?: () => void; children?: ReactNode }) {
  return (
    <div className="mb-3 flex items-start gap-2 rounded-md border border-warning/40 bg-warning-soft px-2.5 py-2 text-[12px] leading-snug text-ink-2">
      <ArrowsClockwise size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-warning" />
      <p className="flex-1">
        {children ?? 'The graph or parameters changed after this result.'}
        {onRerun && (
          <button
            type="button"
            onClick={onRerun}
            className="ml-1.5 font-semibold text-warning underline decoration-warning/40 underline-offset-2 hover:decoration-warning"
          >
            Run again
          </button>
        )}
      </p>
    </div>
  );
}

export function AssignmentRow({
  name,
  meta,
  color,
  value,
}: {
  name: ReactNode;
  meta?: ReactNode;
  color: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/60 py-1.5 last:border-b-0">
      <span className="min-w-0 truncate text-[13px] text-ink">{name}</span>
      <span className="flex shrink-0 items-center gap-2 text-[12px] text-ink-2">
        {meta}
        <span aria-hidden="true" className="size-2.5 rounded-full ring-1 ring-black/40" style={{ background: color }} />
        <span className="tnum w-12 text-right text-ink">{value}</span>
      </span>
    </div>
  );
}
