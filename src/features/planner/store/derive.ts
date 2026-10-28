import {
  buildInterferenceGraph,
  cliqueNumber,
  connectedComponents,
  dsaturColoring,
  edgeCount,
  exactColoring,
  greedyColoring,
  interferenceScore,
  isConnected,
  maxDegree,
  welshPowellColoring,
  type Graph,
} from '@/engine';

export type AlgorithmKey = 'dsatur' | 'welsh-powell' | 'greedy' | 'exact';

export interface PlannerAp {
  id: number;
  label: string;
  /** Model-space metres. */
  x: number;
  y: number;
  /** null inherits the default radius. */
  radius: number | null;
}

export interface GraphStats {
  v: number;
  e: number;
  delta: number;
  omega: number | null;
  chiLower: number | null;
  chiUpper: number;
  colors: number;
  conflicts: number;
  connected: boolean | null;
  components: number | null;
}

export interface DerivedGraph {
  graph: Graph;
  coloring: number[];
  stats: GraphStats;
  fallbackUsed: boolean;
}

export type ColoringAlgorithm = (graph: Graph, maxColors: number) => { coloring: number[] };

/** Effective radius for one AP. */
export function effectiveRadius(ap: PlannerAp, defaultRadius: number): number {
  return ap.radius ?? defaultRadius;
}

/** Statistics for an existing coloring (used by manual color edits). */
export function graphStats(graph: Graph, coloring: number[]): GraphStats {
  const colors = coloring.length > 0 ? Math.max(...coloring) + 1 : 0;
  const omega = graph.n > 0 && graph.n <= 25 ? cliqueNumber(graph) : null;
  const delta = maxDegree(graph);

  return {
    v: graph.n,
    e: edgeCount(graph),
    delta,
    omega,
    chiLower: omega,
    chiUpper: delta + 1,
    colors,
    conflicts: coloring.length > 0 ? interferenceScore(graph, coloring).score : 0,
    connected: graph.n > 0 ? isConnected(graph) : null,
    components: graph.n > 0 ? connectedComponents(graph).count : null,
  };
}

/**
 * Rebuild the interference graph and recolor it. This is the only place
 * topology and coloring are derived; drag frames never call it.
 *
 * `preserved` keeps existing assignments when auto-recolor is off, so the
 * user can inspect the damage before choosing to recolor.
 */
export function deriveGraph(
  aps: PlannerAp[],
  defaultRadius: number,
  algorithm: AlgorithmKey,
  maxColors: number,
  preserved?: number[]
): DerivedGraph {
  if (aps.length === 0) {
    return {
      graph: { n: 0, adj: [], pos: [], radius: [] },
      coloring: [],
      stats: {
        v: 0,
        e: 0,
        delta: 0,
        omega: 0,
        chiLower: 0,
        chiUpper: 0,
        colors: 0,
        conflicts: 0,
        connected: null,
        components: null,
      },
      fallbackUsed: false,
    };
  }

  const graph = buildInterferenceGraph(
    aps.map((ap) => ({ x: ap.x, y: ap.y })),
    aps.map((ap) => effectiveRadius(ap, defaultRadius))
  );

  const k = maxColors > 0 ? maxColors : Infinity;
  let coloring: number[] = [];
  let fallbackUsed = false;

  switch (algorithm) {
    case 'greedy':
      coloring = greedyColoring(graph, k).coloring;
      break;
    case 'welsh-powell':
      coloring = welshPowellColoring(graph, k).coloring;
      break;
    case 'exact': {
      const exact = exactColoring(graph);
      if (exact) {
        coloring = exact.coloring;
      } else {
        fallbackUsed = true;
        coloring = dsaturColoring(graph, k).coloring;
      }
      break;
    }
    case 'dsatur':
    default:
      coloring = dsaturColoring(graph, k).coloring;
      break;
  }

  if (preserved && preserved.length === graph.n) coloring = preserved;

  return { graph, coloring, fallbackUsed, stats: graphStats(graph, coloring) };
}
