import { useMemo } from 'react';
import { ArrowsOut, ArrowCounterClockwise, Palette } from '@phosphor-icons/react';
import { suggestFixes } from '@/engine';
import { groupColor } from '@/design/channelColors';
import { Slider } from '@/components/ui/Slider';
import { usePlanner, selectChannelAssignment } from '../../store/plannerStore';
import { AccessPointList } from './AccessPointList';
import { EmptyResult, MetricRow, Note, SectionTitle } from '../parts';

export function AnalysisTab() {
  const aps = usePlanner((state) => state.aps);
  const graph = usePlanner((state) => state.graph);
  const coloring = usePlanner((state) => state.coloring);
  const stats = usePlanner((state) => state.stats);
  const selectedId = usePlanner((state) => state.selectedId);
  const defaultRadius = usePlanner((state) => state.defaultRadius);
  const maxColors = usePlanner((state) => state.maxColors);
  const assignment = usePlanner(selectChannelAssignment);
  const setApRadius = usePlanner((state) => state.setApRadius);
  const setApColor = usePlanner((state) => state.setApColor);
  const nudgeAp = usePlanner((state) => state.nudgeAp);
  const requestFit = usePlanner((state) => state.requestFit);

  const groupCount = Math.max(3, stats.colors);
  const counts = new Map<number, number>();
  coloring.forEach((group) => counts.set(group, (counts.get(group) ?? 0) + 1));

  const selectedIndex = aps.findIndex((ap) => ap.id === selectedId);
  const selected = selectedIndex >= 0 ? aps[selectedIndex] : null;
  // Only the four visible repairs are computed: a dense graph can have
  // thousands of conflicting pairs, and this panel renders during scrubbing.
  const fixes = useMemo(
    () => (stats.conflicts > 0 ? suggestFixes(graph, coloring, maxColors || Infinity, 4) : []),
    [graph, coloring, maxColors, stats.conflicts]
  );

  if (aps.length === 0) {
    return <EmptyResult title="No graph yet">Place an access point on the canvas to begin the analysis.</EmptyResult>;
  }

  return (
    <div className="space-y-4">
      <section aria-labelledby="graph-bounds">
        <SectionTitle>Graph bounds</SectionTitle>
        <div className="rounded-md border border-line bg-base/40 px-2.5">
          <MetricRow label="Access points (V)" value={stats.v} />
          <MetricRow label="Interfering pairs (E)" value={stats.e} />
          <MetricRow label="Maximum degree Δ" value={stats.delta} help="Most overlaps touching a single AP." />
          <MetricRow
            label="Clique number ω"
            value={stats.omega === null ? '—' : stats.omega}
            help="Largest set of APs that all overlap each other. A lower bound on channels needed."
          />
          <MetricRow
            label="χ(G) bounds"
            value={stats.omega === null ? `≤ ${stats.chiUpper}` : `${stats.omega} – ${stats.chiUpper}`}
            help="ω ≤ χ(G) ≤ Δ+1. The true chromatic number lies in this interval."
          />
          <MetricRow label="Color groups used" value={stats.colors} />
          <MetricRow
            label="Co-channel conflicts"
            value={stats.conflicts}
            tone={stats.conflicts > 0 ? 'danger' : 'success'}
          />
          <MetricRow
            label="Connected"
            value={stats.connected === null ? '—' : stats.connected ? 'Yes' : 'No'}
          />
          <MetricRow label="Components" value={stats.components ?? '—'} />
        </div>
      </section>

      <section aria-labelledby="selected-ap">
        <SectionTitle>Selected access point</SectionTitle>
        {!selected ? (
          <Note>Select a node on the canvas, or pick one from the list below.</Note>
        ) : (
          <div className="space-y-3 rounded-md border border-line bg-base/40 p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[14px] font-semibold text-ink">{selected.label}</p>
                <p className="tnum mt-0.5 text-[11px] text-ink-3">
                  AP{selected.id} · {Math.round(selected.x)}, {Math.round(selected.y)} m
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-sm border border-line-strong px-1.5 py-0.5 text-[11px] text-ink-2">
                <Palette size={12} aria-hidden="true" />
                {assignment ? `Ch ${assignment[selectedIndex]}` : `Group ${coloring[selectedIndex] ?? 0}`}
              </span>
            </div>

            <Slider
              label="AP coverage radius"
              value={Math.round(selected.radius ?? defaultRadius)}
              min={30}
              max={200}
              step={5}
              unit="m"
              onChange={(value) => setApRadius(selected.id, value)}
              help={
                selected.radius === null
                  ? `Inheriting the default (${defaultRadius} m). Adjusting creates an override for this AP.`
                  : 'Overrides the default for this AP only.'
              }
            />

            <div className="flex flex-wrap gap-1.5">
              {selected.radius !== null && (
                <button
                  type="button"
                  onClick={() => setApRadius(selected.id, null)}
                  className="inline-flex items-center gap-1 rounded-sm border border-line-strong px-2 py-1 text-[11px] text-ink-2 hover:border-ink-3 hover:text-ink"
                >
                  <ArrowCounterClockwise size={12} aria-hidden="true" /> Reset to default
                </button>
              )}
              <button
                type="button"
                onClick={requestFit}
                className="inline-flex items-center gap-1 rounded-sm border border-line-strong px-2 py-1 text-[11px] text-ink-2 hover:border-ink-3 hover:text-ink"
              >
                <ArrowsOut size={12} aria-hidden="true" /> Fit view
              </button>
            </div>
          </div>
        )}
      </section>

      {fixes.length > 0 && (
        <section aria-labelledby="conflict-fixes">
          <SectionTitle>Conflict repairs</SectionTitle>
          <p className="mb-2 text-[11px] leading-snug text-ink-3">
            Suggestions come from the current conflict edges. Each action changes state and re-derives the graph.
          </p>
          <div className="space-y-2">
            {fixes.map((fix) => {
              const target = aps[fix.ap];
              const other = aps[fix.conflictWith];
              if (!target || !other) return null;
              return (
                <div key={`${fix.ap}-${fix.conflictWith}`} className="rounded-md border border-line bg-base/40 p-2">
                  <p className="text-[12px] text-ink">
                    <span className="font-semibold">{target.label}</span> collides with {other.label} · group{' '}
                    {fix.currentColor}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {fix.suggestedColor !== null && (
                      <button
                        type="button"
                        onClick={() => setApColor(fix.ap, fix.suggestedColor as number)}
                        className="rounded-sm border border-line-strong px-2 py-0.5 text-[11px] text-ink-2 hover:border-accent hover:text-accent"
                      >
                        Use group {fix.suggestedColor}
                      </button>
                    )}
                    {fix.suggestedRadius !== null && (
                      <button
                        type="button"
                        onClick={() => setApRadius(fix.ap, fix.suggestedRadius)}
                        className="rounded-sm border border-line-strong px-2 py-0.5 text-[11px] text-ink-2 hover:border-accent hover:text-accent"
                      >
                        Shrink to {fix.suggestedRadius} m
                      </button>
                    )}
                    {fix.suggestedMove && (
                      <button
                        type="button"
                        onClick={() => nudgeAp(fix.ap, fix.suggestedMove?.dx ?? 0, fix.suggestedMove?.dy ?? 0)}
                        className="rounded-sm border border-line-strong px-2 py-0.5 text-[11px] text-ink-2 hover:border-accent hover:text-accent"
                      >
                        Move {fix.suggestedMove.dx} / {fix.suggestedMove.dy} m
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section aria-labelledby="allocation">
        <SectionTitle>Allocation</SectionTitle>
        <div className="grid grid-cols-3 gap-1.5">
          {[...counts.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([group, count]) => (
              <div key={group} className="rounded-md border border-line bg-base/40 px-2 py-1.5">
                <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full ring-1 ring-black/40"
                    style={{ background: groupColor(group, groupCount) }}
                  />
                  Group {group}
                </span>
                <p className="tnum mt-0.5 text-[14px] font-medium text-ink">{count}</p>
              </div>
            ))}
        </div>
        {stats.conflicts === 0 ? (
          <div className="mt-2">
            <Note tone="success">No co-channel conflicts under the current palette.</Note>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="ap-list">
        <SectionTitle>Access points</SectionTitle>
        <AccessPointList />
      </section>
    </div>
  );
}
