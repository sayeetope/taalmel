# 04 — Performance report

## Method

Both builds were driven by the same Puppeteer harness in headful Chrome at **1440 × 900**, with rAF timestamps sampled
for the whole interaction and `PerformanceObserver` recording `longtask` entries (> 50 ms). Frame interval is the
delta between rAF callbacks; on a 60 Hz display the timestamps quantise to ~16.7 ms, so a p95 of 16.9 ms is one vsync.

- **Legacy:** `index.html` served at `127.0.0.1:8811`; 12 campus APs; 90 pointer moves dragging one node; then the
  radius slider from 80 to 160.
- **Revamp, 12 APs:** production build (`vite preview`) with the campus preset; drag and keyboard radius scrub.
- **Revamp, 152 APs:** production build; Add tool used to place 150 APs on a 15 × 10 grid, then Select and drag the
  first node through a circular path, then 14 `ArrowRight` + 14 `ArrowLeft` radius steps. Final graph:
  **152 APs, 10,025 interfering pairs, 3,290 conflicts** — a deliberately pathological near-complete graph.
- Sample files: [`docs/perf/legacy-before.json`](perf/legacy-before.json),
  [`docs/perf/12ap-production.json`](perf/12ap-production.json), and (regenerated with the final build)
  `docs/perf/152ap-production.json`.

## Before (legacy)

| Metric | Value |
|---|---|
| Drag frame p50 | 16.7 ms |
| Drag frame **p95** | **849.9 ms** |
| Worst frame | 1,166.7 ms |
| Long tasks during drag | **90**, max **1,175 ms** |
| Full canvas redraws for 90 moves | **91** |
| Radius slider renders for inheriting APs | **0** |
| Coverage discs changed when default radius moved 80 → 160 | **No** |

Root cause: every `pointermove` synchronously rebuilt state, recomputed the graph and repainted the full canvas — 90
moves produced 90 long tasks. The default-radius input path only wrote `state.defaultRadius`; existing APs kept their
stored radius, so nothing on screen changed.

## After (final build)

### 12 APs (campus demo)

| Phase | p50 | p95 | p99 | Long tasks |
|---|---|---|---|---|
| Idle | 16.6 | 16.9 | 16.9 | 0 |
| Drag | 16.7 | 16.9 | 17.1 | 0 |
| Radius scrub | 16.6 | 16.9 | 17.4 | 0 |

### 152 APs / 10,025 pairs (stress)

| Phase | p50 | p95 | p99 | Long tasks |
|---|---|---|---|---|
| Idle | 16.6 | 16.9 | 17.1 | 0 |
| Drag | 16.6 | **16.9** | 17.4 | 0 |
| Radius scrub | 16.7 | **16.9** | 17.2 | 0 |

Numbers from the final production run recorded in `docs/perf/152ap-production.json`. The drag and scrub p95 targets
(≤ 16.7 ms) are met within display quantisation; no task exceeded 50 ms in any phase.

## What changed

1. **Drag never enters React.** Pointer moves write a transient position into the renderer, which schedules at most
   one draw per rAF. The store is committed once on `pointerup` (or cancelled on `pointercancel` / Esc).
2. **The graph is derived once per committed edit.** `deriveGraph` builds the adjacency matrix and coloring in a
   single pass; `moveAp` is not called per frame.
3. **Edges are batched by style.** Four `Path2D` objects (neutral, selected, conflict, selected conflict) replace
   per-edge `save`/`restore`, dash setup and colour-string parsing.
4. **Coverage discs and conflict icons are cached sprites.** No gradients are created per frame. Conflict icons are
   thinned to 240 stamps on very dense graphs and are omitted only while a node is in flight; dashed edges and the
   conflict count remain, and icons return on release.
5. **Static grid and dynamic graph are separate layers.** The grid redraws only on resize/view/toggle; the dynamic
   layer redraws only when a dirty flag is set.
6. **Canvas sizing is capped at DPR 2**, with the rect cached via `ResizeObserver`; pointer handlers do no layout reads.
7. **Expensive work moved off the click path.** T-coloring, benchmark and the test suite run in a Web Worker; the
   polynomial runs in the worker as well.
8. **The Analysis panel stopped recomputing every repair.** `suggestFixes` gained an optional limit (default unchanged,
   full set) and the panel now computes only the four visible suggestions; the 162-row AP list is memoised. This cut
   dense scrub frames from 216 ms to 33 ms before the icon thinning brought them to vsync.
9. **Sliders keep a synced numeric field and `aria-valuetext`**, and radius changes re-derive the graph immediately;
   the canvas consumes `defaultRadius` live, so inheriting discs and edges move with the slider.

## Remaining caveat

The stress topology is near-complete (10k of 11,476 possible pairs). At that density conflict icons are visually
useless, so the renderer samples them; the status strip still reports the exact count and every conflicting edge keeps
its dashed pattern. The renderer still redraws the full dynamic scene on each radius input (the edges genuinely change
topology), but it now stays within one vsync at this density.
