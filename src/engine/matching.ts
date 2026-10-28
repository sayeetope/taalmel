import type { BipartitePartition, Graph, HallResult, MatchingResult } from './types';

/** BFS 2-coloring; returns an odd-cycle edge when the graph is not bipartite. */
export function isBipartite(graph: Graph): BipartitePartition {
  const { n, adj } = graph;
  const color = Array<number>(n).fill(-1);
  const setA: number[] = [];
  const setB: number[] = [];

  for (let start = 0; start < n; start++) {
    if (color[start] !== -1) continue;
    color[start] = 0;
    setA.push(start);
    const queue = [start];

    while (queue.length > 0) {
      const u = queue.shift() as number;
      for (let v = 0; v < n; v++) {
        if (!adj[u][v]) continue;
        if (color[v] === -1) {
          color[v] = 1 - color[u];
          (color[v] === 0 ? setA : setB).push(v);
          queue.push(v);
        } else if (color[v] === color[u]) {
          return { isBipartite: false, oddCycleEdge: [u, v] };
        }
      }
    }
  }

  return { isBipartite: true, partition: [setA, setB] };
}

/** Kuhn's augmenting paths: maximum matching of a bipartite graph. */
export function bipartiteMatching(graph: Graph): MatchingResult {
  const bip = isBipartite(graph);
  if (!bip.isBipartite || !bip.partition) {
    return {
      matchingSize: -1,
      error: 'Graph is not bipartite',
      oddCycleEdge: bip.oddCycleEdge,
    };
  }

  const { adj } = graph;
  const [setA, setB] = bip.partition;
  const matchA = new Map<number, number>();
  const matchB = new Map<number, number>();

  function augment(u: number, visited: Set<number>): boolean {
    for (const v of setB) {
      if (!adj[u][v] || visited.has(v)) continue;
      visited.add(v);
      const current = matchB.get(v);
      if (current === undefined || augment(current, visited)) {
        matchA.set(u, v);
        matchB.set(v, u);
        return true;
      }
    }
    return false;
  }

  let matchingSize = 0;
  for (const u of setA) {
    const visited = new Set<number>();
    if (augment(u, visited)) matchingSize++;
  }

  const unmatchedA = setA.filter((v) => !matchA.has(v));
  const unmatchedB = setB.filter((v) => !matchB.has(v));

  return { matchingSize, matching: matchA, unmatchedA, unmatchedB, setA, setB };
}

/**
 * Hall's marriage condition, with the worst violating subset when it fails.
 * Exhaustive below 19 vertices; otherwise inferred from the matching size.
 */
export function hallViolationCheck(graph: Graph): HallResult {
  const bip = isBipartite(graph);
  if (!bip.isBipartite || !bip.partition) {
    return {
      satisfiesHall: null,
      error: "Graph is not bipartite — Hall's theorem does not apply.",
    };
  }

  const { adj } = graph;
  const [setA, setB] = bip.partition;

  if (setA.length > 18) {
    const matchResult = bipartiteMatching(graph);
    if (matchResult.matchingSize === setA.length) {
      return {
        satisfiesHall: true,
        proof:
          `A perfect matching from A to B exists (size ${matchResult.matchingSize} = |A| = ${setA.length}), ` +
          `so Hall's condition is satisfied.`,
      };
    }
    return {
      satisfiesHall: false,
      proof:
        `Maximum matching size ${matchResult.matchingSize} < |A| = ${setA.length}. ` +
        `Hall's condition is violated (but the specific violating set was not computed due to graph size).`,
      unmatchedA: matchResult.unmatchedA,
    };
  }

  let worstViolation: { set: number[]; neighbors: number[]; deficit: number } | null = null;

  for (let mask = 1; mask < 1 << setA.length; mask++) {
    const subset: number[] = [];
    for (let i = 0; i < setA.length; i++) {
      if (mask & (1 << i)) subset.push(setA[i]);
    }

    const neighbors = new Set<number>();
    for (const u of subset) {
      for (const v of setB) {
        if (adj[u][v]) neighbors.add(v);
      }
    }

    if (neighbors.size < subset.length) {
      const deficit = subset.length - neighbors.size;
      if (!worstViolation || deficit > worstViolation.deficit) {
        worstViolation = { set: subset, neighbors: [...neighbors], deficit };
      }
    }
  }

  if (worstViolation) {
    const sLabels = worstViolation.set.map((v) => `AP${v}`).join(', ');
    const nLabels = worstViolation.neighbors.map((v) => `AP${v}`).join(', ') || '∅';
    return {
      satisfiesHall: false,
      violatingSet: worstViolation.set,
      neighborhoodSize: worstViolation.neighbors.length,
      deficit: worstViolation.deficit,
      proof:
        `Hall's Theorem Violation:\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Set S = {${sLabels}} with |S| = ${worstViolation.set.length}\n` +
        `N(S) = {${nLabels}} with |N(S)| = ${worstViolation.neighbors.length}\n\n` +
        `|N(S)| = ${worstViolation.neighbors.length} < |S| = ${worstViolation.set.length}\n` +
        `Deficit: ${worstViolation.deficit}\n\n` +
        `By Hall's Marriage Theorem, no matching can saturate all of A.\n` +
        `A perfect assignment is impossible. ∎`,
    };
  }

  return {
    satisfiesHall: true,
    proof:
      `Hall's condition satisfied: for every subset S ⊆ A, |N(S)| ≥ |S|.\n` +
      `A perfect matching from A exists.`,
  };
}

/** Channel assignment modelled as a bipartite AP→channel matching. */
export function channelMatchingModel(graph: Graph, numChannels = 3) {
  const { n } = graph;

  const totalN = n + numChannels;
  const bipAdj = Array.from({ length: totalN }, () => Array<boolean>(totalN).fill(false));

  for (let ap = 0; ap < n; ap++) {
    for (let ch = 0; ch < numChannels; ch++) {
      bipAdj[ap][n + ch] = true;
      bipAdj[n + ch][ap] = true;
    }
  }

  const bipGraph: Graph = { n: totalN, adj: bipAdj, pos: [], radius: [] };

  const matchResult = bipartiteMatching(bipGraph);
  const hallResult = hallViolationCheck(bipGraph);

  const assignment = Array<number>(n).fill(-1);
  if (matchResult.matching) {
    for (const [ap, chNode] of matchResult.matching) {
      if (ap < n) assignment[ap] = chNode - n + 1;
    }
  }

  return {
    assignment,
    matchingSize: matchResult.matchingSize,
    allAssigned: matchResult.matchingSize >= n,
    hallResult,
    numChannels,
  };
}
