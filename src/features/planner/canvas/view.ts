import type { Point } from '@/engine';
import type { PlannerAp } from '../store/derive';

export interface View {
  scale: number;
  tx: number;
  ty: number;
}

export const MODEL_UNITS_PER_METRE = 1;

export function fitView(
  aps: PlannerAp[],
  effectiveRadii: number[],
  width: number,
  height: number,
  padding = 56
): View {
  if (aps.length === 0 || width <= 0 || height <= 0) {
    return { scale: 1, tx: width / 2, ty: height / 2 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  aps.forEach((ap, index) => {
    const radius = effectiveRadii[index] ?? 0;
    minX = Math.min(minX, ap.x - radius);
    maxX = Math.max(maxX, ap.x + radius);
    minY = Math.min(minY, ap.y - radius);
    maxY = Math.max(maxY, ap.y + radius);
  });

  const boundsW = Math.max(1, maxX - minX);
  const boundsH = Math.max(1, maxY - minY);
  const usableW = Math.max(1, width - padding * 2);
  const usableH = Math.max(1, height - padding * 2);
  const scale = Math.min(usableW / boundsW, usableH / boundsH, 2.4);

  return {
    scale,
    tx: width / 2 - ((minX + maxX) / 2) * scale,
    ty: height / 2 - ((minY + maxY) / 2) * scale,
  };
}

export function toScreen(view: View, point: Point): Point {
  return { x: point.x * view.scale + view.tx, y: point.y * view.scale + view.ty };
}

export function toModel(view: View, point: Point): Point {
  return { x: (point.x - view.tx) / view.scale, y: (point.y - view.ty) / view.scale };
}

const NICE_METRES = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

/** Largest round distance that draws between 48 and 120 px. */
export function scaleBar(scale: number): { metres: number; pixels: number } {
  for (const metres of NICE_METRES) {
    const pixels = metres * scale;
    if (pixels >= 48 && pixels <= 120) return { metres, pixels };
  }
  const metres = NICE_METRES[NICE_METRES.length - 1];
  return { metres, pixels: metres * scale };
}
