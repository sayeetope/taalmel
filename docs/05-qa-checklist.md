# 05 — QA checklist

Final verification run: 2026-10-29, production build from the final source tree. “Pass” means the check was executed;
anything not run is listed under **Not run / open**.

## Build and static checks

| Check | Result | Evidence |
|---|---|---|
| TypeScript strict build | **Pass** | `npx tsc -b` exit 0 |
| Production build | **Pass** | `npm run build` exit 0; `dist/` emitted |
| ESLint (including engine/UI boundaries) | **Pass** | `npx eslint .` exit 0, no warnings |
| Dependency audit for unused packages | **Pass** | No package imported only for visuals; Fontsource, Radix, Phosphor, Zustand, culori (test-only) all used |
| Legacy UI removal | **Pass** | `ui.js`, `engine.js`, `mathtools.js`, `matching.js`, `style.css`, legacy docs/screenshots removed; only `README.md` and new sources remain |
| Branding | **Pass** | Title, meta, header, README, package name, exports read “Taalमेल” |

## Unit and parity

| Check | Result | Evidence |
|---|---|---|
| Engine parity with legacy snapshots | **Pass** | 58 tests, `tests/unit/engine-parity.test.ts`; fixture unchanged |
| Store transitions (add/delete/undo/clear/radius/stale/recolor) | **Pass** | 6 tests, `planner-store.test.ts` |
| Channel palette separation + CVC | **Pass** | 4 tests, `channel-colors.test.ts`; 1/6/11 ΔE2000 ≥ 15 under protan/deutan/tritan |
| Full unit suite | **Pass** | **68/68**, 3 files |

## End-to-end and accessibility

`npx playwright test` — **5/5 passed**.

| Check | Result | Evidence |
|---|---|---|
| Home axe scan, zero serious/critical | **Pass** | Test 1 |
| Planner axe scan, zero serious/critical | **Pass** | Test 2; Radix dialog + axe |
| Add AP changes real store count | **Pass** | Test 2 |
| Drag commits a changed model position | **Pass** | Test 2 |
| Radius slider changes store and repaints canvas pixels live | **Pass** | Test 2 |
| Recolor executes engine and toasts | **Pass** | Test 2 |
| T-Color runs, opens tab, result is fresh relative to revision | **Pass** | Test 2 |
| JSON export downloads `.json` | **Pass** | Test 2 |
| Coverage/grid switches expose state and toggle | **Pass** | Test 3 |
| Clear + Undo restores all APs | **Pass** | Test 3 (caught and fixed nested-dialog dismissal) |
| Preset loads the real K₄ graph | **Pass** | Test 3 |
| PNG export downloads `.png` | **Pass** | Test 3 |
| Proofs and Matching tabs render live engine output | **Pass** | Test 4 |
| Benchmark runs in the worker and fills its table | **Pass** | Test 4 |
| Known-graph test suite runs and reports pass count | **Pass** | Test 4 |
| Esc closes, URL hash clears, focus returns to launch button, reopening preserves graph | **Pass** | Test 5 |
| Presets Escape closes only presets, planner stays | **Pass** | Manual Puppeteer probe |
| Clicking inside presets does not close planner | **Pass** | Manual Puppeteer probe |
| Toast action (Undo) does not close planner | **Pass** | Manual probe + E2E test 3 |

## Visual / responsive

Screenshots in [`docs/screenshots`](screenshots). Legacy comparison: [`legacy-1366.png`](screenshots/legacy-1366.png).

| Viewport | Result | Evidence |
|---|---|---|
| 1920 × 1080 home + planner | **Pass** | `home-1920.png`, `planner-1920.png`; no page overflow |
| 1440 × 900 home | **Pass** | `home-1440.png` |
| 1366 × 768 home + planner | **Pass** | `home-1366.png`, `planner-1366.png`; free strip between panels 686 px of 1330 = **51.6%** |
| 1024 × 768 planner | **Pass** | `planner-1024.png`; two panels, 380 px free, tabs unclipped |
| 768 × 1024 planner | **Pass** | `planner-768.png`; mobile nav, 44 px targets |
| 390 × 844 home/planner/params/results | **Pass** | `home-390.png`, `planner-390.png`, `planner-390-parameters.png`, `planner-390-results.png`; no horizontal overflow |
| 360 × 740 home | **Pass** | `home-360.png` |
| 200% zoom equivalent (683 × 384) | **Pass** | `home-200pct.png`, `planner-200pct.png`; no overflow; planner keeps a 671 × 233 canvas and all views |
| All six result tabs visible, no clipped labels | **Pass** | 0 tabs with `scrollWidth > width` at every size |
| Reduced motion | **Pass** | `prefers-reduced-motion: reduce` → computed transition duration 0.01 ms |
| No purple/neon/glass/emoji; no centered three-icon-card home | **Pass** | Visual review of the screenshots against the banned-tropes list |
| Projector readability | **Pass with caveat** | 15–16 px body, 12 px minimum dense text, accent 10.9:1; dense conflict icons intentionally thinned |
| T-Coloring infeasible state | **Pass** | `planner-infeasible.png`: warning badge, exact T/span/ω, truthful next actions, no error styling |
| T-Coloring feasible state | **Pass** | `planner-tcolor.png`: real assignment, channel colours + numbers, 3 channels |

## Console, network and offline

| Check | Result | Evidence |
|---|---|---|
| No console errors / page errors on home or planner | **Pass** | Final screenshot run, `errors: []` |
| Only same-origin requests | **Pass** | Allowed origins contained only `http://127.0.0.1:5173` |
| Service worker activates in production | **Pass** | State `activated` |
| Offline reload shows the home page | **Pass** | Title + H1 present with network disabled |
| Offline planner opens with demo graph | **Pass** | Dialog visible, 2 canvases, status strip “12 APs / 15 interfering pairs” |
| No console errors while offline | **Pass** | `errors: []` |

## Performance

See [`04-perf-report.md`](04-perf-report.md) and raw evidence in [`docs/perf`](perf).

| Check | Result |
|---|---|
| Legacy drag p95 | 849.9 ms, 90 long tasks |
| Legacy live radius | 0 renders; discs unchanged |
| 12 AP drag/scrub p95 | 16.9 ms, 0 long tasks |
| 152 AP / 10,025 pairs drag p95 | 16.9 ms, 0 long tasks |
| 152 AP / 10,025 pairs scrub p95 | 16.9 ms, 0 long tasks |
| Static layer only on resize/view/grid toggle | Pass by code inspection + frame sections |

## Lighthouse (desktop preset)

| Surface | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Home | **99** | **100** | **100** | 91 |
| Planner (`#planner`) | **98** | **100** | **100** | n/a (not requested) |

LCP 0.8 s home / 1.0 s planner; CLS 0 / 0.008; TBT 0 ms / 40 ms. Raw JSON:
[`lighthouse-home.json`](perf/lighthouse-home.json), [`lighthouse-planner.json`](perf/lighthouse-planner.json).

## Not run / open

- Real RF validation (walls, Fresnel zones, measured RSSI) is out of scope; the model is free-space overlap by design.
- Canvas pan/zoom is not implemented; only fit-to-view. No dead controls were added.
- The results drawer is 336–348 px rather than 380–420 px to satisfy the ≥ 50% free-canvas rule at 1366×768
  (`DECISIONS.md` #7).
- Conflict icons are sampled when > 240 conflicts and hidden during a drag; dashed edges and the exact count remain.
- `dist/` includes source maps for local debugging; disable them before publishing if source disclosure matters.
- Mobile uses panes rather than bottom sheets (`DECISIONS.md` #9).
- Automated tests cover Chromium (Playwright `channel: 'chrome'`) only; no Firefox/WebKit run.
