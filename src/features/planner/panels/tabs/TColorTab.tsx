import { CircleNotch, Play } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { channelColor } from '@/design/channelColors';
import { usePlanner } from '../../store/plannerStore';
import { EmptyResult, MetricRow, Note, SectionTitle, StaleNote } from '../parts';

export function TColorTab() {
  const aps = usePlanner((state) => state.aps);
  const revision = usePlanner((state) => state.revision);
  const tRun = usePlanner((state) => state.tRun);
  const tStatus = usePlanner((state) => state.tStatus);
  const separation = usePlanner((state) => state.separation);
  const maxChannel = usePlanner((state) => state.maxChannel);
  const runTColor = usePlanner((state) => state.runTColor);
  const setSeparation = usePlanner((state) => state.setSeparation);
  const setMaxChannel = usePlanner((state) => state.setMaxChannel);

  const running = tStatus === 'running';
  const stale = tRun !== null && tRun.revision !== revision;

  const retryWith = async (nextT: number, nextSpan: number) => {
    setSeparation(nextT);
    setMaxChannel(nextSpan);
    await usePlanner.getState().runTColor();
  };

  if (aps.length === 0) {
    return <EmptyResult title="Nothing to color yet">Place access points first, then run the T-coloring solver.</EmptyResult>;
  }

  if (running) {
    return (
      <div className="flex items-center gap-2.5 rounded-md border border-line bg-base/40 px-3 py-4 text-[13px] text-ink-2">
        <CircleNotch size={16} className="animate-spin text-accent" aria-hidden="true" />
        Searching channel assignments in the solver worker…
      </div>
    );
  }

  if (!tRun) {
    return (
      <div className="space-y-3">
        <EmptyResult title="No T-coloring yet">
          Assign channels so every interfering pair differs by at least T. The search runs off the main thread.
        </EmptyResult>
        <Button variant="primary" icon={<Play size={14} aria-hidden="true" />} onClick={() => void runTColor()}>
          Run T-Color
        </Button>
        <p className="text-[11px] leading-snug text-ink-3">
          Current constraint: T = {separation}, channels 1–{maxChannel}.
        </p>
      </div>
    );
  }

  const result = tRun.result;
  const feasible = result !== null;
  const channels = result ? [...new Set(result.assignment)].sort((a, b) => a - b) : [];
  const needsMoreSpan =
    tRun.requiredSpan !== null && tRun.requiredSpan > tRun.maxChannel && tRun.requiredSpan <= 13;

  const why = feasible
    ? ''
    : tRun.omega !== null && tRun.requiredSpan !== null && tRun.requiredSpan > tRun.maxChannel
      ? `The graph contains a clique of ω = ${tRun.omega} APs that all overlap. They need pairwise separation T = ${tRun.T}, which forces a span of at least (ω − 1)·T + 1 = ${tRun.requiredSpan} channels. The configured range 1–${tRun.maxChannel} is only ${tRun.maxChannel} wide, so no assignment can exist.`
      : tRun.omega !== null
        ? `The clique bound alone fits: ω = ${tRun.omega} needs a span of ${tRun.requiredSpan} channels, inside 1–${tRun.maxChannel}. The exhaustive search still found nothing, so the obstruction comes from the wider interference structure rather than one clique.`
        : `The exhaustive search found no assignment of channels 1–${tRun.maxChannel} where every interfering pair differs by at least ${tRun.T}.`;

  return (
    <div className="space-y-4">
      {stale && <StaleNote onRerun={() => void runTColor()}>This result is from an earlier graph or constraint set.</StaleNote>}

      <section>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone={feasible ? 'success' : 'warning'}>{feasible ? 'Feasible' : 'Infeasible'}</Badge>
          <span className="text-[11px] text-ink-3">Solved in {tRun.runtimeMs.toFixed(1)} ms</span>
        </div>
        <h3 className="font-display text-[19px] leading-tight text-ink">
          {feasible ? 'Every interfering pair is separated' : 'No assignment fits these constraints'}
        </h3>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-2">
          {feasible
            ? `A valid T-coloring exists inside channels 1–${tRun.maxChannel}. Nodes now show channel numbers on the canvas.`
            : 'The solver exhausted the search space. This is a constraint diagnosis, not an application error.'}
        </p>
      </section>

      <section>
        <SectionTitle>Parameters</SectionTitle>
        <div className="rounded-md border border-line bg-base/40 px-2.5">
          <MetricRow label="Separation T" value={tRun.T} />
          <MetricRow label="Condition" value={`|c₁ − c₂| ≥ ${tRun.T}`} />
          <MetricRow label="Channel range" value={`1 – ${tRun.maxChannel}`} />
          <MetricRow label="Access points" value={aps.length} />
          {feasible ? (
            <>
              <MetricRow label="Distinct channels" value={result.numDistinct} tone="success" />
              <MetricRow label="Channel span" value={result.span} />
            </>
          ) : (
            <>
              <MetricRow label="Clique number ω" value={tRun.omega ?? '—'} />
              <MetricRow
                label="Span required by clique"
                value={tRun.requiredSpan !== null ? `≥ ${tRun.requiredSpan}` : '—'}
                tone="warning"
              />
            </>
          )}
        </div>
      </section>

      {feasible ? (
        <section>
          <SectionTitle>Assignments</SectionTitle>
          <div className="max-h-64 overflow-y-auto rounded-md border border-line bg-base/40 px-2">
            {result.assignment.map((channel, index) => (
              <div
                key={`assignment-${index}`}
                className="flex items-center justify-between gap-3 border-b border-line/60 py-1.5 last:border-b-0"
              >
                <span className="truncate text-[12px] text-ink">{aps[index]?.label ?? `AP${index + 1}`}</span>
                <span className="flex shrink-0 items-center gap-2 text-[12px] text-ink-2">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full ring-1 ring-black/40"
                    style={{ background: channelColor(channel, tRun.maxChannel) }}
                  />
                  <span className="tnum w-12 text-right text-ink">Ch {channel}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-2">
            <Note tone="success">
              {channels.length} channels in use. The canvas legend lists each assigned channel with its AP count.
            </Note>
            {tRun.T === 5 && channels.every((channel) => [1, 6, 11].includes(channel)) ? (
              <Note>At T = 5 the non-overlapping 2.4 GHz channels are 1, 6 and 11.</Note>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="space-y-2">
          <Note tone="warning">
            <strong className="font-semibold text-ink">Why no assignment exists.</strong> {why}
          </Note>
          <div className="flex flex-wrap gap-2">
            {tRun.T > 1 && (
              <Button size="sm" onClick={() => void retryWith(tRun.T - 1, tRun.maxChannel)}>
                Retry with T = {tRun.T - 1}
              </Button>
            )}
            {tRun.maxChannel < 13 && (
              <Button size="sm" onClick={() => void retryWith(tRun.T, 13)}>
                Retry with span 1–13
              </Button>
            )}
            {needsMoreSpan && tRun.requiredSpan !== null && (
              <Button size="sm" onClick={() => void retryWith(tRun.T, tRun.requiredSpan as number)}>
                Retry with span 1–{tRun.requiredSpan}
              </Button>
            )}
          </div>
          <p className="text-[11px] leading-snug text-ink-3">
            Each button re-runs the solver with the adjusted setting. Nothing is predicted in advance.
          </p>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <Button size="sm" icon={<Play size={13} aria-hidden="true" />} onClick={() => void runTColor()}>
          Re-run T-color
        </Button>
        <span className="text-[11px] text-ink-3">
          T = {separation} · channels 1–{maxChannel}
        </span>
      </div>
    </div>
  );
}
