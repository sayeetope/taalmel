import { benchmarkAlgorithms, chromaticPolynomial, runTestSuite, tColoring } from '@/engine';
import type { BenchmarkRow, Graph, TestSuiteRow, TColorResult } from '@/engine';

type SolverPayload =
  | { kind: 'tcolor'; graph: Graph; T: number; maxChannel: number }
  | { kind: 'benchmark'; graph: Graph }
  | { kind: 'tests' }
  | { kind: 'polynomial'; graph: Graph };

interface SolverResponse {
  id: number;
  ok: boolean;
  data?: unknown;
  error?: string;
}

let worker: Worker | null = null;
let workerBroken = false;
let sequence = 0;
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();

function getWorker(): Worker | null {
  if (workerBroken || typeof Worker === 'undefined') return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<SolverResponse>) => {
      const entry = pending.get(event.data.id);
      if (!entry) return;
      pending.delete(event.data.id);
      if (event.data.ok) entry.resolve(event.data.data);
      else entry.reject(new Error(event.data.error ?? 'Solver failed'));
    };
    worker.onerror = () => {
      workerBroken = true;
      for (const entry of pending.values()) entry.reject(new Error('Solver worker crashed'));
      pending.clear();
      worker = null;
    };
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

function request<T>(payload: SolverPayload): Promise<T> {
  const instance = getWorker();
  if (!instance) {
    // Synchronous fallback for tests and environments without module workers.
    switch (payload.kind) {
      case 'tcolor':
        return Promise.resolve(tColoring(payload.graph, payload.T, payload.maxChannel) as unknown as T);
      case 'benchmark':
        return Promise.resolve(benchmarkAlgorithms(payload.graph) as unknown as T);
      case 'tests':
        return Promise.resolve(runTestSuite() as unknown as T);
      case 'polynomial':
        return Promise.resolve(chromaticPolynomial(payload.graph) as unknown as T);
    }
  }

  const id = ++sequence;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
    instance.postMessage({ ...payload, id });
  });
}

export const solver = {
  tColor: (graph: Graph, T: number, maxChannel: number) =>
    request<TColorResult | null>({ kind: 'tcolor', graph, T, maxChannel }),
  benchmark: (graph: Graph) => request<BenchmarkRow[]>({ kind: 'benchmark', graph }),
  tests: () => request<TestSuiteRow[]>({ kind: 'tests' }),
  polynomial: (graph: Graph) => request<number[] | null>({ kind: 'polynomial', graph }),
};

/** Test hook: forget the worker between test files. */
export function resetSolverWorker(): void {
  worker?.terminate();
  worker = null;
  workerBroken = false;
  pending.clear();
}
