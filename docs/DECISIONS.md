# Decisions log

All dates 2026-10-29 unless noted. The brief's defaults were used unless an entry below records a deviation.

| # | Decision | Reason |
|---|---|---|
| 1 | Keep the existing Vite + React 19 + TypeScript stack; add Tailwind v4, Zustand, Radix, Phosphor and Fontsource. | The repo already ran React 19 + Vite; these are the brief's allowed dependencies. No additional UI or chart library was installed. |
| 2 | No router library. `#planner` is the only route, handled by `usePlannerRoute`. | A full router would add a dependency for one hash. Hash changes and `popstate` both close the dialog; direct links work. |
| 3 | Palette A “Midnight Indigo + Marigold” chosen over graphite/teal candidates. | Deep indigo separates shell from canvas; marigold survives projector gamma; the teal candidate echoed the legacy identity. |
| 4 | `--color-line-strong` raised from the brief's `#3A4575` to `#5F6A9E`. | `#3A4575` measured **1.99:1** on `--color-surface`, below the 3:1 non-text rule. The lift keeps the hue and reaches **3.51:1**. |
| 5 | Channel colours use a three-step lightness rhythm at chroma 0.17 instead of a single L/C. | A constant lightness made channels 6 and 11 collapse under deuteranopia (ΔE2000 ≈ 1). The rhythm clears ΔE2000 ≥ 15 for 1/6/11 under protan, deutan and tritan; minimum node-number contrast is 4.54:1. |
| 6 | Type: Rajdhani (display + Devanagari), Hind (UI + Devanagari), JetBrains Mono (data). | Two families cover both scripts; Teko/Baloo/Tiro were rejected for body legibility or a missing matching Latin face. Fonts are self-hosted. |
| 7 | Results drawer is **336 px** (xl 348 px), not the brief's 380–420 px. | At 1366×768 a 380 px drawer plus the 272 px parameters card leaves **49%** free canvas, breaking the ≥ 50% requirement. 348 px yields 51.6% free width. Tabs still fit in two rows with zero clipping at every tested width. Logged as a deliberate trade-off. |
| 8 | Left panel is 248 px (xl 272 px), slightly below the earlier 260–285 px suggestion. | Same 1366×768 canvas-area calculation; sliders and numeric fields still fit without truncation. |
| 9 | Mobile (< 1024 px) uses Graph / Parameters / Results panes rather than bottom sheets. | Bottom sheets covered the status strip and the action bar; full-height panes reuse the desktop cards and keep every control reachable at 390×844. |
| 10 | Clear uses a 5 s undo toast instead of a blocking confirmation. | The brief permits undo; it is faster for a viva and still recoverable. Delete behaves the same way. |
| 11 | T-colouring infeasibility is a **warning**, not an error. | A computed “no assignment” is a valid solver answer. Only worker exceptions use danger and the word “failed”. |
| 12 | New solve clears existing toasts before running. | A stale “T-coloring feasible” toast could otherwise sit beside a fresh “infeasible” result. This was visible in screenshot review and fixed. |
| 13 | Conflict icons are thinned to 240 stamps on very dense graphs and omitted while a node is dragged. | At 10k edges, 3,290 icons overlap into noise and doubled raster cost. Dashed edges and the exact conflict count remain; icons return on pointer-up. |
| 14 | `suggestFixes` gained an optional `limit` argument (default `Infinity`). | The Analysis panel showed four repairs but computed all 3,290 each render. The default preserves the engine's full output and the parity suite; the panel requests four. |
| 15 | The accessible AP list is memoised and no longer forces a full-list render on every drag frame. | 162 rows were re-rendering during interaction; this was part of the dense-scrub cost. |
| 16 | Canvas DPR is capped at 2. | Crisp text on retina without quadrupling fill cost; the cap is the brief's default. |
| 17 | Narrow screens fit the graph with 28 px padding instead of 64 px. | On 390 px the 64 px margin shrank the cluster until labels collided. Eight label-collision attempts replace three for the same reason. |
| 18 | No `Kbd` or `SegmentedControl` primitive was added. | The only segmented controls are the tool dock and mobile view switch, implemented as `aria-pressed` buttons. A `Kbd` chip had no repeated use; keyboard hints are plain text. Adding unused primitives would be dead code. |
| 19 | Presets compute the campus edge count with the engine instead of hard-coding it. | The displayed “15 edges” must stay true if radius or campus data changes; it is now derived at module load. |
| 20 | A service worker caches same-origin GETs in production only. | Viva demos may run without internet; no request is made to any third party, and dev is never cached. |
| 21 | No canvas zoom/pan was added; only “Fit graph”. | The canvas is fit-to-content on resize and preset load; adding pan without a real need would introduce another interaction to explain. View controls shown are the ones implemented. |
| 22 | The legacy characterization script and five legacy files were removed after parity passed. | The brief requires zero legacy UI. The baseline commit and `pre-revamp` tag preserve them; `tests/fixtures/legacy-snapshot.json` is the permanent contract. |
| 23 | Demo & Viva is a dialog of six buttons that act on the live planner. | It preserves the legacy guide while making every step reproducible; no scripted results are shown. |
| 24 | The wordmark is live Rajdhani/Hind text beside an inline SVG mark, not outlined SVG paths. | Fonts are self-hosted and loaded from the app origin, so the lockup is stable offline; keeping the mixed-script name as text preserves selection, localization and accessible naming without duplicating font outlines. The trade-off is a brief swap on first paint, not a missing glyph. |

## Open issues / limits

- The 152-AP stress graph is near-complete; the UI remains interactive but the canvas is visually a hairball by nature.
  Performance is at one vsync for drag and scrub with no long tasks.
- Lighthouse was not part of the automated suite; axe (serious/critical) and the measured contrast/performance audits
  are. See `05-qa-checklist.md` for the exact status.
- Source maps are emitted in `dist/` for local debugging. A deployment that serves `dist/` publicly should disable them.
