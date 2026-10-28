import { CircleNotch, Play } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usePlanner } from '../../store/plannerStore';
import { EmptyResult, Note, StaleNote } from '../parts';

export function BenchmarkTab() {
  const graph = usePlanner((state) => state.graph);
  const stats = usePlanner((state) => state.stats);
  const revision = usePlanner((state) => state.revision);
  const benchRun = usePlanner((state) => state.benchRun);
  const running = usePlanner((state) => state.running);
  const runBenchmark = usePlanner((state) => state.runBenchmark);

  if (graph.n === 0) {
    return <EmptyResult title="Nothing to benchmark">Place access points, then compare the coloring algorithms.</EmptyResult>;
  }

  const stale = benchRun !== null && benchRun.revision !== revision;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-semibold text-ink">Algorithm comparison</h3>
          <p className="text-[11px] text-ink-3">{graph.n} APs · {stats.e} interfering pairs</p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => void runBenchmark()}
          disabled={running === 'benchmark'}
          icon={
            running === 'benchmark' ? (
              <CircleNotch size={13} className="animate-spin" aria-hidden="true" />
            ) : (
              <Play size={13} aria-hidden="true" />
            )
          }
        >
          {running === 'benchmark' ? 'Running…' : benchRun ? 'Run again' : 'Run benchmark'}
        </Button>
      </div>

      {stale && <StaleNote onRerun={() => void runBenchmark()}>These timings are from an earlier graph.</StaleNote>}

      {!benchRun && running !== 'benchmark' && (
        <Note>
          Runs greedy, Welsh–Powell, DSatur and exact backtracking on the current graph. Exact search is attempted at
          20 vertices or fewer.
        </Note>
      )}

      {benchRun && (
        <>
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full border-collapse text-left text-[12px]">
              <thead>
                <tr className="border-b border-line bg-base/60 text-[11px] text-ink-3">
                  <th scope="col" className="px-2.5 py-1.5 font-medium">Algorithm</th>
                  <th scope="col" className="px-2.5 py-1.5 text-right font-medium">Groups</th>
                  <th scope="col" className="px-2.5 py-1.5 text-right font-medium">ms</th>
                  <th scope="col" className="px-2.5 py-1.5 font-medium">Optimal</th>
                </tr>
              </thead>
              <tbody>
                {benchRun.rows.map((row) => (
                  <tr key={row.algorithm} className="border-b border-line/60 last:border-b-0">
                    <td className="px-2.5 py-1.5 text-ink">{row.algorithm}</td>
                    <td className="tnum px-2.5 py-1.5 text-right text-ink">{row.colors}</td>
                    <td className="tnum px-2.5 py-1.5 text-right text-ink-2">{row.time}</td>
                    <td className="px-2.5 py-1.5">
                      {row.optimal === null ? (
                        <span className="text-ink-3">—</span>
                      ) : (
                        <Badge tone={row.optimal ? 'success' : 'neutral'}>{row.optimal ? 'Optimal' : 'Above χ'}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] leading-snug text-ink-3">
            Single-run timings measured in this browser; values vary between machines. Where exact search is
            available, “Optimal” means the group count matches the chromatic number.
          </p>
        </>
      )}
    </div>
  );
}
