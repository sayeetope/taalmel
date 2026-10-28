import { create } from 'zustand';
import {
  CAMPUS_APS,
  PRESET_KEYS,
  TEST_GRAPHS,
  cliqueNumber,
  type BenchmarkRow,
  type PresetKey,
  type TestSuiteRow,
  type TColorResult,
} from '@/engine';
import type { ToastItem, ToastTone } from '@/components/ui/Toasts';
import { deriveGraph, graphStats, type AlgorithmKey, type GraphStats, type PlannerAp } from './derive';
import { solver } from '../workers/solverClient';

export type Tool = 'select' | 'add' | 'delete';
export type ResultTab = 'analysis' | 'proofs' | 'matching' | 'tcolor' | 'benchmark' | 'tests';

export interface TColorRun {
  revision: number;
  T: number;
  maxChannel: number;
  result: TColorResult | null;
  runtimeMs: number;
  omega: number | null;
  requiredSpan: number | null;
}

export interface BenchmarkRun {
  revision: number;
  rows: BenchmarkRow[];
}

export interface TestRun {
  rows: TestSuiteRow[];
}

export interface PolynomialRun {
  revision: number;
  coeffs: number[] | null;
}

interface UndoEntry {
  label: string;
  aps: PlannerAp[];
}

export interface PlannerState {
  aps: PlannerAp[];
  graph: ReturnType<typeof deriveGraph>['graph'];
  coloring: number[];
  stats: GraphStats;
  revision: number;

  defaultRadius: number;
  separation: number;
  maxChannel: number;
  algorithm: AlgorithmKey;
  /** 0 means unconstrained (χ). */
  maxColors: number;
  autoRecolor: boolean;
  showCoverage: boolean;
  showGrid: boolean;

  tool: Tool;
  activeTab: ResultTab;
  setActiveTab: (tab: ResultTab) => void;
  selectedId: number | null;
  fitNonce: number;
  nextId: number;

  tRun: TColorRun | null;
  tStatus: 'idle' | 'running';
  benchRun: BenchmarkRun | null;
  testRun: TestRun | null;
  polyRun: PolynomialRun | null;
  polyStatus: 'idle' | 'computing';
  running: 'benchmark' | 'tests' | null;

  undoStack: UndoEntry[];
  toasts: ToastItem[];

  loadPreset: (key: PresetKey) => void;
  setTool: (tool: Tool) => void;
  addAp: (x: number, y: number) => void;
  moveAp: (id: number, x: number, y: number) => void;
  deleteAp: (id: number) => void;
  clearAll: () => void;
  undo: () => void;
  selectAp: (id: number | null) => void;
  setApRadius: (id: number, radius: number | null) => void;
  setApColor: (id: number, color: number) => void;
  nudgeAp: (id: number, dx: number, dy: number) => void;

  setDefaultRadius: (value: number) => void;
  setSeparation: (value: number) => void;
  setMaxChannel: (value: number) => void;
  setAlgorithm: (value: AlgorithmKey) => void;
  setMaxColors: (value: number) => void;
  setAutoRecolor: (value: boolean) => void;
  setShowCoverage: (value: boolean) => void;
  setShowGrid: (value: boolean) => void;
  requestFit: () => void;

  recolor: () => void;
  runTColor: () => Promise<void>;
  runBenchmark: () => Promise<void>;
  runTests: () => Promise<void>;
  computePolynomial: () => Promise<void>;

  addToast: (message: string, tone?: ToastTone, action?: ToastItem['action']) => void;
  dismissToast: (id: number) => void;
  reset: () => void;
}

const DEFAULTS = {
  defaultRadius: 80,
  separation: 5,
  maxChannel: 13,
  algorithm: 'dsatur' as AlgorithmKey,
  maxColors: 3,
};

let toastSequence = 0;

function campusAps(): PlannerAp[] {
  return CAMPUS_APS.map((ap, index) => ({
    id: index + 1,
    label: ap.label,
    x: ap.x,
    y: ap.y,
    radius: null,
  }));
}

function presetAps(key: PresetKey): PlannerAp[] {
  if (key === 'campus') return campusAps();
  const graph = TEST_GRAPHS[key];
  return graph.pos.map((point, index) => ({
    id: index + 1,
    label: `AP${index + 1}`,
    x: point.x,
    y: point.y,
    radius: graph.radius[index],
  }));
}

export const usePlanner = create<PlannerState>()((set, get) => {
  const initial = deriveGraph(campusAps(), DEFAULTS.defaultRadius, DEFAULTS.algorithm, DEFAULTS.maxColors);

  /** Apply a topology or parameter change, then re-derive in one pass. */
  function apply(
    aps: PlannerAp[],
    options: { preserveColoring?: boolean; extra?: Partial<PlannerState> } = {}
  ): void {
    const state = get();
    const preserveColoring = options.preserveColoring ?? false;
    let preserved: number[] | undefined;

    if (preserveColoring) {
      const byId = new Map(state.aps.map((ap, index) => [ap.id, state.coloring[index]]));
      preserved = aps.map((ap) => byId.get(ap.id) ?? 0);
    }

    const derived = deriveGraph(
      aps,
      state.defaultRadius,
      state.algorithm,
      state.maxColors,
      preserved
    );

    // The T-coloring is a manual, expensive result: any change marks it stale.
    set({
      aps,
      graph: derived.graph,
      coloring: derived.coloring,
      stats: derived.stats,
      revision: state.revision + 1,
      ...options.extra,
    });

    if (derived.fallbackUsed) {
      get().addToast('Graph too large for exact search — used DSatur instead', 'warning');
    }
  }

  return {
    aps: initial.graph.n ? campusAps() : [],
    graph: initial.graph,
    coloring: initial.coloring,
    stats: initial.stats,
    revision: 1,

    ...DEFAULTS,
    autoRecolor: true,
    showCoverage: true,
    showGrid: true,

    tool: 'select',
    activeTab: 'analysis',
    selectedId: null,
    fitNonce: 0,
    nextId: campusAps().length + 1,

    tRun: null,
    tStatus: 'idle',
    benchRun: null,
    testRun: null,
    polyRun: null,
    polyStatus: 'idle',
    running: null,

    undoStack: [],
    toasts: [],

    loadPreset: (key) => {
      const aps = presetAps(key);
      const name = key === 'campus' ? 'Campus demo' : TEST_GRAPHS[key].expected.name;
      apply(aps, {
        extra: {
          selectedId: null,
          tRun: null,
          polyRun: null,
          undoStack: [],
          nextId: aps.length + 1,
          fitNonce: get().fitNonce + 1,
        },
      });
      get().addToast(`Loaded ${name} — ${aps.length} APs`, 'success');
    },

    setTool: (tool) => set({ tool }),
    setActiveTab: (activeTab) => set({ activeTab }),

    addAp: (x, y) => {
      const state = get();
      const id = state.nextId;
      const ap: PlannerAp = { id, label: `AP${id}`, x, y, radius: null };
      apply([...state.aps, ap], { extra: { selectedId: id } });
    },

    moveAp: (id, x, y) => {
      const state = get();
      const aps = state.aps.map((ap) => (ap.id === id ? { ...ap, x, y } : ap));
      apply(aps, { preserveColoring: !state.autoRecolor });
    },

    deleteAp: (id) => {
      const state = get();
      const target = state.aps.find((ap) => ap.id === id);
      if (!target) return;
      const undo: UndoEntry = { label: `delete ${target.label}`, aps: state.aps.map((ap) => ({ ...ap })) };
      const aps = state.aps.filter((ap) => ap.id !== id);
      apply(aps, {
        preserveColoring: !state.autoRecolor,
        extra: {
          selectedId: state.selectedId === id ? null : state.selectedId,
          undoStack: [...state.undoStack.slice(-9), undo],
        },
      });
      get().addToast(`Deleted ${target.label}`, 'info', { label: 'Undo', run: () => get().undo() });
    },

    clearAll: () => {
      const state = get();
      if (state.aps.length === 0) {
        get().addToast('There are no APs to clear', 'info');
        return;
      }
      const undo: UndoEntry = { label: 'clear all APs', aps: state.aps.map((ap) => ({ ...ap })) };
      apply([], {
        extra: { selectedId: null, undoStack: [...state.undoStack.slice(-9), undo], tool: 'add' },
      });
      get().addToast(`Cleared ${undo.aps.length} APs`, 'warning', { label: 'Undo', run: () => get().undo() });
    },

    undo: () => {
      const state = get();
      const entry = state.undoStack[state.undoStack.length - 1];
      if (!entry) return;
      set({ undoStack: state.undoStack.slice(0, -1) });
      apply(entry.aps, { extra: { selectedId: null } });
      get().addToast(`Restored state before ${entry.label}`, 'success');
    },

    selectAp: (id) => set({ selectedId: id }),

    setApRadius: (id, radius) => {
      const state = get();
      const aps = state.aps.map((ap) => (ap.id === id ? { ...ap, radius } : ap));
      apply(aps, { preserveColoring: !state.autoRecolor });
    },

    setApColor: (id, color) => {
      const state = get();
      const index = state.aps.findIndex((ap) => ap.id === id);
      if (index === -1) return;
      const coloring = [...state.coloring];
      coloring[index] = color;
      set({ coloring, stats: graphStats(state.graph, coloring) });
    },

    nudgeAp: (id, dx, dy) => {
      const state = get();
      const ap = state.aps.find((item) => item.id === id);
      if (!ap) return;
      get().moveAp(id, ap.x + dx, ap.y + dy);
    },

    setDefaultRadius: (value) => {
      set({ defaultRadius: value });
      apply(get().aps, { preserveColoring: !get().autoRecolor });
    },

    setSeparation: (value) => {
      set({ separation: value, revision: get().revision + 1 });
    },

    setMaxChannel: (value) => {
      set({ maxChannel: value, revision: get().revision + 1 });
    },

    setAlgorithm: (value) => {
      set({ algorithm: value });
      apply(get().aps);
    },

    setMaxColors: (value) => {
      set({ maxColors: value });
      apply(get().aps);
    },

    setAutoRecolor: (value) => set({ autoRecolor: value }),
    setShowCoverage: (value) => set({ showCoverage: value }),
    setShowGrid: (value) => set({ showGrid: value }),
    requestFit: () => set({ fitNonce: get().fitNonce + 1 }),

    recolor: () => {
      const state = get();
      apply(state.aps);
      get().addToast(`Recolored — ${get().stats.colors} color groups in use`, 'info');
    },

    runTColor: async () => {
      const state = get();
      if (state.graph.n === 0) {
        get().addToast('Place an AP before running T-coloring', 'warning');
        return;
      }
      const revision = state.revision;
      const omega = state.graph.n <= 25 ? cliqueNumber(state.graph) : null;
      const requiredSpan = omega === null ? null : (omega - 1) * state.separation + 1;
      // A new solve supersedes earlier solver messages; do not leave a stale
      // "feasible" toast beside a fresh "infeasible" one.
      set({ tStatus: 'running', toasts: [] });

      const started = performance.now();
      try {
        const result = await solver.tColor(state.graph, state.separation, state.maxChannel);
        set({
          tStatus: 'idle',
          activeTab: 'tcolor',
          tRun: {
            revision,
            T: state.separation,
            maxChannel: state.maxChannel,
            result,
            runtimeMs: performance.now() - started,
            omega,
            requiredSpan,
          },
        });
        get().addToast(
          result
            ? `T-coloring feasible — ${result.numDistinct} channels in use`
            : `No valid assignment with T = ${state.separation} in channels 1–${state.maxChannel}`,
          result ? 'success' : 'warning'
        );
      } catch (error) {
        set({ tStatus: 'idle' });
        get().addToast(error instanceof Error ? error.message : 'T-coloring failed', 'error');
      }
    },

    runBenchmark: async () => {
      const state = get();
      if (state.graph.n === 0) {
        get().addToast('Place an AP before benchmarking', 'warning');
        return;
      }
      set({ running: 'benchmark' });
      try {
        const rows = await solver.benchmark(state.graph);
        set({ benchRun: { revision: state.revision, rows }, running: null, activeTab: 'benchmark' });
      } catch (error) {
        set({ running: null });
        get().addToast(error instanceof Error ? error.message : 'Benchmark failed', 'error');
      }
    },

    runTests: async () => {
      set({ running: 'tests' });
      try {
        const rows = await solver.tests();
        set({ testRun: { rows }, running: null, activeTab: 'tests' });
      } catch (error) {
        set({ running: null });
        get().addToast(error instanceof Error ? error.message : 'Test suite failed', 'error');
      }
    },

    computePolynomial: async () => {
      const state = get();
      if (state.graph.n === 0) return;
      const revision = state.revision;
      set({ polyStatus: 'computing' });
      try {
        const coeffs = await solver.polynomial(state.graph);
        set({ polyRun: { revision, coeffs }, polyStatus: 'idle' });
      } catch (error) {
        set({ polyStatus: 'idle' });
        get().addToast(error instanceof Error ? error.message : 'Polynomial failed', 'error');
      }
    },

    addToast: (message, tone = 'info', action) => {
      const id = ++toastSequence;
      // Keep the stack short so it never buries the action bar.
      set((state) => ({ toasts: [...state.toasts.slice(-2), { id, message, tone, action }] }));
      setTimeout(() => get().dismissToast(id), 5000);
    },

    dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

    reset: () => {
      const aps = campusAps();
      const derived = deriveGraph(aps, DEFAULTS.defaultRadius, DEFAULTS.algorithm, DEFAULTS.maxColors);
      set({
        aps,
        graph: derived.graph,
        coloring: derived.coloring,
        stats: derived.stats,
        revision: 1,
        ...DEFAULTS,
        autoRecolor: true,
        showCoverage: true,
        showGrid: true,
        tool: 'select',
        activeTab: 'analysis',
        selectedId: null,
        nextId: aps.length + 1,
        tRun: null,
        tStatus: 'idle',
        benchRun: null,
        testRun: null,
        polyRun: null,
        polyStatus: 'idle',
        running: null,
        undoStack: [],
        toasts: [],
      });
    },
  };
});

/** Channel assignment for the current T-coloring run, showing an older result honestly. */
export function selectChannelAssignment(state: PlannerState): number[] | null {
  if (!state.tRun || !state.tRun.result) return null;
  if (state.tRun.revision !== state.revision) return null;
  return state.tRun.result.assignment;
}

export function selectTColorStale(state: PlannerState): boolean {
  return state.tRun !== null && state.tRun.revision !== state.revision;
}

/** True when the canvas should paint channel numbers rather than color groups. */
export function selectShowChannels(state: PlannerState): boolean {
  const assignment = selectChannelAssignment(state);
  return assignment !== null && assignment.length === state.aps.length;
}

export { PRESET_KEYS };
