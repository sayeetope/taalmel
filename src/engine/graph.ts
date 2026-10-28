import type { Graph, Point } from './types';

/** Build an interference graph from AP centres and effective radii. */
export function buildInterferenceGraph(positions: Point[], radii: number[]): Graph {
  const n = positions.length;
  const adj = Array.from({ length: n }, () => Array<boolean>(n).fill(false));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = positions[i].x - positions[j].x;
      const dy = positions[i].y - positions[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radii[i] + radii[j]) {
        adj[i][j] = true;
        adj[j][i] = true;
      }
    }
  }

  return { n, adj, pos: positions, radius: radii };
}

/** Total undirected edges. */
export function edgeCount(graph: Graph): number {
  const { n, adj } = graph;
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (adj[i][j]) count++;
    }
  }
  return count;
}

/** Degree sequence, sorted descending. */
export function degreeSequence(graph: Graph): number[] {
  const { n, adj } = graph;
  const degrees = Array<number>(n).fill(0);
  for (let v = 0; v < n; v++) {
    for (let u = 0; u < n; u++) {
      if (adj[v][u]) degrees[v]++;
    }
  }
  return degrees.sort((a, b) => b - a);
}

/** Maximum degree Δ. */
export function maxDegree(graph: Graph): number {
  const seq = degreeSequence(graph);
  return seq.length > 0 ? seq[0] : 0;
}

/** Adjacency matrix → adjacency lists. */
export function adjMatrixToList(adj: boolean[][], n: number): number[][] {
  const list = Array.from({ length: n }, () => [] as number[]);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (adj[i][j]) list[i].push(j);
    }
  }
  return list;
}

/** Neighbours of a vertex. */
export function neighboursOf(graph: Graph, v: number): number[] {
  const result: number[] = [];
  for (let u = 0; u < graph.n; u++) {
    if (graph.adj[v][u]) result.push(u);
  }
  return result;
}

/** Degree of a single vertex. */
export function degreeOf(graph: Graph, v: number): number {
  return neighboursOf(graph, v).length;
}
