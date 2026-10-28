import { useRef } from 'react';
import { CaretDown, FileImage, FileJs } from '@phosphor-icons/react';
import { exportCanvasPng, exportTopologyJson } from '../lib/exporters';
import { usePlanner } from '../store/plannerStore';

export function ExportMenu() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const addToast = usePlanner((state) => state.addToast);

  const close = () => detailsRef.current?.removeAttribute('open');

  const handleJson = () => {
    const state = usePlanner.getState();
    const ok = exportTopologyJson({
      aps: state.aps,
      graph: state.graph,
      coloring: state.coloring,
      algorithm: state.algorithm,
      stats: state.stats,
    });
    addToast(ok ? 'Exported topology as JSON' : 'Nothing to export yet', ok ? 'success' : 'warning');
    close();
  };

  const handlePng = () => {
    const ok = exportCanvasPng();
    addToast(ok ? 'Exported the RF plot as PNG' : 'The canvas is not ready to export', ok ? 'success' : 'warning');
    close();
  };

  return (
    <details ref={detailsRef} className="group relative">
      <summary className="inline-flex h-11 cursor-pointer list-none items-center gap-1.5 rounded-md border border-line-strong bg-raised px-2.5 text-xs font-medium text-ink hover:border-ink-3 lg:h-9 [&::-webkit-details-marker]:hidden">
        <span>Export</span>
        <CaretDown size={12} aria-hidden="true" className="text-ink-3 group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-11 z-40 w-52 overflow-hidden rounded-md border border-line bg-surface p-1 shadow-[0_18px_48px_-24px_rgba(0,0,0,0.9)]">
        <button
          type="button"
          onClick={handleJson}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-xs text-ink-2 hover:bg-raised hover:text-ink"
        >
          <FileJs size={15} aria-hidden="true" /> Topology JSON
        </button>
        <button
          type="button"
          onClick={handlePng}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-xs text-ink-2 hover:bg-raised hover:text-ink"
        >
          <FileImage size={15} aria-hidden="true" /> RF plot PNG
        </button>
      </div>
    </details>
  );
}
