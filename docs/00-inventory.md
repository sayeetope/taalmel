# 00 — Inventory and feature parity

Baseline: tag `pre-revamp`, commit `1b2540e` (`chore: preserve legacy SignalPlan implementation as baseline`). The
legacy implementation was a single static page (`index.html`, `ui.js`, `engine.js`, `mathtools.js`, `matching.js`,
`style.css`). This document records what existed, where it went, and the real ranges and data the redesign had to keep.

## Stack

| | Legacy | Revamp |
|---|---|---|
| Runtime | Static HTML + classic scripts, global `state` | Vite 7, React 19, TypeScript strict |
| Styling | 2,274 lines of hand-written CSS | Tailwind CSS v4 `@theme` tokens + scoped utilities |
| State | Mutable global object in `ui.js` | Zustand store (`features/planner/store`) |
| Graph | 2D canvas repainted on every pointer move | Two-layer canvas, rAF-coalesced, dirty-flagged |
| DOM | `innerHTML` string templates | Accessible React components, Radix primitives |
| Brand | “SignalPlan” | “Taalमेल” everywhere |

## Feature parity matrix

Status meaning: **Parity** = same capability, redesigned; **Parity+** = same capability with an added, verified
behaviour; **New** = added by this redesign without removing anything.

| Legacy control / feature | Legacy location | New location | Status |
|---|---|---|---|
| Add AP mode | `#btnAddMode`, toolbar | Tool dock → Add AP (`A`), then click canvas; keyboard `A` adds at view centre | Parity |
| Select / drag AP | Canvas pointer handlers | Tool dock → Select (`V`); pointer drag with capture | Parity+ (rAF-coalesced, commit on pointer-up) |
| Delete one AP | `#btnDeleteMode` + click node | Tool dock → Delete; `Delete`/`Backspace`; AP list row | Parity |
| Clear all APs | `#btnClear` + blocking `#clearConfirmModal` | Tool dock → Clear, undo toast (5 s) | Parity+ (non-blocking undo) |
| Recolor with chosen algorithm | `#btnRecolor` | Action bar → Recolor | Parity |
| Run T-coloring | `#btnTColor` | Action bar → T-Color (primary); T-Coloring tab → Run | Parity+ (worker, stale chip, infeasibility diagnosis) |
| Benchmark | `#btnBenchmark` | Benchmark tab → Run benchmark | Parity |
| Test suite | `#btnRunTests` | Tests tab → Run tests | Parity |
| Presets dialog | `#btnLoadPreset`, `#presetModal` | Header → Presets (Radix dialog), 8 presets | Parity |
| Demo & viva guide | `#btnDemoGuide`, `#demoVivaModal` | Header → Demo & Viva, 6 live steps | Parity+ (steps act on real state) |
| Export JSON | Export dropdown `#btnExportJSON` | Header → Export → Topology JSON | Parity |
| Export PNG | Export dropdown `#btnExportPNG` | Header → Export → RF plot PNG (grid + graph) | Parity |
| Fit graph | Automatic refit only | Tool dock → Fit graph | New (explicit) |
| Coverage layer toggle | `#btnToggleCoverage` | Action bar → Coverage switch | Parity |
| Grid layer toggle | `#btnToggleGrid` | Action bar → Grid switch | Parity |
| Band label “2.4 GHz · Ch 1–13” | Header `.band-range` | Header chip reflects live span `1–N` | Parity |
| Coloring algorithm select | `#selAlgorithm` | Parameters → Coloring algorithm | Parity (same 4 options) |
| Channel capacity select | `#selMaxColors` | Parameters → Channel capacity | Parity (same 4 options) |
| Default AP radius slider | `#sliderRadius`, 30–200 m, step 5, default 80 | Parameters → Coverage radius, same range; live for all inheriting APs | Parity+ (legacy only affected new APs) |
| Frequency separation T | `#sliderSeparation`, 1–8, step 1, default 5 | Parameters → Frequency separation, same | Parity |
| Channel span | `#sliderMaxChannel`, 3–13, step 1, default 13 | Parameters → Channel span, same | Parity |
| Per-AP radius override | None in UI (stored per AP) | Analysis → Selected AP → AP coverage radius + Reset to default | New (uses existing model) |
| Graph telemetry | `#canvasTelemetryText` | Status strip (V, E, groups, conflicts) + Analysis → Graph bounds | Parity+ |
| Selected-AP readout | `#canvasSelection` chip | Status strip selected chip (label · channel/group · radius) | Parity |
| Spectrum allocation legend | Left pane allocation cards | Analysis → Allocation + canvas channel legend | Parity |
| Tabs: Analysis, Proofs, Matching, T-Coloring, Benchmark, Tests | `.analysis-nav` buttons | Results drawer Radix tabs, wrapping two rows | Parity |
| Narrow-screen view switcher (Settings/Graph/Analysis) | `#viewBar` | Mobile tabs: Graph / Parameters / Results | Parity+ |
| Analysis: bounds, selected AP, conflict repairs | `ui.js` renderers | Analysis tab | Parity |
| Proofs: pigeonhole, planarity, Kuratowski, Euler, articulation, polynomial, count | `ui.js`/`mathtools.js` | Proofs tab, same engine functions | Parity |
| Matching: bipartition, maximum matching, Hall, channel model | `matching.js` | Matching tab, same engine | Parity |
| T-coloring result with params, feasibility, assignments | `ui.js` renderer | T-Coloring tab | Parity+ (explicit infeasibility, stale banner) |
| Benchmark table | `ui.js` | Benchmark tab | Parity |
| Tests table | `ui.js` | Tests tab | Parity |
| Keyboard shortcuts | Tab focus, Esc for dialogs | `V`, `A`, `Delete`, arrow nudges in AP list, Esc closes | Parity+ |
| Canvas accessible description | `role="img"` + `sr-only` text | Canvas `aria-hidden`; parallel AP list + dialog description + live region | Parity+ |

## Slider and parameter facts (read from the legacy markup and preserved)

| Parameter | Min | Max | Step | Default | Unit | Notes |
|---|---|---|---|---|---|---|
| Default AP radius | 30 | 200 | 5 | 80 | m | `null` on an AP means inherit; override is per AP |
| Frequency separation T | 1 | 8 | 1 | 5 | channels | `|c₁ − c₂| ≥ T` on every edge |
| Channel span | 3 | 13 | 1 | 13 | channel number | Search range is 1…N |
| Channel capacity k | 3 / 4 / 5 / unconstrained | — | — | 3 | groups | `0` in the store means χ (unconstrained) |

Model scale: canvas geometry is stored in **metres** (`PlannerAp.x/y`), not pixels. There is no fixed px↔metre
constant; `fitView` computes a uniform scale that fits all coverage discs into the canvas with 64 px padding, so the
scale bar is the only honest px↔m readout and is redrawn with the viewport.

## Preset data

| Key | Name | APs | χ expected | Edges in data | Note |
|---|---|---|---|---|---|
| `campus` | Campus demo / Campus Enterprise | 12 | — (DSatur) | 15 at 80 m | Library, Lab A/B, Admin, Cafeteria, Lecture 1/2, Workshop, Dorm A/B, Gym, Auditorium |
| `pigeonholeCrowded` | Pigeonhole 4-Clique | 4 | 4 | 6 | Four mutually overlapping APs |
| `hallViolation` | Hall Violation Bottleneck | 5 | 2 | 3 | Three APs share one neighbour |
| `K4` | K₄ | 4 | 4 | 6 | Complete graph |
| `C5` | C₅ | 5 | 3 | 5 | Odd cycle |
| `K5` | K₅ | 5 | 5 | 10 | Non-planar |
| `K33` | K₃,₃ | 6 | 2 | 9 | Bipartite, non-planar |
| `Petersen` | Petersen | 10 | 3 | 15 | Classic 3-chromatic graph |

Campus coordinates are the legacy offsets (`-210,-170` … `60,220`). The campus graph is built from those positions
with a radius, not from a stored adjacency list.

## Logic modules moved into `src/engine` (pure TypeScript, no React/DOM)

| Module | Responsibility | Key inputs → outputs |
|---|---|---|
| `graph.ts` | Interference adjacency, degrees, neighbours | `Point[]`, `radius[]` → `Graph {n, adj, pos, radius}` |
| `coloring.ts` | Greedy, Welsh–Powell, DSatur, exact, interference score, repair suggestions | `Graph`, `maxColors` → `ColoringResult` / `ConflictScore` / `FixSuggestion[]` |
| `tcoloring.ts` | Backtracking T-coloring, clique span bound | `Graph`, `T`, `maxChannel` → `TColorResult \| null` |
| `analysis.ts` | Cliques, planarity checks, Euler, articulation, colour counting | `Graph` → checks and bounds |
| `chromatic.ts` | Chromatic polynomial, evaluation, formatting | `Graph` → `number[] \| null` |
| `matching.ts` | Bipartition, maximum matching, Hall, channel model | `Graph` → `MatchingResult`, `HallResult` |
| `benchmark.ts` | Runs four colorings on a graph | `Graph` → `BenchmarkRow[]` |
| `presets.ts` | Campus data and seven reference graphs | preset key → `TestGraph` |
| `types.ts` | Shared types | — |

UI-only derivation lives in `features/planner/store/derive.ts` (`PlannerAp`, `deriveGraph`, `graphStats`). It is the
single place topology and coloring are recomputed; drag frames never call it.

## Characterization

Before any logic moved, `scripts/characterize-legacy.mjs` ran the legacy scripts under Node and wrote
`tests/fixtures/legacy-snapshot.json`: campus facts plus every reference graph’s edge count, degree sequence, clique,
connectivity, articulation points, greedy/Welsh/DSatur/exact colorings, three T-coloring runs, chromatic polynomial,
planarity facts, bipartition, matching, channel model and benchmark rows.

`tests/unit/engine-parity.test.ts` re-runs the TypeScript engine and compares all 58 cases. It passes unchanged. The
snapshot remains the contract for algorithm behaviour; the redesign did not edit it.

## Deleted legacy files

`index.html` legacy markup, `ui.js`, `engine.js`, `mathtools.js`, `matching.js`, `style.css`, and the one-off
characterization script were removed after the parity suite passed. The baseline commit and `pre-revamp` tag retain
them for reference. No legacy markup, class names, teal/cream palette or old brand text remains in the shipped app.
