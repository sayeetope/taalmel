import { ArrowUpRight, CursorClick, PlusCircle, Trash, Broom } from '@phosphor-icons/react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/components/ui/cn';
import { usePlanner, type Tool } from '../store/plannerStore';

const TOOLS: Array<{ value: Tool; label: string; hint: string; Icon: typeof CursorClick }> = [
  { value: 'select', label: 'Select and move', hint: 'V', Icon: CursorClick },
  { value: 'add', label: 'Add access point', hint: 'A', Icon: PlusCircle },
  { value: 'delete', label: 'Delete access point', hint: 'Del', Icon: Trash },
];

export function ToolDock({ compact = false }: { compact?: boolean }) {
  const tool = usePlanner((state) => state.tool);
  const setTool = usePlanner((state) => state.setTool);
  const clearAll = usePlanner((state) => state.clearAll);
  const requestFit = usePlanner((state) => state.requestFit);
  const hasAps = usePlanner((state) => state.aps.length > 0);

  return (
    <div
      role="toolbar"
      aria-label="Canvas tools"
      aria-orientation={compact ? 'horizontal' : 'vertical'}
      className={cn('pointer-events-auto flex gap-1 rounded-lg border border-line bg-surface p-1 shadow-lg', compact ? 'flex-row' : 'flex-col')}
    >
      {TOOLS.map(({ value, label, hint, Icon }) => (
        <Tooltip key={value} label={`${label} (${hint})`} side={compact ? 'top' : 'right'}>
          <button
            type="button"
            aria-label={`${label} (${hint})`}
            aria-pressed={tool === value}
            onClick={() => setTool(value)}
            className={cn(
              'inline-flex items-center justify-center rounded-md text-ink-2 transition-colors duration-[120ms]',
              compact ? 'size-11' : 'size-10',
              'hover:bg-raised hover:text-ink',
              tool === value && 'bg-accent-soft text-accent'
            )}
          >
            <Icon size={19} weight={tool === value ? 'fill' : 'regular'} aria-hidden="true" />
          </button>
        </Tooltip>
      ))}

      <span className={cn('bg-line', compact ? 'mx-0.5 my-2 w-px' : 'mx-2 my-0.5 h-px')} aria-hidden="true" />

      <Tooltip label="Clear all APs (undo available)" side={compact ? 'top' : 'right'}>
        <button
          type="button"
          aria-label="Clear all APs"
          onClick={clearAll}
          disabled={!hasAps}
          className="inline-flex size-11 items-center justify-center rounded-md text-ink-3 transition-colors duration-[120ms] hover:bg-raised hover:text-danger disabled:pointer-events-none disabled:opacity-35 lg:size-10"
        >
          <Broom size={19} aria-hidden="true" />
        </button>
      </Tooltip>

      <Tooltip label="Fit graph to view" side={compact ? 'top' : 'right'}>
        <button
          type="button"
          aria-label="Fit graph to view"
          onClick={requestFit}
          disabled={!hasAps}
          className="inline-flex size-11 items-center justify-center rounded-md text-ink-3 transition-colors duration-[120ms] hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-35 lg:size-10"
        >
          <ArrowUpRight size={19} aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
}
