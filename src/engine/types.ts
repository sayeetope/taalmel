/** Core graph types shared by every pure engine module. */

export interface Point {
  x: number;
  y: number;
}

/**
 * Interference graph contract.
 * Two APs are adjacent when the distance between their centres is at most
 * the sum of their coverage radii.
 */
export interface Graph {
  n: number;
  adj: boolean[][];
  pos: Point[];
  radius: number[];
}

export type Coloring = number[];

export interface ColoringResult {
  coloring: Coloring;
  numColors: number;
  order?: number[];
}

export interface ExactResult extends ColoringResult {
  nodesExplored: number;
}

export interface ConflictScore {
  score: number;
  conflictEdges: Array<[number, number]>;
}

export interface TColorResult {
  assignment: number[];
  numDistinct: number;
  span: number;
}

export interface FixSuggestion {
  ap: number;
  currentColor: number;
  suggestedColor: number | null;
  conflictWith: number;
  currentRadius: number | null;
  suggestedRadius: number | null;
  suggestedMove: { dx: number; dy: number } | null;
}

export interface BipartitePartition {
  isBipartite: boolean;
  partition?: [number[], number[]];
  oddCycleEdge?: [number, number];
}

export interface MatchingResult {
  matchingSize: number;
  matching?: Map<number, number>;
  unmatchedA?: number[];
  unmatchedB?: number[];
  setA?: number[];
  setB?: number[];
  error?: string;
  oddCycleEdge?: [number, number];
}

export interface HallResult {
  satisfiesHall: boolean | null;
  violatingSet?: number[];
  neighborhoodSize?: number;
  deficit?: number;
  proof?: string;
  error?: string;
  unmatchedA?: number[];
}

export interface BenchmarkRow {
  algorithm: string;
  colors: number;
  time: string;
  optimal: boolean | null;
  nodesExplored?: number;
}

export interface TestSuiteRow {
  name: string;
  expectedChi: number;
  exactChi: number | 'N/A';
  dsaturChi: number;
  cliqueNumber: number;
  passed: boolean | 'N/A';
  details: {
    planarity?: { planar: PlanarCheck; kuratowski: KuratowskiCheck };
    bipartite?: boolean;
    bipartiteMatch?: boolean;
  };
}

export interface PlanarCheck {
  isPossiblyPlanar: boolean;
  V: number;
  E: number;
  bound: number;
  margin: number;
  explanation: string;
}

export interface KuratowskiCheck {
  hasK5: boolean;
  hasK33: boolean;
  nonPlanarEvidence: string;
}

export interface EulerCheck {
  V: number;
  E: number;
  F: number;
  eulerSum: number;
  explanation: string;
}
