# 02 — Design system

Tokens are defined once in [`src/design/tokens.css`](../src/design/tokens.css) with Tailwind v4 `@theme`. Components
consume token utilities (`bg-surface`, `text-ink-2`, `border-line-strong`); arbitrary hex values in classes are limited
to canvas colours and the four `rgba()` edge styles in the renderer, which cannot be expressed as Tailwind utilities.

## Colour tokens

| Token | Value | Role |
|---|---|---|
| `--color-base` | `#080B16` | Page and modal background; canvas backdrop |
| `--color-surface` | `#0F1428` | Panels, cards, header, status strip |
| `--color-raised` | `#161C38` | Hover, selected tab, popover, inset chip |
| `--color-line` | `#232B4F` | Dividers only (1.33:1 on surface; never a sole signal) |
| `--color-line-strong` | `#5F6A9E` | Input and button boundaries (3.51:1) |
| `--color-ink` | `#EEF0F8` | Primary text (16.03:1 on surface) |
| `--color-ink-2` | `#AAB1CC` | Supporting text (8.58:1) |
| `--color-ink-3` | `#8088AC` | Captions and metadata (5.24:1; 4.80:1 on raised) |
| `--color-accent` | `#FFB224` | Primary action, selected state, focus ring |
| `--color-accent-hover` / `pressed` | `#FFC450` / `#E89A00` | Pointer states |
| `--color-accent-soft` | `#3A2A10` | Tinted selected surface |
| `--color-on-accent` | `#0A0D1A` | Text on accent (10.73:1) |
| `--color-danger` | `#FF5C3A` | Destructive action, conflicts, failed checks |
| `--color-success` | `#6FE3A6` | Feasible, passed, conflict-free |
| `--color-warning` | `#FFCF6E` | Stale result, infeasible constraint, caution |
| `--grid-line` | `#1B2440` | Canvas grid |
| `--shadow-panel` | `0 18px 48px -24px rgb(0 0 0 / .85)` | Floating cards only |

Semantic fills use paired `--color-*-soft` backgrounds. A semantic colour is never applied to a whole panel; it is
used on the badge, value, icon or border that carries the state.

## Typography

| Token | Size | Use |
|---|---|---|
| `--text-display` | `clamp(2.5rem, 4.6vw, 4.25rem)` | Home H1 |
| `--text-display-sm` | `clamp(2rem, 3.4vw, 2.75rem)` | Section H2 |
| `--text-2xl` | 24 px | Modal/dialog titles |
| `--text-xl` | 20 px | Result headlines, logo |
| `--text-lg` | 17 px | Card titles |
| `--text-base` | 15 px | Body |
| `--text-sm` | 14 px | Controls, panel body |
| `--text-xs` | 12 px | Dense labels, tab text |
| `--text-2xs` | 11 px | Canvas-adjacent metadata only |

Families: `--font-display` Rajdhani → Hind → system; `--font-sans` Hind → system; `--font-mono` JetBrains Mono.
Numeric readouts use the `.tnum` utility, which sets JetBrains Mono, `tabular-nums` and the `tnum` feature. No text
below 11 px; 11 px is reserved for canvas/status metadata, not body copy.

## Spacing, shape, motion

- Spacing follows a 4 px scale (4/8/12/16/20/24) through Tailwind's default scale.
- Radii: 4 px (`xs`, badges), 6 px (`sm`, compact rows), 8 px (`md`, buttons/inputs/tabs), 12 px (`lg`, floating
  panels/dialogs), 16 px (`xl`, modal on very large screens). Pills are limited to counts and switches.
- Motion: 120 ms for control feedback, 200 ms for panels, 320 ms for drawer/sheet transitions. Easings:
  `cubic-bezier(0.22, 1, 0.36, 1)` (settle) and `cubic-bezier(0.4, 0, 0.2, 1)` (soft in-out).
- Reduced motion: `prefers-reduced-motion: reduce` collapses all animation/transition durations to 0.01 ms and turns
  smooth scrolling off. No motion is required to understand state.

## Components (`src/components/ui`)

| Component | Variants / API | States |
|---|---|---|
| `Button` | `primary`, `secondary`, `ghost`, `quiet`, `danger`; `sm/md/lg`; optional icon | hover, active, focus-visible, disabled (40% + no pointer), loading handled by caller |
| `IconButton` | `label` (required accessible name), `icon`, `active`, `variant` | active uses accent-soft; focus ring; disabled |
| `Slider` | label, min/max/step, unit, synced number field, `aria-valuetext`, help, commit | hover thumb, focus ring (`aria-label` on thumb), disabled 50% |
| `Select` | native `<select>` with label, help, options | hover/focus border, disabled |
| `Tabs` | Radix root/list/trigger/content; 3-column wrapping list | active raised + accent underline; focus-visible |
| `Badge` | neutral/accent/success/warning/danger, optional icon | static status label |
| `Switch` | Radix switch, required label | checked, focus ring, disabled |
| `Tooltip` | Radix provider + label | hover/focus, 300 ms delay |
| `Dialog` | Radix overlay/content, labelled/described | open, focus trap, Esc, scroll lock |
| `Toasts` | info/success/warning/error + optional action; `aria-live="polite"` | auto-dismiss 5 s, manual dismiss, undo |
| `Logo`, `LogoMark` | full wordmark (live type) + inline SVG mark | `role="img"` name “Taalमेल”; compact mark for the modal |

Segmented navigation (mobile Graph/Parameters/Results, tool dock Select/Add/Delete) uses a group of buttons with
`aria-pressed`, matching the visual language of the primitives. Keyboard hints are displayed as text in tooltips and
help lines rather than a separate `Kbd` component; there was no repeated kbd-chip pattern to justify one.

## Interaction rules

- Focus: 2 px accent outline, 2 px offset, on every interactive element (`:focus-visible`).
- Targets: 36–40 px desktop controls; primary mobile controls are 44 px (`h-11`/`size-11`), with 24 px as the absolute
  minimum for slider tracks and inline links.
- Colour plus text: channel numbers are printed inside nodes; conflict edges are dashed and carry an icon plus the
  status-strip count; badges always include a word (“Feasible”, “Infeasible”, “Stale”).
- Disabled controls use opacity plus `disabled`/`aria-disabled`, not colour alone.
- Loading: “Solving…”, “Running…”, “Computing…” with a spinner; the triggering button is disabled while running.
- Destructive actions: Delete and Clear are red-tinted but non-blocking; both offer a 5 s undo toast.
- The canvas is `aria-hidden`; the AP list, status strip, dialog description and polite live region carry the state
  for assistive technology.

## Canvas palette

| Element | Colour |
|---|---|
| Canvas | `#080B16` |
| Fine grid | `#1B2440` at 0.9 |
| Neutral edge | `rgba(95, 106, 158, 0.4)` |
| Selected edge | `rgba(170, 177, 204, 0.85)` |
| Conflict edge | `rgba(255, 92, 58, 0.9)`, dashed 6/4 |
| Node labels | `#EEF0F8`, selected `#FFB224` |
| Scale bar | `#AAB1CC` at 0.75–0.9 |
| Channel fills | OKLCH hue 152–338, L ∈ {0.68, 0.60, 0.92}, C = 0.17 |
| Node numbers | `#0A0D1A` (≥ 4.54:1 on every channel fill) |

Coverage discs are cached radial-gradient sprites at 3–7.5% alpha with a 1 px rim at 30% alpha. They are context, not
the primary signal: edges and nodes paint above them. Conflict icons are cached sprites and are thinned to at most
240 stamps when a graph is extremely dense; the dashed edges and the conflict count remain per-pair signals.
