import { cliqueNumber, kuratowskiCheck, planarBoundCheck } from './analysis';
import { isBipartite } from './matching';
import { dsaturColoring, exactColoring, greedyColoring, welshPowellColoring } from './coloring';
import { TEST_GRAPHS } from './presets';
import type { BenchmarkRow, Graph, TestSuiteRow } from './types';

/** Run every coloring algorithm on the current graph. */
export function benchmarkAlgorithms(graph: Graph): BenchmarkRow[] {
  const results: BenchmarkRow[] = [];

  const t0 = performance.now();
  const greedy = greedyColoring(graph);
  const t1 = performance.now();
  results.push({ algorithm: 'Greedy', colors: greedy.numColors, time: (t1 - t0).toFixed(3), optimal: null });

  const t2 = performance.now();
  const wp = welshPowellColoring(graph);
  const t3 = performance.now();
  results.push({ algorithm: 'Welsh–Powell', colors: wp.numColors, time: (t3 - t2).toFixed(3), optimal: null });

  const t4 = performance.now();
  const ds = dsaturColoring(graph);
  const t5 = performance.now();
  results.push({ algorithm: 'DSatur', colors: ds.numColors, time: (t5 - t4).toFixed(3), optimal: null });

  if (graph.n <= 20) {
    const t6 = performance.now();
    const exact = exactColoring(graph);
    const t7 = performance.now();
    if (exact) {
      results.push({
        algorithm: 'Exact (Backtracking)',
        colors: exact.numColors,
        time: (t7 - t6).toFixed(3),
        optimal: true,
        nodesExplored: exact.nodesExplored,
      });
      for (const row of results) {
        if (row.algorithm !== 'Exact (Backtracking)') row.optimal = row.colors === exact.numColors;
      }
    }
  }

  return results;
}

/** Chromatic number checks against the known reference graphs. */
export function runTestSuite(): TestSuiteRow[] {
  const results: TestSuiteRow[] = [];

  for (const testGraph of Object.values(TEST_GRAPHS)) {
    const exact = exactColoring(testGraph);
    const dsatur = dsaturColoring(testGraph);
    const omega = cliqueNumber(testGraph);

    const result: TestSuiteRow = {
      name: testGraph.expected.name,
      expectedChi: testGraph.expected.chi,
      exactChi: exact ? exact.numColors : 'N/A',
      dsaturChi: dsatur.numColors,
      cliqueNumber: omega,
      passed: exact ? exact.numColors === testGraph.expected.chi : 'N/A',
      details: {},
    };

    if (testGraph.expected.planar === false) {
      result.details.planarity = {
        planar: planarBoundCheck(testGraph),
        kuratowski: kuratowskiCheck(testGraph),
      };
    }

    if (testGraph.expected.bipartite !== undefined) {
      const bipartite = isBipartite(testGraph).isBipartite;
      result.details.bipartite = bipartite;
      result.details.bipartiteMatch = testGraph.expected.bipartite === bipartite;
    }

    results.push(result);
  }

  return results;
}
