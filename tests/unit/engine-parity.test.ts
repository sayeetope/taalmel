import { describe, expect, it } from 'vitest';
import snapshotJson from '../fixtures/legacy-snapshot.json';
import {
  articulationPoints,
  benchmarkAlgorithms,
  bipartiteMatching,
  buildCampusGraph,
  channelMatchingModel,
  chromaticPolynomial,
  cliqueNumber,
  connectedComponents,
  degreeSequence,
  dsaturColoring,
  edgeCount,
  exactColoring,
  greedyColoring,
  hallViolationCheck,
  isBipartite,
  isConnected,
  maxDegree,
  planarBoundCheck,
  runTestSuite,
  tColoring,
  TEST_GRAPHS,
  welshPowellColoring,
  type Graph,
} from '@/engine';

interface SnapshotGraph {
  n: number;
  edges: number;
  degreeSeq: number[];
  maxDegree: number;
  clique: { clique: number[]; size: number };
  connected: boolean;
  components: number;
  articulation: number[];
  greedy: number[];
  greedyColors: number;
  welsh: number[];
  welshColors: number;
  dsatur: number[];
  dsaturColors: number;
  exact: { coloring: number[]; colors: number } | null;
  greedyK3: { coloring: number[]; colors: number; score: number };
  tColor5_13: { assignment: number[]; numDistinct: number; span: number } | null;
  tColor3_13: { assignment: number[]; numDistinct: number; span: number } | null;
  tColor5_6: { assignment: number[]; numDistinct: number; span: number } | null;
  chromaticPolynomial: number[] | null;
  planar: { isPossiblyPlanar: boolean; V: number; E: number; bound: number; margin: number };
  bipartite: boolean;
  matching: number;
  channelModel3: { assignment: number[]; matchingSize: number; allAssigned: boolean };
  benchmark: Array<{ algorithm: string; colors: number; optimal: boolean | null; nodesExplored: number | null }>;
}

interface Snapshot {
  campus: { aps: Array<{ id: number; x: number; y: number; radius: number; label: string }>; edges: number };
  graphs: Record<string, SnapshotGraph>;
  suite: Array<{
    name: string;
    expectedChi: number;
    exactChi: number | string;
    dsaturChi: number;
    cliqueNumber: number;
    passed: boolean | string;
  }>;
}

const snapshot = snapshotJson as unknown as Snapshot;

function graphFor(name: string): Graph {
  if (name === 'campus') return buildCampusGraph(95);
  const preset = TEST_GRAPHS[name];
  if (!preset) throw new Error(`Unknown snapshot graph: ${name}`);
  return preset;
}

describe('engine parity with the legacy implementation', () => {
  it('reproduces the legacy campus graph exactly', () => {
    const campus = buildCampusGraph(95);
    expect(campus.n).toBe(12);
    expect(edgeCount(campus)).toBe(snapshot.campus.edges);
  });

  for (const [name, expected] of Object.entries(snapshot.graphs)) {
    describe(name, () => {
      const graph = graphFor(name);

      it('keeps topology and degrees', () => {
        expect(graph.n).toBe(expected.n);
        expect(edgeCount(graph)).toBe(expected.edges);
        expect(degreeSequence(graph)).toEqual(expected.degreeSeq);
        expect(maxDegree(graph)).toBe(expected.maxDegree);
        expect(cliqueNumber(graph)).toBe(expected.clique.size);
        expect(isConnected(graph)).toBe(expected.connected);
        expect(connectedComponents(graph).count).toBe(expected.components);
        expect(articulationPoints(graph)).toEqual(expected.articulation);
        expect(planarBoundCheck(graph)).toMatchObject(expected.planar);
      });

      it('produces identical colorings', () => {
        expect(greedyColoring(graph).coloring).toEqual(expected.greedy);
        expect(greedyColoring(graph).numColors).toBe(expected.greedyColors);
        expect(welshPowellColoring(graph).coloring).toEqual(expected.welsh);
        expect(welshPowellColoring(graph).numColors).toBe(expected.welshColors);
        expect(dsaturColoring(graph).coloring).toEqual(expected.dsatur);
        expect(dsaturColoring(graph).numColors).toBe(expected.dsaturColors);

        const exact = exactColoring(graph);
        if (expected.exact === null) {
          expect(exact).toBeNull();
        } else {
          expect(exact?.coloring).toEqual(expected.exact.coloring);
          expect(exact?.numColors).toBe(expected.exact.colors);
        }
      });

      it('keeps capped greedy conflicts unchanged', () => {
        const capped = greedyColoring(graph, 3);
        expect(capped.coloring).toEqual(expected.greedyK3.coloring);
        expect(capped.numColors).toBe(expected.greedyK3.colors);
      });

      it('keeps T-coloring results unchanged', () => {
        expect(tColoring(graph, 5, 13)).toEqual(expected.tColor5_13);
        expect(tColoring(graph, 3, 13)).toEqual(expected.tColor3_13);
        expect(tColoring(graph, 5, 6)).toEqual(expected.tColor5_6);
      });

      it('keeps matching and Hall results unchanged', () => {
        expect(isBipartite(graph).isBipartite).toBe(expected.bipartite);
        expect(bipartiteMatching(graph).matchingSize).toBe(expected.matching);
        expect(hallViolationCheck(graph).satisfiesHall).not.toBeUndefined();
        const model = channelMatchingModel(graph, 3);
        expect(model.assignment).toEqual(expected.channelModel3.assignment);
        expect(model.matchingSize).toBe(expected.channelModel3.matchingSize);
        expect(model.allAssigned).toBe(expected.channelModel3.allAssigned);
      });

      it('keeps the chromatic polynomial unchanged', () => {
        expect(chromaticPolynomial(graph)).toEqual(expected.chromaticPolynomial);
      });

      it('keeps benchmark colours and optimality unchanged', () => {
        const rows = benchmarkAlgorithms(graph).map((r) => ({
          algorithm: r.algorithm,
          colors: r.colors,
          optimal: r.optimal,
          nodesExplored: r.nodesExplored ?? null,
        }));
        expect(rows).toEqual(expected.benchmark);
      });
    });
  }

  it('keeps the known-graph test suite unchanged', () => {
    const rows = runTestSuite().map((r) => ({
      name: r.name,
      expectedChi: r.expectedChi,
      exactChi: r.exactChi,
      dsaturChi: r.dsaturChi,
      cliqueNumber: r.cliqueNumber,
      passed: r.passed,
    }));
    const expected = snapshot.suite.map((r) => ({
      name: r.name,
      expectedChi: r.expectedChi,
      exactChi: r.exactChi,
      dsaturChi: r.dsaturChi,
      cliqueNumber: r.cliqueNumber,
      passed: r.passed,
    }));
    expect(rows).toEqual(expected);
  });
});
