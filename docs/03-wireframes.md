# 03 — Information architecture and wireframes

Two surfaces only: the marketing page and the planner dialog. The marketing page contains no canvas and no planner
state; the dialog owns the entire workspace.

## Home — 1440 px

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ sticky header, 64 px: [mark] Taalमेल      Problem How Features Under FAQ  [Launch planner] │
├──────────────────────────────────────────────────────────────────────────────┤
│ max-width 1200 px, 12-col grid, 64 px side gutters                            │
│                                                                              │
│  eyebrow (12 px mono caps)                       ╭──────────────────────────╮ │
│  H1 clamp 40–68 px, 3 lines                      │ decorative rhythm SVG    │ │
│  subhead 15–17 px, max 52ch                       │ aria-hidden, no canvas   │ │
│  [Launch planner] [See how it works]             ╰──────────────────────────╯ │
│  name story, 14 px, max 60ch                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ 01 Problem — 3 text blocks, 2-col asymmetric editorial layout                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ 02 How it works — 4 numbered steps, horizontal on ≥ md, stacked below         │
├──────────────────────────────────────────────────────────────────────────────┤
│ 03 Two ways out — 2 wide cards (frequency plan / physical plan)               │
├──────────────────────────────────────────────────────────────────────────────┤
│ 04 Feature bento — 12-col grid, tiles span 2/3/4/6, varying heights           │
├──────────────────────────────────────────────────────────────────────────────┤
│ 05 Under the hood — formula blocks + explicit limits list                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ 06 See it work — stat strip computed from the demo graph (4 values)           │
├──────────────────────────────────────────────────────────────────────────────┤
│ 07 Who it is for — 3 short columns + honesty note                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ 08 FAQ — accordion/native details, 6 answers                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Final CTA band: headline + [Launch planner]                                   │
│ Footer: wordmark, anchors, credits only when config/site.ts is filled         │
└──────────────────────────────────────────────────────────────────────────────┘
```

Spacing: sections use 80–112 px vertical padding on desktop and 56–64 px on mobile; content max width 1200 px; body
measure ≤ 68ch. The nav collapses below `lg` (1024 px); only the wordmark and CTA remain.

## Home — 390 px

```
┌──────────────────────────────┐
│ 56–64 px: [mark] Taalमेल  [Launch] │
├──────────────────────────────┤
│ eyebrow                      │
│ H1 40 px, 4 lines            │
│ body 15 px                   │
│ [Launch planner] full width  │
│ [See how it works] full width│
│                              │
│ decorative SVG, 260 px tall  │
│ (aria-hidden)                │
├──────────────────────────────┤
│ sections stack, 56 px gaps   │
│ bento tiles full width       │
│ stat strip 2 × 2             │
│ FAQ single column            │
│ footer stacks                │
└──────────────────────────────┘
```

No horizontal overflow at 360 px. Tap targets: CTA 44 px; anchor list only appears in the footer on mobile.

## Planner — desktop ≥ 1024 px (1440 × 900)

```
┌ modal inset 12 px, radius 12 px ─────────────────────────────────────────────┐
│ header 56 px: [mark] Taalमेल │ Interference workspace     2.4 GHz Ch 1–13  Export Presets Demo [×] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌toolbar 44┐ ┌params 248–272┐                                ┌results 336–348┐│
│ │ Select   │ │ Parameters   │      full-bleed canvas          │ Results       ││
│ │ Add      │ │ Spectrum     │      (dark, grid, coverage,     │ ┌─┬─┬─┐       ││
│ │ Delete   │ │  algorithm   │       edges, nodes, scale)      │ tabs wrap     ││
│ │ Clear    │ │  capacity    │                                 │ 3 × 2         ││
│ │ Fit      │ │ Propagation  │                                 │               ││
│ └──────────┘ │  radius      │                                 │ scrollable    ││
│              │  T           │                                 │ content       ││
│              │  span        │                                 │               ││
│              └──────────────┘                                 └───────────────┘│
│                     [Recolor] [T-Color] │ Coverage Grid │ Auto-recolor         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ status 36 px: 12 APs / 15 pairs / 3 groups / 0 conflicts │ selected chip │ fresh │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Modal inset 12 px; canvas fills the content area edge-to-edge behind floating panels.
- Panels float 12 px from the canvas edges (`top-3 bottom-3 left-3 right-3`), have 12 px radius and a single border.
- Left column: tool dock (44 px row) + Parameters card, gap 8 px. Parameters scrolls internally; its header is
  sticky by layout, not by `position: sticky`.
- Results drawer: 40 px header, wrapping 3-column tab grid (2 rows), content scrolls independently.
- Bottom action bar is centred in the strip between the left and right panels, never over them.
- Free canvas width at 1366 × 768 with both panels open: **≥ 50%** (measured in the responsive audit).
- Status strip is a single row; it scrolls horizontally on narrow desktop rather than dropping information.

## Planner — mobile < 1024 px (390 × 844)

```
┌ modal full viewport ─────────┐
│ header 56 px [mark] [Export] [Presets] [Demo] [×] │
├──────────────────────────────┤
│ view tabs 44 px + padding: Graph │ Parameters │ Results │
├──────────────────────────────┤
│                              │
│ canvas viewport              │
│                              │
│   [tool dock 44 px]          │
│   [action bar wraps]         │
├──────────────────────────────┤
│ status strip 36 px, scroll-x │
└──────────────────────────────┘
```

- Opening the modal always starts on **Graph**; switching to Parameters or Results unmounts the canvas from layout
  (the render loop stops) and shows a full-width card in a scrollable pane.
- Parameters and Results are full-height panes rather than bottom sheets; this avoids covering the status strip and
  keeps the same components as desktop. Documented as a deviation in `DECISIONS.md`.
- Tool dock and action bar remain over the canvas at the bottom; both wrap, and the canvas keeps at least 300 px of
  height on a 390 × 844 viewport.
- All primary controls are 44 px tall on touch.

## Empty state (no APs)

```
┌───────────────────────────────────────────────┐
│                                               │
│         This canvas is empty                  │
│   Click anywhere to place your first AP,      │
│   or start from the twelve-building demo.     │
│         [Load campus demo]                    │
│                                               │
└───────────────────────────────────────────────┘
```

Centred card, max 384 px, no illustration. Clicking the canvas behind adds an AP at that point. The tool dock keeps
Add active only if the user selects it; an empty canvas accepts a click in any tool.

## Result states

```
FRESH / FEASIBLE                     STALE                              RUNNING
[Feasible]  solved in 4.1 ms        [Stale] result from an earlier      [spinner] Searching
Every interfering pair is           graph or constraint set.            channel assignments
separated                           [Re-run]                            in the solver worker…
parameters table                    (numbers visually de-emphasised)
assignments with colour + number
```

An infeasible result uses the **warning** treatment and the heading “No assignment fits these constraints”, followed
by the clique-bound explanation only when the solver returned ω and the required span. It is not styled as an error.
Actual failures (worker exception) use danger and a plain-language toast.
