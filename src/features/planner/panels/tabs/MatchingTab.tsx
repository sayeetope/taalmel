import { bipartiteMatching, channelMatchingModel, hallViolationCheck, isBipartite } from '@/engine';
import { Badge } from '@/components/ui/Badge';
import { usePlanner } from '../../store/plannerStore';
import { EmptyResult, MetricRow, Note, SectionTitle } from '../parts';

export function MatchingTab() {
  const aps = usePlanner((state) => state.aps);
  const graph = usePlanner((state) => state.graph);

  if (aps.length === 0) {
    return <EmptyResult title="No bipartite structure yet">Place access points to inspect matching and Hall's condition.</EmptyResult>;
  }

  const bipartite = isBipartite(graph);

  if (!bipartite.isBipartite || !bipartite.partition) {
    const [a, b] = bipartite.oddCycleEdge ?? [-1, -1];
    return (
      <div className="space-y-3">
        <Badge tone="warning">Not bipartite</Badge>
        <p className="text-[12px] leading-relaxed text-ink-2">
          An odd cycle prevents a two-way split. Hall's theorem and bipartite matching do not apply to the whole graph.
        </p>
        {a >= 0 && (
          <Note>
            One offending edge joins {aps[a]?.label ?? `AP${a + 1}`} and {aps[b]?.label ?? `AP${b + 1}`}. Load the K₃,₃
            preset to explore a bipartite example.
          </Note>
        )}
      </div>
    );
  }

  const [setA, setB] = bipartite.partition;
  const matching = bipartiteMatching(graph);
  const hall = hallViolationCheck(graph);
  const model = channelMatchingModel(graph, 3);

  return (
    <div className="space-y-4">
      <section>
        <SectionTitle>Partition</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-line bg-base/40 p-2">
            <p className="text-[11px] text-ink-3">Set A</p>
            <p className="tnum text-[18px] text-ink">{setA.length}</p>
          </div>
          <div className="rounded-md border border-line bg-base/40 p-2">
            <p className="text-[11px] text-ink-3">Set B</p>
            <p className="tnum text-[18px] text-ink">{setB.length}</p>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Maximum matching</SectionTitle>
        <div className="rounded-md border border-line bg-base/40 px-2.5">
          <MetricRow
            label="Matching cardinality"
            value={`${matching.matchingSize} / ${setA.length}`}
            tone={matching.matchingSize === setA.length ? 'success' : 'warning'}
          />
          <MetricRow label="Unmatched in A" value={matching.unmatchedA?.length ?? 0} />
          <MetricRow label="Unmatched in B" value={matching.unmatchedB?.length ?? 0} />
        </div>
      </section>

      <section>
        <SectionTitle>Hall's condition</SectionTitle>
        <div className="mb-2 flex items-center gap-2">
          <Badge tone={hall.satisfiesHall ? 'success' : 'warning'}>
            {hall.satisfiesHall === null ? 'Not applicable' : hall.satisfiesHall ? 'Satisfied' : 'Violated'}
          </Badge>
          {hall.deficit !== undefined && <span className="text-[11px] text-ink-3">Deficit {hall.deficit}</span>}
        </div>
        {hall.proof && (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-line bg-base/40 p-2.5 font-mono text-[11px] leading-relaxed text-ink-2">
            {hall.proof}
          </pre>
        )}
      </section>

      <section>
        <SectionTitle>Channel model (3 channels)</SectionTitle>
        <p className="mb-2 text-[11px] leading-snug text-ink-3">
          This simplified model connects every AP to every channel and ignores interference edges. It demonstrates
          matching cardinality, not a valid channel plan.
        </p>
        <div className="rounded-md border border-line bg-base/40 px-2.5">
          <MetricRow label="Matching cardinality" value={`${model.matchingSize} / ${aps.length}`} />
          <MetricRow
            label="Saturating assignment"
            value={model.allAssigned ? 'Yes' : 'No'}
            tone={model.allAssigned ? 'success' : 'warning'}
          />
        </div>
        <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-line bg-base/40 px-2">
          {model.assignment.map((channel, index) => (
            <div
              key={aps[index]?.id ?? index}
              className="flex items-center justify-between border-b border-line/60 py-1.5 text-[12px] last:border-b-0"
            >
              <span className="truncate text-ink">{aps[index]?.label ?? `AP${index + 1}`}</span>
              <span className="tnum text-ink-2">{channel === -1 ? 'unmatched' : `Channel ${channel}`}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
