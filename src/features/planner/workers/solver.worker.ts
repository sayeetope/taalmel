/// <reference lib="webworker" />
import { benchmarkAlgorithms, chromaticPolynomial, runTestSuite, tColoring } from '@/engine';
import type { Graph } from '@/engine';

interface SolverRequest {
  id: number;
  kind: 'tcolor' | 'benchmark' | 'tests' | 'polynomial';
  graph?: Graph;
  T?: number;
  maxChannel?: number;
}

interface SolverResponse {
  id: number;
  ok: boolean;
  data?: unknown;
  error?: string;
}

self.onmessage = (event: MessageEvent<SolverRequest>) => {
  const { id, kind, graph, T, maxChannel } = event.data;
  try {
    let data: unknown;
    switch (kind) {
      case 'tcolor':
        if (!graph) throw new Error('Missing graph');
        data = tColoring(graph, T ?? 5, maxChannel ?? 13);
        break;
      case 'benchmark':
        if (!graph) throw new Error('Missing graph');
        data = benchmarkAlgorithms(graph);
        break;
      case 'tests':
        data = runTestSuite();
        break;
      case 'polynomial':
        if (!graph) throw new Error('Missing graph');
        data = chromaticPolynomial(graph);
        break;
    }
    const response: SolverResponse = { id, ok: true, data };
    self.postMessage(response);
  } catch (error) {
    const response: SolverResponse = {
      id,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown solver error',
    };
    self.postMessage(response);
  }
};
