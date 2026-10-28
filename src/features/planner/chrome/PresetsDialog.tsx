import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/Dialog';
import { X } from '@phosphor-icons/react';
import { CAMPUS_APS, PRESET_KEYS, TEST_GRAPHS, buildInterferenceGraph, edgeCount } from '@/engine';
import { usePlanner } from '../store/plannerStore';
import type { PresetKey } from '@/engine';

interface PresetMeta {
  key: PresetKey;
  name: string;
  apCount: number;
  edgeCount: number;
  note: string;
  chi?: number;
}

const PRESETS: PresetMeta[] = PRESET_KEYS.map((key) => {
  if (key === 'campus') {
    return {
      key,
      name: 'Campus Enterprise',
      apCount: CAMPUS_APS.length,
      edgeCount: edgeCount(
        buildInterferenceGraph(
          CAMPUS_APS.map((ap) => ({ x: ap.x, y: ap.y })),
          CAMPUS_APS.map(() => 80)
        )
      ),
      note: 'Twelve campus deployments: library, labs, hostels, a lecture hall and the auditorium.',
    };
  }
  const graph = TEST_GRAPHS[key];
  return {
    key,
    name: graph.expected.name,
    apCount: graph.n,
    edgeCount: edgeCount(graph),
    note: graph.note,
    chi: graph.expected.chi,
  };
});

export function PresetsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const loadPreset = usePlanner((state) => state.loadPreset);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          labelledBy="presets-title"
          describedBy="presets-description"
          className="left-1/2 top-1/2 max-h-[86dvh] w-[min(720px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-line bg-surface p-5 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle id="presets-title" className="font-display text-2xl text-ink">
                Reference topologies
              </DialogTitle>
              <DialogDescription id="presets-description" className="mt-1 text-xs text-ink-3">
                Loading a preset replaces the current APs and re-colors the graph.
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close presets"
              className="inline-flex size-8 items-center justify-center rounded-md text-ink-3 hover:bg-raised hover:text-ink"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  loadPreset(preset.key);
                  onOpenChange(false);
                }}
                className="rounded-md border border-line bg-base/50 p-3 text-left transition-colors hover:border-accent/60 hover:bg-raised"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-[17px] text-ink">{preset.name}</span>
                  <span className="tnum shrink-0 text-[10px] text-ink-3">
                    {preset.apCount} APs · {preset.edgeCount} edges
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-3">{preset.note}</p>
                {preset.chi !== undefined && (
                  <p className="tnum mt-1.5 text-[10px] text-ink-2">χ = {preset.chi}</p>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
