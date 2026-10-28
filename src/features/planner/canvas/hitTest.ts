import type { PlannerAp } from '../store/derive';
import { toScreen, type View } from './view';

export const NODE_RADIUS_PX = 15;
const HIT_PADDING_PX = 6;

export interface HitIndex {
  aps: PlannerAp[];
  view: View;
  grid: Map<string, number[]> | null;
  cell: number;
}

const GRID_THRESHOLD = 60;

/**
 * Build a hit-test index. Above 60 APs a uniform screen-space grid keeps
 * pointer-down cost near-constant; below it a linear scan is faster.
 */
export function buildHitIndex(aps: PlannerAp[], view: View): HitIndex {
  if (aps.length <= GRID_THRESHOLD) return { aps, view, grid: null, cell: 0 };

  const cell = 96;
  const grid = new Map<string, number[]>();
  aps.forEach((ap, index) => {
    const screen = toScreen(view, ap);
    const key = `${Math.floor(screen.x / cell)},${Math.floor(screen.y / cell)}`;
    const bucket = grid.get(key);
    if (bucket) bucket.push(index);
    else grid.set(key, [index]);
  });

  return { aps, view, grid, cell };
}

/** Nearest AP under a screen point, or -1. */
export function hitTest(index: HitIndex, screenX: number, screenY: number): number {
  const reach = NODE_RADIUS_PX + HIT_PADDING_PX;
  const reachSq = reach * reach;

  const consider = (apIndex: number): { best: number; bestDist: number } => {
    const ap = index.aps[apIndex];
    const point = toScreen(index.view, ap);
    const dx = screenX - point.x;
    const dy = screenY - point.y;
    const distance = dx * dx + dy * dy;
    return { best: distance <= reachSq ? apIndex : -1, bestDist: distance };
  };

  let best = -1;
  let bestDist = Infinity;

  if (!index.grid) {
    for (let i = index.aps.length - 1; i >= 0; i--) {
      const result = consider(i);
      if (result.best !== -1 && result.bestDist < bestDist) {
        best = result.best;
        bestDist = result.bestDist;
      }
    }
    return best;
  }

  const cx = Math.floor(screenX / index.cell);
  const cy = Math.floor(screenY / index.cell);
  for (let gx = cx - 1; gx <= cx + 1; gx++) {
    for (let gy = cy - 1; gy <= cy + 1; gy++) {
      const bucket = index.grid.get(`${gx},${gy}`);
      if (!bucket) continue;
      for (const apIndex of bucket) {
        const result = consider(apIndex);
        if (result.best !== -1 && result.bestDist < bestDist) {
          best = result.best;
          bestDist = result.bestDist;
        }
      }
    }
  }

  return best;
}
