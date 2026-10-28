import {
  CAMPUS_APS,
  buildInterferenceGraph,
  dsaturColoring,
  edgeCount,
  interferenceScore,
} from '@/engine';

/** Demo topology, identical to the planner's opening preset (80 m inherited). */
const demoGraph = buildInterferenceGraph(
  CAMPUS_APS.map((ap) => ({ x: ap.x, y: ap.y })),
  CAMPUS_APS.map(() => 80)
);
const demoColoring = dsaturColoring(demoGraph, 3).coloring;

export const demoFacts = {
  aps: CAMPUS_APS.length,
  pairs: edgeCount(demoGraph),
  groups: Math.max(...demoColoring) + 1,
  conflictsAfter: interferenceScore(demoGraph, demoColoring).score,
  conflictsBefore: edgeCount(demoGraph),
};

export const hero = {
  eyebrow: 'Campus Wi-Fi channel planner',
  title: 'Tune every access point to its own beat.',
  body:
    'Taalमेल turns overlapping campus Wi-Fi coverage into an interference graph, then colors it — so neighbouring access points stop fighting over the same channel.',
  primaryCta: 'Launch planner',
  secondaryCta: 'See how it works',
  nameStory:
    'ताल is rhythm. मेल is harmony. तालमेल is the state of being in sync — which is exactly what a channel plan is trying to reach.',
};

export const problem = {
  eyebrow: 'The problem',
  title: 'One campus. Many deployments. One crowded band.',
  intro:
    'Departments, labs and hostels each install their own access points. Nobody owns the space between them, so coverage overlaps and channels collide.',
  points: [
    {
      title: 'Overlap is normal, interference is not',
      body:
        'When two APs cover the same desk on the same channel, their frames collide. Clients retry, throughput drops, calls stutter.',
    },
    {
      title: 'The band is narrower than it looks',
      body:
        'Thirteen 2.4 GHz channels exist here, but only 1, 6 and 11 are mutually non-overlapping at 20 MHz. Everything else bleeds into its neighbour.',
    },
    {
      title: 'Hand planning stops scaling',
      body:
        'Twelve APs already create dozens of pairwise overlaps. By the time a campus has fifty, a spreadsheet cannot tell you which pair is the problem.',
    },
  ],
};

export const howItWorks = {
  eyebrow: 'How it works',
  title: 'Four steps from floor plan to channel plan.',
  steps: [
    {
      title: 'Place the access points',
      body: 'Click the canvas and drag APs into position. Each one has a coverage radius in metres.',
    },
    {
      title: 'Overlaps become edges',
      body: 'Two APs are adjacent when the distance between them is no more than the sum of their radii. That is the interference graph.',
    },
    {
      title: 'Color the graph',
      body: 'A coloring algorithm assigns channel groups so adjacent APs differ. The number of groups is the chromatic number when you let it run unconstrained.',
    },
    {
      title: 'Verify, then export',
      body: 'Run T-coloring, check the proofs, benchmark the algorithms and export the topology as JSON or the plot as PNG.',
    },
  ],
};

export const twoFixes = {
  eyebrow: 'Two ways out',
  title: 'Change the channels, or change the geometry.',
  options: [
    {
      label: 'Reassign channels',
      body:
        'Graph coloring gives interfering APs different channel groups. DSatur, Welsh–Powell, greedy and exact search are all available; T-coloring then assigns real channel numbers with a minimum separation.',
      tag: 'Frequency plan',
    },
    {
      label: 'Move APs or shrink coverage',
      body:
        'Sometimes the honest fix is physical. Drag an AP apart from its neighbour or reduce its radius until the coverage discs stop touching. The graph rebuilds as you do it.',
      tag: 'Physical plan',
    },
  ],
};

export interface Feature {
  title: string;
  body: string;
  span: string;
  icon: string;
}

export const features: Feature[] = [
  {
    title: 'Interactive interference graph',
    body:
      'Every AP is a node, every overlap an edge. Drag with the pointer; the graph, telemetry and coverage discs follow. Nothing is a screenshot.',
    span: 'md:col-span-6',
    icon: 'graph',
  },
  {
    title: 'Live coverage radius',
    body: 'The default radius updates every AP that inherits it while you drag the slider. Individual APs can override it.',
    span: 'md:col-span-3',
    icon: 'radius',
  },
  {
    title: 'Four coloring algorithms',
    body: 'DSatur, Welsh–Powell, greedy and exact backtracking, with the group count visible for each.',
    span: 'md:col-span-3',
    icon: 'layers',
  },
  {
    title: 'T-coloring with real channels',
    body: 'Assign channels 1–13 so that every interfering pair differs by at least T. The search runs in a Web Worker.',
    span: 'md:col-span-4',
    icon: 'wave',
  },
  {
    title: 'Channel capacity k',
    body: 'Cap the palette at 3, 4 or 5 groups — or let the graph use as many as it needs.',
    span: 'md:col-span-2',
    icon: 'sliders',
  },
  {
    title: 'Analysis and proofs',
    body:
      'Clique bounds, the pigeonhole argument, planarity tests, Euler’s formula, articulation points and the chromatic polynomial.',
    span: 'md:col-span-3',
    icon: 'proof',
  },
  {
    title: 'Bipartite matching',
    body: 'Maximum matching and Hall’s condition, with the violating subset named when the assignment is impossible.',
    span: 'md:col-span-3',
    icon: 'matching',
  },
  {
    title: 'Benchmark and test suite',
    body:
      'Compare algorithms on your graph, then run the seven reference graphs against their exact chromatic numbers.',
    span: 'md:col-span-4',
    icon: 'flask',
  },
  {
    title: 'Eight reference topologies',
    body: 'Campus demo plus K₄, C₅, K₅, K₃,₃, Petersen, the Hall bottleneck and a crowded 4-clique.',
    span: 'md:col-span-4',
    icon: 'grid',
  },
  {
    title: 'Demo & viva script',
    body: 'Six steps that load presets, run the real solver and produce the export — without leaving the tool.',
    span: 'md:col-span-4',
    icon: 'presentation',
  },
  {
    title: 'Export the evidence',
    body: 'Topology JSON with positions, radii and adjacency; PNG of the actual plotted canvas.',
    span: 'md:col-span-4',
    icon: 'export',
  },
];

export const underTheHood = {
  eyebrow: 'Under the hood',
  title: 'Two constraints, one model.',
  blocks: [
    {
      label: 'Graph coloring',
      body:
        'Each AP is a vertex. An edge means two coverage areas overlap. A proper coloring gives every edge two different colors; the smallest number of colors that works is the chromatic number χ(G). Clique number ω is a lower bound and Δ+1 is an upper bound.',
      formula: 'ω(G) ≤ χ(G) ≤ Δ(G) + 1',
    },
    {
      label: 'T-coloring',
      body:
        'Wi-Fi channels are not interchangeable. At 20 MHz, channels less than five apart overlap, which is why 1, 6 and 11 are the classic non-overlapping set. Taalमेल searches channels 1–N for an assignment where every interfering pair is at least T apart.',
      formula: '|c₁ − c₂| ≥ T for every edge',
    },
  ],
  limits: [
    'T-coloring is exhaustive backtracking: correct, but exponential in the worst case, so it runs off the main thread.',
    'Chromatic polynomials use deletion–contraction and are limited to 12 vertices.',
    'Exact coloring tries k = 1, 2, 3… and is limited to 20 vertices; beyond that the interface falls back to DSatur.',
    'Clique numbers are computed for graphs up to 25 vertices; above that the panel reports the upper bound only.',
  ],
};

export const audience = {
  eyebrow: 'Who it is for',
  title: 'Made for a campus, and for the room it is presented in.',
  people: [
    { title: 'Campus network teams', body: 'A quick model of where channels collide before anyone touches a controller.' },
    { title: 'Graph theory students', body: 'Coloring, cliques, Hall’s theorem and chromatic polynomials with a graph you can drag.' },
    { title: 'Faculty and judges', body: 'A demo that computes live, shows its bounds, and can prove when a constraint set is impossible.' },
  ],
  honesty:
    'Taalमेल is a college project, not a commercial RF planner. It models free-space overlap, not walls, Fresnel zones or measured signal strength.',
};

export const faq = {
  eyebrow: 'FAQ',
  title: 'Questions that come up in a viva.',
  items: [
    {
      q: 'Does this touch a real network?',
      a: 'No. Taalमेल is a planning model. It makes no network requests after loading and never contacts an access point.',
    },
    {
      q: 'Why do nodes show numbers as well as colors?',
      a: 'The number is the channel when a T-coloring is on screen, otherwise the color group. Color alone is never the only signal: the legend, the selected-AP readout and the assignment table repeat it in text.',
    },
    {
      q: 'Why can T = 5 be infeasible?',
      a: 'A clique of ω mutually overlapping APs needs a span of at least (ω − 1)·T + 1 channels. Four APs at T = 5 need 16 channels; the search range is 1–13, so no assignment exists. The solver reports the constraint, not a bug.',
    },
    {
      q: 'What is the difference between group coloring and channel coloring?',
      a: 'Group coloring only needs adjacent APs to differ. T-coloring needs their channel numbers to differ by at least T, which is a stronger constraint and can fail even when a 3-coloring exists.',
    },
    {
      q: 'Where is my data stored?',
      a: 'In the page’s memory for the current session. Nothing is uploaded, and reloading restores the campus demo.',
    },
    {
      q: 'Can it run without internet?',
      a: 'Yes. Fonts are self-hosted and the app is a static build; after it loads once, the planner works offline.',
    },
  ],
};

export const finalCta = {
  title: 'Open the planner and color the campus.',
  body:
    'The demo opens with twelve buildings and a working 3-group coloring. From there, drag an AP, change the radius, or run the solver yourself.',
  cta: 'Launch planner',
};
