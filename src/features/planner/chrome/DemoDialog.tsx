import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/Dialog';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { exportCanvasPng } from '../lib/exporters';
import { usePlanner } from '../store/plannerStore';

interface Step {
  title: string;
  body: string;
  action: string;
  run: () => void;
}

export function DemoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const loadPreset = usePlanner((state) => state.loadPreset);

  const steps: Step[] = [
    {
      title: 'Open the campus',
      body: 'Twelve deployments, each with an 80 m coverage radius. Overlaps become interference edges before anything is colored.',
      action: 'Load campus demo',
      run: () => loadPreset('campus'),
    },
    {
      title: 'Color the interference graph',
      body: 'DSatur colors the most constrained AP first. Three groups are enough for this topology, matching channels 1, 6 and 11.',
      action: 'Recolor',
      run: () => usePlanner.getState().recolor(),
    },
    {
      title: 'Run the T-coloring solver',
      body: 'Assign real channel numbers so every interfering pair differs by at least T = 5. The result is computed, not scripted.',
      action: 'Run T-Color',
      run: () => void usePlanner.getState().runTColor(),
    },
    {
      title: 'Show an infeasible constraint',
      body: 'Four APs that all overlap need a span of 16 channels at T = 5. With channels 1–13 the solver must return no assignment.',
      action: 'Load 4-clique + solve',
      run: () => {
        const state = usePlanner.getState();
        state.loadPreset('pigeonholeCrowded');
        state.setSeparation(5);
        state.setMaxChannel(13);
        void usePlanner.getState().runTColor();
      },
    },
    {
      title: 'Check the solver against known graphs',
      body: 'K₄, C₅, K₅, K₃,₃, Petersen and the Hall bottleneck are checked against their exact chromatic numbers.',
      action: 'Run test suite',
      run: () => void usePlanner.getState().runTests(),
    },
    {
      title: 'Export the evidence',
      body: 'The PNG is the actual plotted canvas; the JSON carries AP positions, radii, adjacency and the coloring.',
      action: 'Export PNG',
      run: () => {
        const ok = exportCanvasPng();
        usePlanner.getState().addToast(ok ? 'Exported the RF plot as PNG' : 'Nothing to export yet', ok ? 'success' : 'warning');
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          labelledBy="demo-title"
          describedBy="demo-description"
          className="left-1/2 top-1/2 max-h-[86dvh] w-[min(640px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-line bg-surface p-5 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle id="demo-title" className="font-display text-2xl text-ink">
                Demo &amp; viva script
              </DialogTitle>
              <DialogDescription id="demo-description" className="mt-1 text-xs text-ink-3">
                Six steps that exercise the real engine. Each button acts on the live planner.
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close demo script"
              className="inline-flex size-8 items-center justify-center rounded-md text-ink-3 hover:bg-raised hover:text-ink"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <ol className="mt-4 space-y-2">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-md border border-line bg-base/50 p-3">
                <div className="flex items-start gap-3">
                  <span className="tnum flex size-6 shrink-0 items-center justify-center rounded-full border border-line-strong text-[11px] text-ink-2">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-ink">{step.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink-3">{step.body}</p>
                  </div>
                </div>
                <div className="mt-2 pl-9">
                  <Button
                    size="sm"
                    onClick={() => {
                      step.run();
                      onOpenChange(false);
                    }}
                  >
                    {step.action}
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
