import { CircleNotch, Play, XCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usePlanner } from '../../store/plannerStore';
import { Note } from '../parts';

export function TestsTab() {
  const testRun = usePlanner((state) => state.testRun);
  const running = usePlanner((state) => state.running);
  const runTests = usePlanner((state) => state.runTests);

  const passed = testRun ? testRun.rows.filter((row) => row.passed === true || row.passed === 'N/A').length : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-semibold text-ink">Known-graph test suite</h3>
          <p className="text-[11px] text-ink-3">
            {testRun ? `${passed} / ${testRun.rows.length} checks pass` : 'Seven reference graphs'}
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => void runTests()}
          disabled={running === 'tests'}
          icon={
            running === 'tests' ? (
              <CircleNotch size={13} className="animate-spin" aria-hidden="true" />
            ) : (
              <Play size={13} aria-hidden="true" />
            )
          }
        >
          {running === 'tests' ? 'Running…' : testRun ? 'Run again' : 'Run tests'}
        </Button>
      </div>

      {!testRun && running !== 'tests' && (
        <Note>
          Computes the exact chromatic number of each reference graph and compares it with the expected value and the
          clique lower bound.
        </Note>
      )}

      {testRun && (
        <div className="space-y-1.5">
          {testRun.rows.map((row) => {
            const ok = row.passed === true || row.passed === 'N/A';
            return (
              <div
                key={row.name}
                className={`rounded-md border px-2.5 py-2 ${
                  ok ? 'border-line bg-base/40' : 'border-danger/50 bg-danger-soft'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-ink">{row.name}</p>
                    <p className="tnum mt-0.5 text-[11px] text-ink-3">
                      χ = {row.exactChi} · expected {row.expectedChi} · DSatur {row.dsaturChi} · ω {row.cliqueNumber}
                    </p>
                  </div>
                  <Badge tone={ok ? 'success' : 'danger'} icon={ok ? undefined : <XCircle size={11} aria-hidden="true" />}>
                    {row.passed === 'N/A' ? 'N/A' : ok ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
