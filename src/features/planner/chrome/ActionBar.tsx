import { ArrowsClockwise, Broadcast, CircleNotch, GridFour, Palette } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/components/ui/cn';
import { usePlanner } from '../store/plannerStore';

export function ActionBar() {
  const recolor = usePlanner((state) => state.recolor);
  const runTColor = usePlanner((state) => state.runTColor);
  const tStatus = usePlanner((state) => state.tStatus);
  const showCoverage = usePlanner((state) => state.showCoverage);
  const showGrid = usePlanner((state) => state.showGrid);
  const setShowCoverage = usePlanner((state) => state.setShowCoverage);
  const setShowGrid = usePlanner((state) => state.setShowGrid);
  const autoRecolor = usePlanner((state) => state.autoRecolor);
  const setAutoRecolor = usePlanner((state) => state.setAutoRecolor);
  const hasAps = usePlanner((state) => state.aps.length > 0);
  const running = tStatus === 'running';

  return (
    <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-lg border border-line bg-surface p-1 shadow-lg">
      <Button
        size="sm"
        variant="secondary"
        onClick={recolor}
        disabled={!hasAps}
        icon={<ArrowsClockwise size={15} aria-hidden="true" />}
        className="h-11 px-2.5 lg:h-9"
      >
        Recolor
      </Button>

      <Button
        size="sm"
        variant="primary"
        onClick={() => void runTColor()}
        disabled={!hasAps || running}
        icon={
          running ? (
            <CircleNotch size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <Palette size={15} aria-hidden="true" />
          )
        }
        className="h-11 px-2.5 lg:h-9"
      >
        {running ? 'Solving…' : 'T-Color'}
      </Button>

      <span className="mx-0.5 h-6 w-px bg-line" aria-hidden="true" />

      <Tooltip label="Show or hide coverage discs">
        <button
          type="button"
          aria-label="Toggle coverage discs"
          aria-pressed={showCoverage}
          onClick={() => setShowCoverage(!showCoverage)}
          className={cn(
            'inline-flex h-11 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-[120ms] lg:h-9',
            showCoverage ? 'bg-raised text-ink' : 'text-ink-3 hover:bg-raised hover:text-ink-2'
          )}
        >
          <Broadcast size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Coverage</span>
        </button>
      </Tooltip>

      <Tooltip label="Show or hide the metre grid">
        <button
          type="button"
          aria-label="Toggle grid"
          aria-pressed={showGrid}
          onClick={() => setShowGrid(!showGrid)}
          className={cn(
            'inline-flex h-11 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors duration-[120ms] lg:h-9',
            showGrid ? 'bg-raised text-ink' : 'text-ink-3 hover:bg-raised hover:text-ink-2'
          )}
        >
          <GridFour size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Grid</span>
        </button>
      </Tooltip>

      <span className="mx-0.5 h-6 w-px bg-line" aria-hidden="true" />

      <label className="flex h-11 cursor-pointer items-center gap-2 rounded-md pl-1 pr-2 text-xs text-ink-2 hover:bg-raised lg:h-9">
        <Switch checked={autoRecolor} onCheckedChange={setAutoRecolor} label="Recolor automatically after edits" />
        <span className="whitespace-nowrap">Auto-recolor</span>
      </label>
    </div>
  );
}
