# 01 — Research, palette and typography

Live web research was performed on **2026-10-29**. Every URL below was loaded by the research agent except where
noted; patterns are adaptations of interaction or information structure, not copies of layout, copy or assets.

## Reference products

| # | Product | URL (accessed 2026-10-29) | Patterns adapted |
|---|---|---|---|
| 1 | Linear | https://linear.app/ · https://linear.app/docs/display-options | Switchable views and show/hide fields for dense engineering data; sticky context headers; saved preferences. Adapted as collapsible parameters, layer switches and a persistent status strip. |
| 2 | Raycast | https://www.raycast.com/ · https://manual.raycast.com/settings | Keyboard-first commands, a contextual action panel, and searchable settings. Adapted as `V`/`A`/`Delete` shortcuts and a visible tool dock rather than hidden menus. |
| 3 | Figma / FigJam | https://www.figma.com/figjam/ · https://help.figma.com/hc/en-us/articles/15300412458647-Explore-FigJam-files | Large work surface separated from panels; grouped creation/navigation tools; explicit move-versus-draw distinction. Adapted as a full-bleed canvas with floating cards and a Select/Add/Delete dock. |
| 4 | tldraw | https://www.tldraw.com/ · https://tldraw.dev/ | Infinite-canvas conventions, selection/transform handles, dark-mode theming. Live whiteboard appearance could not be verified by the page reader; only the SDK documentation was used. |
| 5 | Ubiquiti UniFi | https://ui.com/wifi · https://help.ui.com/hc/en-us/articles/360012192813-Introduction-to-UniFi | Live topology plus summary telemetry; optimisation guidance next to the diagnostic context. Adapted as canvas plus status strip and the conflict-repair panel. |
| 6 | Ekahau | https://www.ekahau.com/ · https://support.ekahau.com/hc/en-us/articles/41571026759825-Main-Components-of-the-User-Interface | AP list beside a map, coordinated map layers, and a legend that maps colour to value ranges. Adapted as the accessible AP list, coverage/grid switches, and the channel legend. |
| 7 | Stripe Docs | https://docs.stripe.com/ · https://docs.stripe.com/api | Explicit state semantics (test vs live), examples paired with structured output, visible status codes. Adapted as fresh/stale/running result states and “computed, not scripted” solver output. |
| 8 | Awwwards | https://www.awwwards.com/ · https://www.awwwards.com/websites/ | Scannable gallery metadata and strong editorial hierarchy. Adapted only as typographic hierarchy and project labelling; no showcase styling was copied. |

What was deliberately **not** taken: oversized marketing hero type inside the tool, glass panels, gradient text,
auto-playing motion, and icon-in-circle card grids.

## Palette candidates

Evaluated against the product constraints: a dark plotting surface, a projector at 1366×768, categorical channel
colours that must survive colour-vision deficiency, and no resemblance to the legacy teal/cream look.

| Candidate | Concept | Strengths | Rejection / decision |
|---|---|---|---|
| A. **Midnight Indigo + Marigold** | Concert hall at night; marigold stage light (the “taal” rhythm) | Deep indigo separates panels from the near-black canvas; warm accent is unmistakable on a projector; channel hues can sweep teal→magenta without colliding with the accent | **Chosen.** |
| B. Graphite + Signal Amber | Instrument panel, neutral graphite | Calm and technical; excellent neutral contrast | Rejected: with a graphite canvas the plot and the shell collapse into one value range, and category hues have less separation from the background. |
| C. Deep Teal + Copper | RF field instrument | Domain-adjacent, warm accent | Rejected: too close to the legacy cream/teal identity the brief explicitly replaces, and teal category hues would compete with the primary action. |

### Chosen tokens and measured contrast

Ratios measured with the WCAG 2.x relative-luminance formula on the implemented hex values.

| Pair | Ratio | Requirement | Result |
|---|---|---|---|
| `ink` #EEF0F8 on `surface` #0F1428 | **16.03:1** | 4.5:1 text | Pass |
| `ink` on `base` #080B16 | **17.25:1** | 4.5:1 | Pass |
| `ink-2` #AAB1CC on `surface` | **8.58:1** | 4.5:1 | Pass |
| `ink-3` #8088AC on `surface` | **5.24:1** | 4.5:1 | Pass |
| `ink-3` on `raised` #161C38 | **4.80:1** | 4.5:1 | Pass |
| `accent` #FFB224 on `base` | **10.89:1** | 4.5:1 | Pass |
| `on-accent` #0A0D1A on `accent` | **10.73:1** | 4.5:1 | Pass |
| `danger` #FF5C3A on `surface` | **5.95:1** | 4.5:1 | Pass |
| `success` #6FE3A6 on `surface` | **11.48:1** | 4.5:1 | Pass |
| `warning` #FFCF6E on `surface` | **12.51:1** | 4.5:1 | Pass |
| `line-strong` #5F6A9E on `surface` | **3.51:1** | 3:1 non-text | Pass |
| `danger` on `danger-soft` #3A1714 | **5.21:1** | 4.5:1 | Pass |

`line` #232B4F is a divider only (1.33:1 on surface). It never carries meaning alone; meaningful boundaries use
`line-strong`. The original spec's `#3A4575` measured **1.99:1** against the panel and failed the 3:1 UI-boundary rule,
so it was lifted to `#5F6A9E`. This is logged in `docs/DECISIONS.md`.

## Channel colour system

The node fill encodes channel/group **position**, not success or failure:

- Hue sweeps 152° → 338° in OKLCH across the channel span. Channels far apart numerically are far apart in hue.
- Lightness steps in a three-beat rhythm (0.68, 0.60, 0.92) at chroma 0.17. A fixed lightness/chroma made channels
  6 and 11 collapse under deuteranopia (ΔE2000 ≈ 1); the rhythm restores separation.
- Every node prints its channel or group number, and the legend and assignment table repeat it in text.
- Verified in `tests/unit/channel-colors.test.ts`: channels 1/6/11 clear **ΔE2000 ≥ 15** under normal, protan,
  deutan and tritan simulation; adjacent channels differ by > 5. Worst 1/6/11 pair measured 22.0.
- Node numerals `#0A0D1A` clear **4.54:1** or better on all 13 channel fills (minimum at channel 11); group 1 is
  4.98:1.

## Typography

| Role | Choice | Why |
|---|---|---|
| Display / wordmark | **Rajdhani 600/700** | One family with Latin and Devanagari, squared technical rhythm. Used for product identity and headings. |
| UI / body | **Hind 400/500/600** | Humanist Latin + Devanagari companion with open counters at small sizes. |
| Data | **JetBrains Mono 400/500/600** | Tabular figures for metrics, channels, coordinates and slider values. |

Shortlist considered: Teko (too condensed for body), Baloo 2 (too rounded for an instrument), Tiro Devanagari Hindi
(excellent Devanagari but no matching Latin technical face), Poppins (Latin-only, geometric). Rajdhani + Hind keeps
both scripts in two families instead of mixing four.

Implementation: self-hosted `@fontsource` packages for latin + devanagari subsets, imported in `main.tsx`; no runtime
CDN. The font packages are imported in `main.tsx`, fingerprinted by Vite and served from the app origin with `font-display: swap`. The mixed-script
wordmark was inspected at 2× zoom: Devanagari is set slightly larger and nudged down so its shirorekha sits level with
the Latin cap height instead of floating above it.
