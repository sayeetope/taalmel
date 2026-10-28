import type { PlannerAp, GraphStats } from '../store/derive';
import type { Graph } from '@/engine';
import { edgeCount } from '@/engine';
import { getCanvasLayers } from './canvasBus';

export interface TopologyExport {
  aps: PlannerAp[];
  graph: Graph;
  coloring: number[];
  algorithm: string;
  stats: GraphStats;
}

function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportTopologyJson(data: TopologyExport): boolean {
  if (data.aps.length === 0) return false;

  const payload = {
    product: 'Taalमेल',
    exportedAt: new Date().toISOString(),
    aps: data.aps,
    graph: {
      n: data.graph.n,
      adj: data.graph.adj,
      edgeCount: edgeCount(data.graph),
    },
    coloring: data.coloring,
    algorithm: data.algorithm,
    stats: data.stats,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, 'taalmel-topology.json');
  URL.revokeObjectURL(url);
  return true;
}

export function exportCanvasPng(): boolean {
  const layers = getCanvasLayers();
  if (!layers) return false;

  const { staticCanvas, dynamicCanvas } = layers;
  const merged = document.createElement('canvas');
  merged.width = dynamicCanvas.width;
  merged.height = dynamicCanvas.height;
  const ctx = merged.getContext('2d');
  if (!ctx) return false;

  ctx.drawImage(staticCanvas, 0, 0);
  ctx.drawImage(dynamicCanvas, 0, 0);

  triggerDownload(merged.toDataURL('image/png'), 'taalmel-rf-plot.png');
  return true;
}
