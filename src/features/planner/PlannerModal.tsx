import { useEffect, useState } from 'react';
import { FolderOpen, Presentation, X } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/Dialog';
import { Button, IconButton } from '@/components/ui/Button';
import { Toasts } from '@/components/ui/Toasts';
import { Tooltip } from '@/components/ui/Tooltip';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/components/ui/cn';
import { CanvasStage } from './canvas/CanvasStage';
import { ActionBar } from './chrome/ActionBar';
import { ToolDock } from './chrome/ToolDock';
import { StatusStrip } from './chrome/StatusStrip';
import { ExportMenu } from './chrome/ExportMenu';
import { PresetsDialog } from './chrome/PresetsDialog';
import { DemoDialog } from './chrome/DemoDialog';
import { ParametersCard } from './panels/ParametersCard';
import { ResultsDrawer } from './panels/ResultsDrawer';
import { useMediaQuery } from './hooks/useMediaQuery';
import { usePlanner } from './store/plannerStore';

type MobileView = 'graph' | 'params' | 'results';

const VIEWS: Array<{ value: MobileView; label: string }> = [
  { value: 'graph', label: 'Graph' },
  { value: 'params', label: 'Parameters' },
  { value: 'results', label: 'Results' },
];

export function PlannerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mobileView, setMobileView] = useState<MobileView>('graph');
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const maxChannel = usePlanner((state) => state.maxChannel);
  const conflicts = usePlanner((state) => state.stats.conflicts);
  const toasts = usePlanner((state) => state.toasts);
  const dismissToast = usePlanner((state) => state.dismissToast);

  useEffect(() => {
    if (open) setMobileView('graph');
  }, [open]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent
            labelledBy="planner-title"
            describedBy="planner-description"
            className="inset-0 lg:inset-3"
            onInteractOutside={(event) => {
              // Presets, demo and the toast stack are portalled siblings, not
              // children of this content. Without this the outer modal treats
              // their clicks as outside clicks and closes the whole planner,
              // which would make "Undo" impossible to press.
              if (presetsOpen || demoOpen) event.preventDefault();
            }}
            onEscapeKeyDown={(event) => {
              if (presetsOpen || demoOpen) event.preventDefault();
            }}
          >
            <div className="flex h-dvh w-full flex-col overflow-hidden border border-line bg-base lg:h-full lg:rounded-lg">
              <DialogTitle id="planner-title" className="sr-only">
                Taalमेल planning workspace
              </DialogTitle>
              <DialogDescription id="planner-description" className="sr-only">
                A dark interference canvas with access points, coverage discs and channel assignments. Use the tool dock
                to add, select or delete APs, the parameters panel to change radius and separation, and the results
                drawer to run coloring, proofs, matching, benchmarks and tests. The canvas is operated with the pointer;
                an equivalent access-point list in the Analysis tab supports the keyboard.
              </DialogDescription>

              <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-3">
                <Logo compact />
                <span aria-hidden="true" className="hidden h-6 w-px bg-line sm:block" />
                <span className="hidden text-[11px] leading-tight text-ink-3 md:block">
                  Interference
                  <br />
                  workspace
                </span>

                <div className="ml-auto flex items-center gap-1.5">
                  <span className="tnum mr-1 hidden items-center rounded-sm border border-line px-2 py-1 text-[10px] text-ink-3 xl:flex">
                    2.4 GHz · Ch 1–{maxChannel}
                  </span>
                  <ExportMenu />
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Open presets"
                    onClick={() => setPresetsOpen(true)}
                    icon={<FolderOpen size={16} aria-hidden="true" />}
                    className="h-9 px-2"
                  >
                    <span className="hidden sm:inline">Presets</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Demo & Viva script"
                    onClick={() => setDemoOpen(true)}
                    icon={<Presentation size={16} aria-hidden="true" />}
                    className="h-9 px-2"
                  >
                    <span className="hidden lg:inline">Demo &amp; Viva</span>
                  </Button>
                  <Tooltip label="Close planner (Esc)">
                    <IconButton
                      label="Close planner"
                      icon={<X size={18} aria-hidden="true" />}
                      onClick={onClose}
                      className="text-ink-2 max-lg:size-11"
                    />
                  </Tooltip>
                </div>
              </header>

              {!isDesktop && (
                <nav aria-label="Planner view" className="flex shrink-0 gap-1 border-b border-line bg-surface px-2 py-1.5">
                  {VIEWS.map((view) => (
                    <button
                      key={view.value}
                      type="button"
                      aria-pressed={mobileView === view.value}
                      onClick={() => setMobileView(view.value)}
                      className={cn(
                        'inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium',
                        mobileView === view.value ? 'bg-raised text-ink' : 'text-ink-3 hover:bg-raised hover:text-ink-2'
                      )}
                    >
                      {view.label}
                      {view.value === 'graph' && conflicts > 0 && (
                        <span className="tnum rounded-full bg-danger-soft px-1.5 text-[10px] text-danger">{conflicts}</span>
                      )}
                    </button>
                  ))}
                </nav>
              )}

              <div className="relative min-h-0 flex-1">
                <div className={cn('absolute inset-0', !isDesktop && mobileView !== 'graph' && 'hidden')}>
                  <CanvasStage />
                </div>

                {isDesktop ? (
                  <>
                    <div className="absolute bottom-3 left-3 top-3 z-20 flex w-[248px] flex-col gap-2 xl:w-[272px]">
                      <ToolDock compact />
                      <div className="min-h-0 flex-1 overflow-hidden">
                        <ParametersCard />
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 top-3 z-20">
                      <ResultsDrawer />
                    </div>

                    <div className="pointer-events-none absolute bottom-3 left-[276px] right-[352px] z-20 flex justify-center xl:left-[300px] xl:right-[376px]">
                      <ActionBar />
                    </div>
                  </>
                ) : (
                  <>
                    {mobileView === 'graph' && (
                      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-col items-center gap-2">
                        <ToolDock compact />
                        <ActionBar />
                      </div>
                    )}

                    {mobileView === 'params' && (
                      <div className="absolute inset-0 overflow-y-auto p-3 pb-8">
                        <ParametersCard fullWidth />
                      </div>
                    )}

                    {mobileView === 'results' && (
                      <div className="absolute inset-0 overflow-y-auto p-3 pb-8">
                        <ResultsDrawer fullWidth />
                      </div>
                    )}
                  </>
                )}
              </div>

              <StatusStrip />
            </div>
            <Toasts items={toasts} onDismiss={dismissToast} />
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <PresetsDialog open={presetsOpen} onOpenChange={setPresetsOpen} />
      <DemoDialog open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  );
}
