import { WarningCircle } from '@phosphor-icons/react';
import { channelColor } from '@/design/channelColors';
import { usePlanner, selectChannelAssignment, selectTColorStale } from '../store/plannerStore';

export function StatusStrip() {
  const stats = usePlanner((state) => state.stats);
  const aps = usePlanner((state) => state.aps);
  const coloring = usePlanner((state) => state.coloring);
  const selectedId = usePlanner((state) => state.selectedId);
  const maxChannel = usePlanner((state) => state.maxChannel);
  const tRun = usePlanner((state) => state.tRun);
  const stale = usePlanner(selectTColorStale);
  const assignment = usePlanner(selectChannelAssignment);
  const defaultRadius = usePlanner((state) => state.defaultRadius);
  const separations = usePlanner((state) => state.separation);

  const selectedIndex = aps.findIndex((ap) => ap.id === selectedId);
  const selected = selectedIndex >= 0 ? aps[selectedIndex] : null;
  const selectedChannel = assignment && selectedIndex >= 0 ? assignment[selectedIndex] : null;

  const freshness = stale
    ? `T-color stale · T ${separations}`
    : tRun?.result
      ? `T-color fresh · T ${tRun.T}`
      : tRun
        ? `T-color infeasible · T ${tRun.T}`
        : 'T-color not run';

  return (
    <footer className="flex h-9 shrink-0 items-center gap-2 overflow-x-auto border-t border-line bg-surface px-3 text-[11px] text-ink-3">
      <span className="tnum shrink-0 whitespace-nowrap">
        <span className="text-ink">{stats.v}</span> APs
      </span>
      <span aria-hidden="true" className="text-line-strong">/</span>
      <span className="tnum shrink-0 whitespace-nowrap">{stats.e} interfering pairs</span>
      <span aria-hidden="true" className="text-line-strong">/</span>
      <span className="tnum shrink-0 whitespace-nowrap">{stats.colors} groups</span>
      <span aria-hidden="true" className="text-line-strong">/</span>
      <span
        className={
          stats.conflicts > 0
            ? 'flex shrink-0 items-center gap-1 whitespace-nowrap text-danger'
            : 'tnum shrink-0 whitespace-nowrap text-ink-2'
        }
      >
        {stats.conflicts > 0 && <WarningCircle size={12} aria-hidden="true" />}
        {stats.conflicts} {stats.conflicts === 1 ? 'conflict' : 'conflicts'}
      </span>

      {selected && (
        <>
          <span aria-hidden="true" className="text-line-strong">/</span>
          <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-ink-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full ring-1 ring-black/40"
              style={{
                background: selectedChannel
                  ? channelColor(selectedChannel, Math.max(13, maxChannel))
                  : `var(--color-line-strong)`,
              }}
            />
            {selected.label} · {selectedChannel ? `Ch ${selectedChannel}` : `Group ${coloring[selectedIndex] ?? 0}`} ·{' '}
            {Math.round(selected.radius ?? defaultRadius)} m
          </span>
        </>
      )}

      <span className="ml-auto flex shrink-0 items-center gap-2 pl-2">
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${stale ? 'bg-warning' : tRun ? 'bg-success' : 'bg-line-strong'}`}
        />
        <span className="whitespace-nowrap">{freshness}</span>
      </span>
    </footer>
  );
}
