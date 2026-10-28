import { TabTrigger, Tabs, TabsContent, TabsList } from '@/components/ui/Tabs';
import { cn } from '@/components/ui/cn';
import { usePlanner, selectTColorStale, type ResultTab } from '../store/plannerStore';
import { AnalysisTab } from './tabs/AnalysisTab';
import { ProofsTab } from './tabs/ProofsTab';
import { MatchingTab } from './tabs/MatchingTab';
import { TColorTab } from './tabs/TColorTab';
import { BenchmarkTab } from './tabs/BenchmarkTab';
import { TestsTab } from './tabs/TestsTab';

const TABS: Array<{ value: ResultTab; label: string }> = [
  { value: 'analysis', label: 'Analysis' },
  { value: 'proofs', label: 'Proofs' },
  { value: 'matching', label: 'Matching' },
  { value: 'tcolor', label: 'T-Coloring' },
  { value: 'benchmark', label: 'Benchmark' },
  { value: 'tests', label: 'Tests' },
];

export function ResultsDrawer({ fullWidth = false }: { fullWidth?: boolean }) {
  const tab = usePlanner((state) => state.activeTab);
  const setTab = usePlanner((state) => state.setActiveTab);
  const stale = usePlanner(selectTColorStale);
  const tRunning = usePlanner((state) => state.tStatus === 'running');

  return (
    <section
      aria-labelledby="results-heading"
      className={cn(
        'pointer-events-auto flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-[0_18px_48px_-24px_rgba(0,0,0,0.9)]',
        fullWidth ? 'w-full' : 'w-[336px] xl:w-[348px]'
      )}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-line px-3">
        <h2 id="results-heading" className="text-[13px] font-semibold tracking-[0.01em] text-ink">
          Results
        </h2>
        <span className="text-[11px] text-ink-3">Derived from the current graph</span>
      </div>

      <div className="min-h-0 flex-1 p-2.5">
        <Tabs value={tab} onValueChange={(value) => setTab(value as ResultTab)}>
          <TabsList label="Analysis modes">
            {TABS.map((item) => (
              <TabTrigger
                key={item.value}
                value={item.value}
                badge={
                  item.value === 'tcolor' && (stale || tRunning) ? (
                    <span
                      aria-hidden="true"
                      className={`absolute right-1 top-1 size-1.5 rounded-full ${
                        tRunning ? 'bg-accent' : 'bg-warning'
                      }`}
                    />
                  ) : undefined
                }
              >
                {item.label}
                {item.value === 'tcolor' && (stale || tRunning) ? (
                  <span className="sr-only">{tRunning ? ', running' : ', stale'}</span>
                ) : null}
              </TabTrigger>
            ))}
          </TabsList>

          <TabsContent value="analysis"><AnalysisTab /></TabsContent>
          <TabsContent value="proofs"><ProofsTab /></TabsContent>
          <TabsContent value="matching"><MatchingTab /></TabsContent>
          <TabsContent value="tcolor"><TColorTab /></TabsContent>
          <TabsContent value="benchmark"><BenchmarkTab /></TabsContent>
          <TabsContent value="tests"><TestsTab /></TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
