import type { Coloring, ColoringResult, ConflictScore, ExactResult, FixSuggestion, Graph } from './types';

/**
 * Greedy coloring in natural vertex order.
 * With `maxColors` set, choices are restricted to 0..maxColors-1 and the
 * least-conflicting color is used when no free color remains.
 */
export function greedyColoring(graph: Graph, maxColors = Infinity): ColoringResult {
  const { n, adj } = graph;
  const coloring: Coloring = Array(n).fill(-1);

  for (let v = 0; v < n; v++) {
    const usedByNeighbors = new Set<number>();
    const neighborCounts: Record<number, number> = {};
    for (let u = 0; u < n; u++) {
      if (adj[v][u] && coloring[u] !== -1) {
        usedByNeighbors.add(coloring[u]);
        neighborCounts[coloring[u]] = (neighborCounts[coloring[u]] ?? 0) + 1;
      }
    }

    let c = 0;
    while (usedByNeighbors.has(c) && c < maxColors) c++;
    if (c >= maxColors) {
      let minCollisions = Infinity;
      let bestC = 0;
      for (let ch = 0; ch < maxColors; ch++) {
        const count = neighborCounts[ch] ?? 0;
        if (count < minCollisions) {
          minCollisions = count;
          bestC = ch;
        }
      }
      c = bestC;
    }
    coloring[v] = c;
  }

  const numColors = n > 0 ? Math.max(...coloring) + 1 : 0;
  return { coloring, numColors };
}

/** Welsh–Powell: descending-degree order, then greedy. */
export function welshPowellColoring(graph: Graph, maxColors = Infinity): ColoringResult {
  const { n, adj } = graph;

  const degrees = Array<number>(n).fill(0);
  for (let v = 0; v < n; v++) {
    for (let u = 0; u < n; u++) {
      if (adj[v][u]) degrees[v]++;
    }
  }

  const order = Array.from({ length: n }, (_, i) => i);
  order.sort((a, b) => degrees[b] - degrees[a]);

  const coloring: Coloring = Array(n).fill(-1);

  for (const v of order) {
    const usedByNeighbors = new Set<number>();
    const neighborCounts: Record<number, number> = {};
    for (let u = 0; u < n; u++) {
      if (adj[v][u] && coloring[u] !== -1) {
        usedByNeighbors.add(coloring[u]);
        neighborCounts[coloring[u]] = (neighborCounts[coloring[u]] ?? 0) + 1;
      }
    }
    let c = 0;
    while (usedByNeighbors.has(c) && c < maxColors) c++;
    if (c >= maxColors) {
      let minCollisions = Infinity;
      let bestC = 0;
      for (let ch = 0; ch < maxColors; ch++) {
        const count = neighborCounts[ch] ?? 0;
        if (count < minCollisions) {
          minCollisions = count;
          bestC = ch;
        }
      }
      c = bestC;
    }
    coloring[v] = c;
  }

  const numColors = n > 0 ? Math.max(...coloring) + 1 : 0;
  return { coloring, numColors, order };
}

/** DSatur: color the most saturated vertex first, breaking ties by degree. */
export function dsaturColoring(graph: Graph, maxColors = Infinity): ColoringResult {
  const { n, adj } = graph;

  const coloring: Coloring = Array(n).fill(-1);
  const saturation = Array<number>(n).fill(0);
  const neighborColors = Array.from({ length: n }, () => new Set<number>());
  const neighborCounts = Array.from({ length: n }, () => ({}) as Record<number, number>);
  const order: number[] = [];

  const degrees = Array<number>(n).fill(0);
  for (let v = 0; v < n; v++) {
    for (let u = 0; u < n; u++) {
      if (adj[v][u]) degrees[v]++;
    }
  }

  for (let step = 0; step < n; step++) {
    let best = -1;
    for (let v = 0; v < n; v++) {
      if (coloring[v] !== -1) continue;
      if (
        best === -1 ||
        saturation[v] > saturation[best] ||
        (saturation[v] === saturation[best] && degrees[v] > degrees[best])
      ) {
        best = v;
      }
    }

    order.push(best);

    let c = 0;
    while (neighborColors[best].has(c) && c < maxColors) c++;
    if (c >= maxColors) {
      let minCollisions = Infinity;
      let bestC = 0;
      for (let ch = 0; ch < maxColors; ch++) {
        const count = neighborCounts[best][ch] ?? 0;
        if (count < minCollisions) {
          minCollisions = count;
          bestC = ch;
        }
      }
      c = bestC;
    }
    coloring[best] = c;

    for (let u = 0; u < n; u++) {
      if (adj[best][u] && coloring[u] === -1) {
        neighborCounts[u][c] = (neighborCounts[u][c] ?? 0) + 1;
        if (!neighborColors[u].has(c)) {
          neighborColors[u].add(c);
          saturation[u]++;
        }
      }
    }
  }

  const numColors = n > 0 ? Math.max(...coloring) + 1 : 0;
  return { coloring, numColors, order };
}

/**
 * Exact chromatic number by backtracking over k = 1..n.
 * Returns null when the graph exceeds `maxN` (default 20).
 */
export function exactColoring(graph: Graph, maxN = 20): ExactResult | null {
  const { n, adj } = graph;
  if (n === 0) return { coloring: [], numColors: 0, nodesExplored: 0 };
  if (n > maxN) return null;

  let nodesExplored = 0;

  function canColor(coloring: Coloring, v: number, c: number): boolean {
    for (let u = 0; u < n; u++) {
      if (adj[v][u] && coloring[u] === c) return false;
    }
    return true;
  }

  function backtrack(coloring: Coloring, v: number, k: number): boolean {
    if (v === n) return true;
    nodesExplored++;
    for (let c = 0; c < k; c++) {
      if (canColor(coloring, v, c)) {
        coloring[v] = c;
        if (backtrack(coloring, v + 1, k)) return true;
        coloring[v] = -1;
      }
    }
    return false;
  }

  for (let k = 1; k <= n; k++) {
    nodesExplored = 0;
    const coloring: Coloring = Array(n).fill(-1);
    if (backtrack(coloring, 0, k)) {
      return { coloring, numColors: k, nodesExplored };
    }
  }

  return null;
}

/** Number of monochromatic edges (co-channel conflicts). */
export function interferenceScore(graph: Graph, coloring: Coloring): ConflictScore {
  const { n, adj } = graph;
  let conflicts = 0;
  const conflictEdges: Array<[number, number]> = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (adj[i][j] && coloring[i] === coloring[j]) {
        conflicts++;
        conflictEdges.push([i, j]);
      }
    }
  }

  return { score: conflicts, conflictEdges };
}

/** Coloring evaluation used by the Analysis tab. */
export function evaluateColoring(graph: Graph, coloring: Coloring) {
  const { n, adj } = graph;
  const used = new Set<number>();
  let conflictPairs = 0;
  const conflictsByVertex = Array<number>(n).fill(0);

  for (let i = 0; i < n; i++) {
    if (coloring[i] >= 0) used.add(coloring[i]);
    for (let j = i + 1; j < n; j++) {
      if (!adj[i][j] || coloring[i] !== coloring[j]) continue;
      conflictPairs++;
      conflictsByVertex[i]++;
      conflictsByVertex[j]++;
    }
  }

  return { colorsUsed: used.size, conflicts: conflictPairs, conflictsByVertex };
}

/**
 * Suggest repairs for each conflicting edge: a free color, a smaller
 * radius that breaks the overlap, and a nudge that separates the pair.
 */
export function suggestFixes(
  graph: Graph,
  coloring: Coloring,
  maxColors = Infinity,
  /** Stop after this many suggestions. Omit for the complete set. */
  limit = Infinity
): FixSuggestion[] {
  const { n, adj, pos, radius } = graph;
  const { conflictEdges } = interferenceScore(graph, coloring);
  const suggestions: FixSuggestion[] = [];

  for (const [i, j] of conflictEdges) {
    if (suggestions.length >= limit) break;
    const degI = adj[i].filter(Boolean).length;
    const degJ = adj[j].filter(Boolean).length;
    const target = degI <= degJ ? i : j;
    const other = target === i ? j : i;

    const usedColors = new Set<number>();
    for (let u = 0; u < n; u++) {
      if (adj[target][u] && coloring[u] !== -1) usedColors.add(coloring[u]);
    }

    let suggestedColor = -1;
    for (let c = 0; c < maxColors; c++) {
      if (!usedColors.has(c)) {
        suggestedColor = c;
        break;
      }
    }

    let suggestedRadius: number | null = null;
    let suggestedMove: { dx: number; dy: number } | null = null;
    if (pos && radius && pos[target] && pos[other]) {
      const dx = pos[target].x - pos[other].x;
      const dy = pos[target].y - pos[other].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const otherR = radius[other];
      const clearR = Math.max(25, Math.floor(dist - otherR - 5));
      if (clearR < radius[target]) suggestedRadius = clearR;
      if (dist > 0.001) {
        const neededDist = radius[target] + otherR + 12;
        const pushDist = neededDist - dist;
        if (pushDist > 0) {
          suggestedMove = {
            dx: Math.round((dx / dist) * pushDist),
            dy: Math.round((dy / dist) * pushDist),
          };
        }
      }
    }

    suggestions.push({
      ap: target,
      currentColor: coloring[target],
      suggestedColor: suggestedColor !== -1 ? suggestedColor : null,
      conflictWith: other,
      currentRadius: radius ? radius[target] : null,
      suggestedRadius,
      suggestedMove,
    });
  }

  return suggestions;
}
