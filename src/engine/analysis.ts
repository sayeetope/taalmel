import { edgeCount } from './graph';
import type { EulerCheck, Graph, KuratowskiCheck, PlanarCheck } from './types';

/** Bron–Kerbosch with pivoting: every maximal clique. */
export function bronKerbosch(graph: Graph): number[][] {
  const { n, adj } = graph;
  const cliques: number[][] = [];

  function neighbours(v: number): number[] {
    const result: number[] = [];
    for (let u = 0; u < n; u++) if (adj[v][u]) result.push(u);
    return result;
  }

  function intersect(a: number[], b: number[]): number[] {
    const setB = new Set(b);
    return a.filter((x) => setB.has(x));
  }

  function pivot(R: number[], P: number[], X: number[]): void {
    if (P.length === 0 && X.length === 0) {
      cliques.push([...R]);
      return;
    }

    const union = [...P, ...X];
    let pivotVertex = union[0];
    let maxCount = -1;
    for (const u of union) {
      const count = intersect(P, neighbours(u)).length;
      if (count > maxCount) {
        maxCount = count;
        pivotVertex = u;
      }
    }

    const pivotNeighbors = new Set(neighbours(pivotVertex));
    const candidates = P.filter((v) => !pivotNeighbors.has(v));

    for (const v of candidates) {
      const vNeighbors = neighbours(v);
      pivot([...R, v], intersect(P, vNeighbors), intersect(X, vNeighbors));
      P = P.filter((u) => u !== v);
      X.push(v);
    }
  }

  const allVertices = Array.from({ length: n }, (_, i) => i);
  pivot([], allVertices, []);
  return cliques;
}

/** Largest clique and its size. */
export function maximumClique(graph: Graph): { clique: number[]; size: number } {
  const cliques = bronKerbosch(graph);
  if (cliques.length === 0) return { clique: [], size: 0 };

  let best = cliques[0];
  for (const c of cliques) {
    if (c.length > best.length) best = c;
  }
  return { clique: best, size: best.length };
}

/** Clique number ω(G). */
export function cliqueNumber(graph: Graph): number {
  return maximumClique(graph).size;
}

/** Pigeonhole argument for why a clique exceeds the channel count. */
export function pigeonholeProof(
  graph: Graph,
  availableColors: number
): { needed: number; clique: number[]; proof: string } {
  const { clique, size: omega } = maximumClique(graph);

  if (omega <= availableColors) {
    return {
      needed: omega,
      clique,
      proof:
        `No pigeonhole violation: the largest clique has ${omega} vertices, ` +
        `and ${availableColors} colors are available (${availableColors} ≥ ${omega}).`,
    };
  }

  const vertexLabels = clique.map((v) => `AP${v}`).join(', ');
  const proof =
    `Pigeonhole Principle Proof:\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Given: A clique of size ω = ${omega} exists: {${vertexLabels}}.\n` +
    `These ${omega} vertices are ALL mutually adjacent.\n\n` +
    `Available colors (channels): ${availableColors}.\n\n` +
    `Since ${omega} > ${availableColors}, by the Pigeonhole Principle:\n` +
    `  • We have ${omega} "pigeons" (APs) and only ${availableColors} "holes" (channels).\n` +
    `  • At least ⌈${omega}/${availableColors}⌉ = ${Math.ceil(omega / availableColors)} APs must share a channel.\n` +
    `  • But these APs are mutually adjacent ⟹ same-channel APs interfere.\n\n` +
    `∴ A valid coloring requires at least ${omega} colors. ∎`;

  return { needed: omega, clique, proof };
}

/** Necessary planarity condition E ≤ 3V − 6. */
export function planarBoundCheck(graph: Graph): PlanarCheck {
  const V = graph.n;
  const E = edgeCount(graph);
  const bound = 3 * V - 6;
  return {
    isPossiblyPlanar: E <= bound,
    V,
    E,
    bound,
    margin: bound - E,
    explanation:
      E <= bound
        ? `E = ${E} ≤ 3V − 6 = ${bound}: the necessary condition is satisfied (graph MAY be planar).`
        : `E = ${E} > 3V − 6 = ${bound}: the graph is NOT planar.`,
  };
}

/** Triangle-free planarity bound E ≤ 2V − 4. */
export function triangleFreePlanarCheck(graph: Graph): PlanarCheck {
  const V = graph.n;
  const E = edgeCount(graph);
  const bound = 2 * V - 4;
  return {
    isPossiblyPlanar: E <= bound,
    V,
    E,
    bound,
    margin: bound - E,
    explanation:
      E <= bound
        ? `E = ${E} ≤ 2V − 4 = ${bound}: consistent with planarity for triangle-free graphs.`
        : `E = ${E} > 2V − 4 = ${bound}: a triangle-free graph with these counts is NOT planar.`,
  };
}

/** True when no three mutually adjacent vertices exist. */
export function isTriangleFree(graph: Graph): boolean {
  const { n, adj } = graph;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!adj[i][j]) continue;
      for (let k = j + 1; k < n; k++) {
        if (adj[i][k] && adj[j][k]) return false;
      }
    }
  }
  return true;
}

/** Heuristic Kuratowski evidence (K₅ or K₃,₃ subgraph present). */
export function kuratowskiCheck(graph: Graph): KuratowskiCheck {
  const { n, adj } = graph;

  let hasK5 = false;
  const cliques = bronKerbosch(graph);
  for (const c of cliques) {
    if (c.length >= 5) {
      hasK5 = true;
      break;
    }
  }

  let hasK33 = false;
  if (n >= 6 && !hasK5) {
    outer: for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (let k = j + 1; k < n; k++) {
          for (let a = 0; a < n; a++) {
            if (a === i || a === j || a === k) continue;
            if (!adj[i][a] || !adj[j][a] || !adj[k][a]) continue;
            for (let b = a + 1; b < n; b++) {
              if (b === i || b === j || b === k) continue;
              if (!adj[i][b] || !adj[j][b] || !adj[k][b]) continue;
              for (let c = b + 1; c < n; c++) {
                if (c === i || c === j || c === k) continue;
                if (adj[i][c] && adj[j][c] && adj[k][c]) {
                  hasK33 = true;
                  break outer;
                }
              }
            }
          }
        }
      }
    }
  }

  const evidence = hasK5
    ? 'Contains K₅ as a subgraph → graph is non-planar (Kuratowski).'
    : hasK33
      ? 'Contains K₃,₃ as a subgraph → graph is non-planar (Kuratowski).'
      : 'No K₅ or K₃,₃ subgraph detected (but graph may still be non-planar).';

  return { hasK5, hasK33, nonPlanarEvidence: evidence };
}

/** Euler's formula arithmetic for connected planar graphs. */
export function eulerFormulaCheck(graph: Graph): EulerCheck {
  const V = graph.n;
  const E = edgeCount(graph);
  const F = E - V + 2;

  return {
    V,
    E,
    F,
    eulerSum: V - E + F,
    explanation:
      `Euler's formula: V − E + F = ${V} − ${E} + ${F} = ${V - E + F}.\n` +
      `If the graph is connected and planar, it has ${F} faces (including the outer face).`,
  };
}

/** Articulation points (cut vertices), Tarjan's algorithm. */
export function articulationPoints(graph: Graph): number[] {
  const { n, adj } = graph;
  const visited = Array<boolean>(n).fill(false);
  const disc = Array<number>(n).fill(-1);
  const low = Array<number>(n).fill(-1);
  const parent = Array<number>(n).fill(-1);
  const ap = new Set<number>();
  let time = 0;

  function dfs(u: number): void {
    let children = 0;
    visited[u] = true;
    disc[u] = low[u] = time++;

    for (let v = 0; v < n; v++) {
      if (!adj[u][v]) continue;
      if (!visited[v]) {
        children++;
        parent[v] = u;
        dfs(v);
        low[u] = Math.min(low[u], low[v]);

        if (parent[u] === -1 && children > 1) ap.add(u);
        if (parent[u] !== -1 && low[v] >= disc[u]) ap.add(u);
      } else if (v !== parent[u]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  for (let v = 0; v < n; v++) {
    if (!visited[v]) dfs(v);
  }

  return [...ap];
}

/** Connectivity via BFS. */
export function isConnected(graph: Graph): boolean {
  const { n, adj } = graph;
  if (n === 0) return true;

  const visited = Array<boolean>(n).fill(false);
  const queue = [0];
  visited[0] = true;
  let count = 1;

  while (queue.length > 0) {
    const u = queue.shift() as number;
    for (let v = 0; v < n; v++) {
      if (adj[u][v] && !visited[v]) {
        visited[v] = true;
        count++;
        queue.push(v);
      }
    }
  }

  return count === n;
}

/** Connected component count and per-vertex membership. */
export function connectedComponents(graph: Graph): { count: number; componentOf: number[] } {
  const { n, adj } = graph;
  const visited = Array<boolean>(n).fill(false);
  let components = 0;
  const componentOf = Array<number>(n).fill(-1);

  for (let start = 0; start < n; start++) {
    if (visited[start]) continue;
    components++;
    const queue = [start];
    visited[start] = true;
    componentOf[start] = components - 1;
    while (queue.length > 0) {
      const u = queue.shift() as number;
      for (let v = 0; v < n; v++) {
        if (adj[u][v] && !visited[v]) {
          visited[v] = true;
          componentOf[v] = components - 1;
          queue.push(v);
        }
      }
    }
  }

  return { count: components, componentOf };
}

