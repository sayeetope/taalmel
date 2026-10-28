import type { Graph, Point } from '@/engine';
import { channelColor, groupColor } from '@/design/channelColors';
import type { PlannerAp } from '../store/derive';
import { NODE_RADIUS_PX } from './hitTest';
import { conflictMarkerSprite, coverageSprite, withAlpha } from './sprites';
import { scaleBar, type View } from './view';

export interface CanvasData {
  aps: PlannerAp[];
  defaultRadius: number;
  graph: Graph;
  coloring: number[];
  channels: number[] | null;
  separation: number;
  groupCount: number;
  selectedId: number | null;
  hoveredId: number | null;
  showCoverage: boolean;
  showGrid: boolean;
  showGhost: boolean;
}

const COLORS = {
  canvas: '#080b16',
  grid: '#1b2440',
  edge: '#5f6a9e',
  edgeActive: '#aab1cc',
  ink: '#eef0f8',
  ink2: '#aab1cc',
  accent: '#ffb224',
  danger: '#ff5c3a',
  nodeText: '#0a0d1a',
  nodeRim: '#05070f',
};

const LABEL_FONT = '500 12px Hind, ui-sans-serif, sans-serif';
const NODE_FONT = '600 13px "JetBrains Mono", ui-monospace, monospace';
const SCALE_FONT = '500 11px "JetBrains Mono", ui-monospace, monospace';

/** Canvas painter: a cached static grid plus a dirty-flagged dynamic layer. */
export class GraphRenderer {
  private staticCtx: CanvasRenderingContext2D;
  private dynamicCtx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private data: CanvasData | null = null;
  private view: View = { scale: 1, tx: 0, ty: 0 };
  private transient: { id: number; pos: Point } | null = null;
  private ghost: Point | null = null;
  private frameTimes: number[] = [];
  private staticDirty = true;

  constructor(
    private staticCanvas: HTMLCanvasElement,
    private dynamicCanvas: HTMLCanvasElement
  ) {
    const staticCtx = staticCanvas.getContext('2d');
    const dynamicCtx = dynamicCanvas.getContext('2d');
    if (!staticCtx || !dynamicCtx) throw new Error('Canvas 2D is unavailable');
    this.staticCtx = staticCtx;
    this.dynamicCtx = dynamicCtx;
  }

  resize(cssWidth: number, cssHeight: number, dpr: number): void {
    const ratio = Math.min(dpr, 2);
    if (this.width === cssWidth && this.height === cssHeight && this.dpr === ratio) return;
    this.width = cssWidth;
    this.height = cssHeight;
    this.dpr = ratio;

    for (const canvas of [this.staticCanvas, this.dynamicCanvas]) {
      canvas.width = Math.max(1, Math.round(cssWidth * ratio));
      canvas.height = Math.max(1, Math.round(cssHeight * ratio));
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
    }

    this.staticCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.dynamicCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.staticDirty = true;
  }

  setData(data: CanvasData): void {
    this.data = data;
    if (data.showGrid !== this.lastShowGrid) this.staticDirty = true;
    this.lastShowGrid = data.showGrid;
  }

  private lastShowGrid: boolean | null = null;

  setView(view: View): void {
    this.view = view;
    this.staticDirty = true;
  }

  getView(): View {
    return this.view;
  }

  setTransient(id: number | null, pos: Point | null): void {
    this.transient = id !== null && pos ? { id, pos } : null;
  }

  setGhost(pos: Point | null): void {
    this.ghost = pos;
  }

  drawStatic(): void {
    const ctx = this.staticCtx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = COLORS.canvas;
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.data?.showGrid) {
      ctx.strokeStyle = withAlpha(COLORS.grid, 0.9);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0.5; x < this.width; x += 32) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
      }
      for (let y = 0.5; y < this.height; y += 32) {
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
      }
      ctx.stroke();
    }

    this.staticDirty = false;
  }

  draw(): void {
    const started = performance.now();
    if (this.staticDirty) this.drawStatic();
    const ctx = this.dynamicCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    const data = this.data;
    if (!data || data.aps.length === 0) {
      this.recordFrame(started);
      return;
    }

    const { scale, tx, ty } = this.view;
    const positions: Point[] = new Array(data.aps.length);
    for (let i = 0; i < data.aps.length; i++) {
      const ap = data.aps[i];
      const override = this.transient && this.transient.id === ap.id ? this.transient.pos : null;
      const x = override ? override.x : ap.x;
      const y = override ? override.y : ap.y;
      positions[i] = { x: x * scale + tx, y: y * scale + ty };
    }

    const nodeColors: string[] = new Array(data.aps.length);
    for (let i = 0; i < data.aps.length; i++) {
      nodeColors[i] = data.channels
        ? channelColor(data.channels[i], Math.max(13, data.channels[i]))
        : groupColor(data.coloring[i] ?? 0, Math.max(3, data.groupCount));
    }

    // ── Coverage context ──────────────────────────────────────────
    if (data.showCoverage) {
      for (let i = 0; i < data.aps.length; i++) {
        const ap = data.aps[i];
        const radiusPx = (ap.radius ?? data.defaultRadius) * scale;
        if (radiusPx < 2) continue;
        const point = positions[i];
        ctx.drawImage(coverageSprite(nodeColors[i]), point.x - radiusPx, point.y - radiusPx, radiusPx * 2, radiusPx * 2);
        ctx.beginPath();
        ctx.arc(point.x, point.y, radiusPx, 0, Math.PI * 2);
        ctx.strokeStyle = withAlpha(nodeColors[i], 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // ── Interference edges ────────────────────────────────────────
    // Batched into one path per style. At 150 APs a dense graph has ~10k
    // pairs; per-edge save/restore, dash setup and colour formatting was the
    // dominant frame cost (83 ms → measured again after batching).
    const conflictMarkers: Array<{ x: number; y: number }> = [];
    const normalPath = new Path2D();
    const activePath = new Path2D();
    const conflictPath = new Path2D();
    const conflictActivePath = new Path2D();
    const { adj, n } = data.graph;

    for (let i = 0; i < n; i++) {
      const a = positions[i];
      const row = adj[i];
      for (let j = i + 1; j < n; j++) {
        if (!row[j]) continue;
        const b = positions[j];
        const conflict = data.channels
          ? Math.abs((data.channels[i] ?? 0) - (data.channels[j] ?? 0)) < data.separation
          : (data.coloring[i] ?? -1) === (data.coloring[j] ?? -2);
        const active =
          data.selectedId !== null && (data.aps[i].id === data.selectedId || data.aps[j].id === data.selectedId);

        const path = conflict
          ? active
            ? conflictActivePath
            : conflictPath
          : active
            ? activePath
            : normalPath;
        path.moveTo(a.x, a.y);
        path.lineTo(b.x, b.y);

        if (conflict) conflictMarkers.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      }
    }

    ctx.lineCap = 'butt';
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(95, 106, 158, 0.4)';
    ctx.lineWidth = 1.1;
    ctx.stroke(normalPath);

    ctx.strokeStyle = 'rgba(170, 177, 204, 0.85)';
    ctx.lineWidth = 1.6;
    ctx.stroke(activePath);

    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(255, 92, 58, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke(conflictPath);

    ctx.strokeStyle = '#ff5c3a';
    ctx.lineWidth = 1.9;
    ctx.stroke(conflictActivePath);
    ctx.setLineDash([]);

    // Small diamond + bang: conflicts are never signalled by colour alone.
    // The icon is a cached sprite so a dense graph does not rebuild it per pair.
    // While a node is in flight the dashed edges still mark conflicts; the
    // icons return on release, so the drag frame stays inside its budget.
    if (this.transient === null) {
      const marker = conflictMarkerSprite();
      const markerSize = 17;
      const markerHalf = markerSize / 2;
      // Beyond a few hundred icons the markers overlap into noise. Thin them
      // to a legible sample; the dashed edge and the conflict count still
      // carry the per-conflict signal.
      const markerStep = Math.max(1, Math.ceil(conflictMarkers.length / 240));
      for (let index = 0; index < conflictMarkers.length; index += markerStep) {
        const point = conflictMarkers[index];
        ctx.drawImage(marker, point.x - markerHalf, point.y - markerHalf, markerSize, markerSize);
      }
    }

    // ── Nodes and labels ──────────────────────────────────────────
    const placedLabels: Array<{ x: number; y: number; w: number; h: number }> = [];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < data.aps.length; i++) {
      const ap = data.aps[i];
      const point = positions[i];
      const selected = ap.id === data.selectedId;
      const hovered = ap.id === data.hoveredId;

      ctx.beginPath();
      ctx.arc(point.x, point.y, NODE_RADIUS_PX + 1.5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.nodeRim;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(point.x, point.y, NODE_RADIUS_PX, 0, Math.PI * 2);
      ctx.fillStyle = nodeColors[i];
      ctx.fill();

      ctx.fillStyle = COLORS.nodeText;
      ctx.font = NODE_FONT;
      const badge = data.channels ? String(data.channels[i] ?? i + 1) : String(data.coloring[i] ?? 0);
      ctx.fillText(badge, point.x, point.y + 0.5);

      if (selected || hovered) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, NODE_RADIUS_PX + (selected ? 5 : 3), 0, Math.PI * 2);
        ctx.strokeStyle = selected ? COLORS.accent : COLORS.ink2;
        ctx.lineWidth = selected ? 2 : 1.25;
        ctx.stroke();
      }

      // Label beneath the node, nudged down when another label is in the way.
      ctx.font = LABEL_FONT;
      const text = ap.label;
      const textWidth = ctx.measureText(text).width;
      let labelY = point.y + NODE_RADIUS_PX + 12;
      const labelX = point.x;
      for (let attempt = 0; attempt < 8; attempt++) {
        const box = { x: labelX - textWidth / 2 - 3, y: labelY - 8, w: textWidth + 6, h: 15 };
        const collides = placedLabels.some(
          (other) =>
            box.x < other.x + other.w && box.x + box.w > other.x && box.y < other.y + other.h && box.y + box.h > other.y
        );
        if (!collides) {
          placedLabels.push(box);
          break;
        }
        labelY += 13;
        if (attempt === 7) {
          placedLabels.push({ x: labelX - textWidth / 2 - 3, y: labelY - 8, w: textWidth + 6, h: 15 });
        }
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 3;
      ctx.strokeStyle = withAlpha(COLORS.canvas, 0.85);
      ctx.strokeText(text, labelX, labelY);
      ctx.fillStyle = selected ? COLORS.accent : COLORS.ink;
      ctx.fillText(text, labelX, labelY);
    }

    // ── Ghost preview for the Add tool ────────────────────────────
    if (this.ghost && data.showGhost) {
      const radiusPx = data.defaultRadius * scale;
      ctx.beginPath();
      ctx.arc(this.ghost.x, this.ghost.y, radiusPx, 0, Math.PI * 2);
      ctx.fillStyle = withAlpha(COLORS.accent, 0.05);
      ctx.fill();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = withAlpha(COLORS.accent, 0.65);
      ctx.lineWidth = 1.25;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(this.ghost.x, this.ghost.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.accent;
      ctx.fill();
    }

    this.drawScaleBar();
    this.recordFrame(started);
  }

  private drawScaleBar(): void {
    const { metres, pixels } = scaleBar(this.view.scale);
    if (!Number.isFinite(pixels) || pixels <= 0) return;
    const x = 18;
    const y = this.height - 20;
    const ctx = this.dynamicCtx;

    ctx.strokeStyle = withAlpha(COLORS.ink2, 0.75);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + pixels, y);
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 1);
    ctx.moveTo(x + pixels, y - 4);
    ctx.lineTo(x + pixels, y + 1);
    ctx.stroke();

    ctx.font = SCALE_FONT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = withAlpha(COLORS.ink2, 0.9);
    ctx.fillText(`${metres} m`, x, y - 6);
  }

  private recordFrame(started: number): void {
    this.frameTimes.push(performance.now() - started);
    if (this.frameTimes.length > 240) this.frameTimes.shift();
  }

  /** Median render time, shown only in development builds. */
  getMedianFrameMs(): number | null {
    if (this.frameTimes.length === 0) return null;
    const sorted = [...this.frameTimes].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  clearTransient(): void {
    this.transient = null;
  }
}
