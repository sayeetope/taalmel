import type { Graph, TColorResult } from './types';

/**
 * T-coloring: assign channels 1..maxChannel so adjacent APs differ by at
 * least T. This models 2.4 GHz Wi-Fi, where channels 1, 6 and 11 are the
 * classic non-overlapping set (T = 5).
 *
 * Exhaustive backtracking. Returns null when no assignment exists — the
 * caller must treat that as a constraint diagnosis, not a failure.
 */
export function tColoring(graph: Graph, T = 5, maxChannel = 13): TColorResult | null {
  const { n, adj } = graph;
  if (n === 0) return { assignment: [], numDistinct: 0, span: 0 };

  const assignment = Array<number>(n).fill(-1);
  const channels: number[] = [];
  for (let ch = 1; ch <= maxChannel; ch++) channels.push(ch);

  function isValid(v: number, ch: number): boolean {
    for (let u = 0; u < n; u++) {
      if (adj[v][u] && assignment[u] !== -1) {
        if (Math.abs(assignment[u] - ch) < T) return false;
      }
    }
    return true;
  }

  function solve(v: number): boolean {
    if (v === n) return true;
    for (const ch of channels) {
      if (isValid(v, ch)) {
        assignment[v] = ch;
        if (solve(v + 1)) return true;
        assignment[v] = -1;
      }
    }
    return false;
  }

  if (!solve(0)) return null;

  const distinct = new Set(assignment);
  const span = Math.max(...assignment) - Math.min(...assignment);
  return { assignment, numDistinct: distinct.size, span };
}

/**
 * Lower bound on the channel span forced by the largest clique:
 * (ω − 1)·T + 1 channels are needed before a clique can be colored.
 */
export function cliqueSpanBound(cliqueNumber: number, T: number): number {
  return (cliqueNumber - 1) * T + 1;
}
