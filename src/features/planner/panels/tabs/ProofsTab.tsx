import {
  articulationPoints,
  countColorings,
  evaluatePolynomial,
  eulerFormulaCheck,
  formatPolynomial,
  isTriangleFree,
  kuratowskiCheck,
  pigeonholeProof,
  planarBoundCheck,
  triangleFreePlanarCheck,
} from '@/engine';
import { Button } from '@/components/ui/Button';
import { usePlanner } from '../../store/plannerStore';
import { EmptyResult, MetricRow, Note, SectionTitle, StaleNote } from '../parts';

export function ProofsTab() {
  const aps = usePlanner((state) => state.aps);
  const graph = usePlanner((state) => state.graph);
  const stats = usePlanner((state) => state.stats);
  const maxColors = usePlanner((state) => state.maxColors);
  const revision = usePlanner((state) => state.revision);
  const polyRun = usePlanner((state) => state.polyRun);
  const polyStatus = usePlanner((state) => state.polyStatus);
  const computePolynomial = usePlanner((state) => state.computePolynomial);

  if (aps.length === 0) {
    return <EmptyResult title="No graph to prove">Place access points to evaluate the bounds.</EmptyResult>;
  }

  const availableColors = maxColors > 0 ? maxColors : Math.max(1, stats.colors);
  const pigeonhole = pigeonholeProof(graph, availableColors);
  const planar = planarBoundCheck(graph);
  const triangleFree = isTriangleFree(graph);
  const triangleBound = triangleFreePlanarCheck(graph);
  const kuratowski = graph.n <= 20 ? kuratowskiCheck(graph) : null;
  const euler = eulerFormulaCheck(graph);
  const cutVertices = articulationPoints(graph);

  const polyStale = polyRun !== null && polyRun.revision !== revision;
  const counting = graph.n <= 10 ? countColorings(graph, availableColors) : null;

  return (
    <div className="space-y-4">
      <section>
        <SectionTitle>Pigeonhole argument</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-line bg-base/40 p-2">
            <p className="text-[11px] text-ink-3">Clique size ω</p>
            <p className="tnum text-[18px] text-ink">{pigeonhole.needed}</p>
          </div>
          <div className="rounded-md border border-line bg-base/40 p-2">
            <p className="text-[11px] text-ink-3">Channels available</p>
            <p className="tnum text-[18px] text-ink">{availableColors}</p>
          </div>
        </div>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-md border border-line bg-base/40 p-2.5 font-mono text-[11px] leading-relaxed text-ink-2">
          {pigeonhole.proof}
        </pre>
      </section>

      <section>
        <SectionTitle>Planarity</SectionTitle>
        <div className="rounded-md border border-line bg-base/40 px-2.5">
          <MetricRow
            label="Edge bound E ≤ 3V − 6"
            value={`${planar.E} ${planar.isPossiblyPlanar ? '≤' : '>'} ${planar.bound}`}
            tone={planar.isPossiblyPlanar ? 'default' : 'danger'}
          />
          <MetricRow label="Contains triangles" value={triangleFree ? 'No' : 'Yes'} />
          {triangleFree && (
            <MetricRow
              label="Triangle-free bound"
              value={`${triangleBound.E} ${triangleBound.isPossiblyPlanar ? '≤' : '>'} ${triangleBound.bound}`}
              tone={triangleBound.isPossiblyPlanar ? 'default' : 'danger'}
            />
          )}
        </div>
        <div className="mt-2">
          <Note tone={kuratowski?.hasK5 || kuratowski?.hasK33 ? 'danger' : 'neutral'}>
            {kuratowski
              ? kuratowski.nonPlanarEvidence
              : 'Kuratowski subgraph search is skipped above 20 vertices.'}
          </Note>
        </div>
      </section>

      <section>
        <SectionTitle>Euler's formula</SectionTitle>
        <div className="rounded-md border border-line bg-base/40 px-2.5">
          <MetricRow label="V − E + F" value={`${euler.V} − ${euler.E} + ${euler.F} = ${euler.eulerSum}`} />
          <MetricRow label="Faces if connected & planar" value={euler.F} />
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-ink-3">
          A result of 2 is consistent with a connected planar embedding; it is not a planarity test on its own.
        </p>
      </section>

      <section>
        <SectionTitle>Articulation points</SectionTitle>
        {cutVertices.length === 0 ? (
          <Note tone="success">
            None. Removing any single AP leaves the interference network connected.
          </Note>
        ) : (
          <p className="rounded-md border border-line bg-base/40 px-2.5 py-2 text-[12px] text-ink-2">
            <span className="tnum text-ink">{cutVertices.length}</span> cut{' '}
            {cutVertices.length === 1 ? 'vertex' : 'vertices'}:{' '}
            {cutVertices.map((index) => aps[index]?.label ?? `AP${index + 1}`).join(', ')}
          </p>
        )}
      </section>

      <section>
        <SectionTitle>Chromatic polynomial</SectionTitle>
        {graph.n > 12 ? (
          <Note tone="warning">
            Deletion–contraction is exponential. This graph has {graph.n} vertices, above the 12-vertex limit.
          </Note>
        ) : (
          <>
            {polyStale && (
              <StaleNote onRerun={() => void computePolynomial()}>
                The polynomial below was computed for an earlier graph.
              </StaleNote>
            )}
            <Button size="sm" onClick={() => void computePolynomial()} disabled={polyStatus === 'computing'}>
              {polyStatus === 'computing' ? 'Computing…' : polyRun ? 'Recompute P(G, k)' : 'Compute P(G, k)'}
            </Button>
            {polyRun && (
              <div className="mt-2 space-y-2">
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-line bg-base/40 p-2.5 font-mono text-[11px] leading-relaxed text-ink">
                  {`P(G, k) = ${formatPolynomial(polyRun.coeffs)}`}
                </pre>
                <div className="rounded-md border border-line bg-base/40 px-2.5">
                  {Array.from({ length: Math.min(5, graph.n + 1) }, (_, index) => index + 1).map((k) => (
                    <MetricRow
                      key={k}
                      label={`P(G, ${k})`}
                      value={(polyRun.coeffs ? evaluatePolynomial(polyRun.coeffs, k) : 0).toLocaleString()}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section>
        <SectionTitle>Exact coloring count</SectionTitle>
        {counting === null ? (
          <p className="text-[11px] leading-snug text-ink-3">
            Brute-force counting is limited to 10 vertices. This graph has {graph.n}.
          </p>
        ) : (
          <MetricRow
            label={`Valid assignments with k = ${availableColors}`}
            value={counting.toLocaleString()}
            help="Every proper coloring of the graph using at most the available channels."
          />
        )}
      </section>
    </div>
  );
}
