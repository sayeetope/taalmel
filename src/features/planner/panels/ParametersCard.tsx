import { CaretUp } from '@phosphor-icons/react';
import { useState } from 'react';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { cn } from '@/components/ui/cn';
import { usePlanner } from '../store/plannerStore';
import type { AlgorithmKey } from '../store/derive';

export const ALGORITHM_OPTIONS: SelectOption[] = [
  { value: 'dsatur', label: 'DSatur (saturation degree)' },
  { value: 'welsh-powell', label: 'Welsh–Powell (degree order)' },
  { value: 'greedy', label: 'Greedy (natural order)' },
  { value: 'exact', label: 'Exact backtracking (n ≤ 20)' },
];

export const CAPACITY_OPTIONS: SelectOption[] = [
  { value: '3', label: '3 channels — 1, 6, 11' },
  { value: '4', label: '4 channels' },
  { value: '5', label: '5 channels' },
  { value: '0', label: 'Unconstrained (χ)' },
];

export function ParametersCard({ fullWidth = false }: { fullWidth?: boolean }) {
  const [open, setOpen] = useState(true);
  const algorithm = usePlanner((state) => state.algorithm);
  const maxColors = usePlanner((state) => state.maxColors);
  const defaultRadius = usePlanner((state) => state.defaultRadius);
  const separation = usePlanner((state) => state.separation);
  const maxChannel = usePlanner((state) => state.maxChannel);
  const setAlgorithm = usePlanner((state) => state.setAlgorithm);
  const setMaxColors = usePlanner((state) => state.setMaxColors);
  const setDefaultRadius = usePlanner((state) => state.setDefaultRadius);
  const setSeparation = usePlanner((state) => state.setSeparation);
  const setMaxChannel = usePlanner((state) => state.setMaxChannel);

  return (
    <section
      aria-labelledby="parameters-heading"
      className={cn(
        'pointer-events-auto flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-[0_18px_48px_-24px_rgba(0,0,0,0.9)]',
        fullWidth ? 'w-full' : 'h-full w-[248px] xl:w-[272px]'
      )}
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-line px-3">
        <h2 id="parameters-heading" className="text-[13px] font-semibold tracking-[0.01em] text-ink">
          Parameters
        </h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="parameters-body"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex size-7 items-center justify-center rounded-sm text-ink-3 hover:bg-raised hover:text-ink"
        >
          <CaretUp size={14} aria-hidden="true" className={open ? '' : 'rotate-180'} />
          <span className="sr-only">{open ? 'Collapse parameters' : 'Expand parameters'}</span>
        </button>
      </div>

      {!open && (
        <p className="px-3 py-2 text-[11px] leading-snug text-ink-3">
          {maxColors === 0 ? 'χ' : `${maxColors} channels`} · T {separation} · 1–{maxChannel} · {defaultRadius} m
        </p>
      )}

      <div id="parameters-body" hidden={!open} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-2.5">
        <div className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">Spectrum &amp; coloring</h3>
          <Select
            label="Coloring algorithm"
            value={algorithm}
            options={ALGORITHM_OPTIONS}
            onChange={(value) => setAlgorithm(value as AlgorithmKey)}
            help="Saturation-first. Exact search caps at 20 APs."
          />
          <Select
            label="Channel capacity"
            value={String(maxColors)}
            options={CAPACITY_OPTIONS}
            onChange={(value) => setMaxColors(Number(value))}
            help="Caps the palette; unconstrained uses χ."
          />
        </div>

        <div className="space-y-2 border-t border-line pt-2.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
            Propagation &amp; separation
          </h3>
          <Slider
            label="Coverage radius"
            value={defaultRadius}
            min={30}
            max={200}
            step={5}
            unit="m"
            onChange={setDefaultRadius}
            help="Live for inheriting APs; override per AP."
          />
          <Slider
            label="Frequency separation"
            value={separation}
            min={1}
            max={8}
            step={1}
            onChange={setSeparation}
            valueLabel={`T equals ${separation} channels`}
            help="|c₁ − c₂| ≥ T · T = 5 matches 1 / 6 / 11."
          />
          <Slider
            label="Channel span"
            value={maxChannel}
            min={3}
            max={13}
            step={1}
            onChange={setMaxChannel}
            valueLabel={`channels 1 to ${maxChannel}`}
            help={`Searches 1–${maxChannel}.`}
          />
        </div>
      </div>
    </section>
  );
}
