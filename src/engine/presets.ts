import { buildInterferenceGraph } from './graph';
import type { Graph, Point } from './types';

export interface ExpectedGraphFacts {
  name: string;
  chi: number;
  planar?: boolean;
  bipartite?: boolean;
}

export interface TestGraph extends Graph {
  key: string;
  expected: ExpectedGraphFacts;
  note: string;
}

function makeAdj(n: number, edges: Array<[number, number]>): boolean[][] {
  const adj = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
  for (const [i, j] of edges) {
    adj[i][j] = true;
    adj[j][i] = true;
  }
  return adj;
}

function ring(n: number, radius: number, offset = -Math.PI / 2): Point[] {
  return Array.from({ length: n }, (_, i) => ({
    x: 300 + radius * Math.cos((2 * Math.PI * i) / n + offset),
    y: 300 + radius * Math.sin((2 * Math.PI * i) / n + offset),
  }));
}

const K4_EDGES: Array<[number, number]> = [];
for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) K4_EDGES.push([i, j]);

const K5_EDGES: Array<[number, number]> = [];
for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) K5_EDGES.push([i, j]);

const K33_EDGES: Array<[number, number]> = [];
for (let i = 0; i < 3; i++) for (let j = 3; j < 6; j++) K33_EDGES.push([i, j]);

const PETERSEN_EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
  [5, 7], [7, 9], [9, 6], [6, 8], [8, 5],
  [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
];

const PETERSEN_POS: Point[] = [
  ...ring(5, 120),
  ...ring(5, 50),
];

/** Keyed reference graphs; keys match the legacy preset identifiers. */
export const TEST_GRAPHS: Record<string, TestGraph> = {
  K4: {
    key: 'K4',
    n: 4,
    adj: makeAdj(4, K4_EDGES),
    pos: ring(4, 80, 0),
    radius: Array<number>(4).fill(60),
    expected: { name: 'K₄', chi: 4 },
    note: 'Every AP overlaps every other. Four channels are unavoidable.',
  },
  C5: {
    key: 'C5',
    n: 5,
    adj: makeAdj(5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]),
    pos: ring(5, 100),
    radius: Array<number>(5).fill(50),
    expected: { name: 'C₅', chi: 3 },
    note: 'An odd cycle: two channels go round in pairs, the last needs a third.',
  },
  K5: {
    key: 'K5',
    n: 5,
    adj: makeAdj(5, K5_EDGES),
    pos: ring(5, 90),
    radius: Array<number>(5).fill(55),
    expected: { name: 'K₅', chi: 5, planar: false },
    note: 'Five mutually overlapping APs — also a Kuratowski non-planarity witness.',
  },
  K33: {
    key: 'K33',
    n: 6,
    adj: makeAdj(6, K33_EDGES),
    pos: [
      { x: 200, y: 200 }, { x: 300, y: 200 }, { x: 400, y: 200 },
      { x: 200, y: 400 }, { x: 300, y: 400 }, { x: 400, y: 400 },
    ],
    radius: Array<number>(6).fill(50),
    expected: { name: 'K₃,₃', chi: 2, planar: false, bipartite: true },
    note: 'Two departments, all-to-all overlap. Bipartite, so two groups suffice.',
  },
  Petersen: {
    key: 'Petersen',
    n: 10,
    adj: makeAdj(10, PETERSEN_EDGES),
    pos: PETERSEN_POS,
    radius: Array<number>(10).fill(40),
    expected: { name: 'Petersen', chi: 3 },
    note: 'Classic 3-chromatic graph used to check the exact solver.',
  },
  hallViolation: {
    key: 'hallViolation',
    n: 5,
    adj: makeAdj(5, [[0, 3], [1, 3], [2, 3]]),
    pos: [
      { x: 220, y: 180 }, { x: 220, y: 300 }, { x: 220, y: 420 },
      { x: 420, y: 240 }, { x: 420, y: 360 },
    ],
    radius: Array<number>(5).fill(75),
    expected: { name: 'Hall Violation Bottleneck', chi: 2, bipartite: true },
    note: 'Three APs can only reach one shared slot — Hall’s condition fails.',
  },
  pigeonholeCrowded: {
    key: 'pigeonholeCrowded',
    n: 4,
    adj: makeAdj(4, K4_EDGES),
    pos: [
      { x: 280, y: 240 },
      { x: 380, y: 240 },
      { x: 330, y: 330 },
      { x: 330, y: 270 },
    ],
    radius: Array<number>(4).fill(80),
    expected: { name: 'Pigeonhole 4-Clique (Crowded)', chi: 4 },
    note: 'Four APs in one huddle. With three channels, one pair must collide.',
  },
};

export const PRESET_KEYS = [
  'campus',
  'pigeonholeCrowded',
  'hallViolation',
  'K4',
  'C5',
  'K5',
  'K33',
  'Petersen',
] as const;

export type PresetKey = (typeof PRESET_KEYS)[number];

/** Campus demo: the twelve deployments the product opens with. */
export interface CampusAp {
  label: string;
  x: number;
  y: number;
}

export const CAMPUS_APS: CampusAp[] = [
  { label: 'Library', x: -210, y: -170 },
  { label: 'Lab A', x: -80, y: -190 },
  { label: 'Lab B', x: 70, y: -150 },
  { label: 'Admin', x: 190, y: -120 },
  { label: 'Cafeteria', x: -230, y: -20 },
  { label: 'Lecture 1', x: -60, y: -30 },
  { label: 'Lecture 2', x: 90, y: -10 },
  { label: 'Workshop', x: 210, y: 30 },
  { label: 'Dorm A', x: -170, y: 130 },
  { label: 'Dorm B', x: -20, y: 150 },
  { label: 'Gym', x: 130, y: 140 },
  { label: 'Auditorium', x: 60, y: 220 },
];

/** Legacy campus graph, retained for characterization parity (95 m radii). */
export function buildCampusGraph(radius = 95): Graph {
  return buildInterferenceGraph(
    CAMPUS_APS.map((ap) => ({ x: ap.x, y: ap.y })),
    CAMPUS_APS.map(() => radius)
  );
}
