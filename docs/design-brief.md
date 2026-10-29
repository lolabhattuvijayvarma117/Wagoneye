# WagonEye — Frontend Design Brief
> **Phase 0 document. Do not begin Phase 1 until this brief is approved.**
> Last updated: 2026-10-29

---

## 1. Concept Statement

WagonEye's UI is a **yard control room, not a SaaS product page**. Yard staff read it standing at a terminal in low-light conditions during an active shift — they need to extract a number or status in under two seconds, act on it, and move on. Every panel earns its space by carrying operational meaning; decoration is a bug. The visual language is drawn from industrial monitoring tools — think port terminal management systems and rail control consoles — not from B2B startup dashboards.

---

## 2. Colour Tokens

All tokens are CSS custom properties on `:root`, switched via `color-scheme: dark light` and the `light-dark()` function. Dark is the default and primary target; light must also pass WCAG AA contrast.

### 2.1 Neutral Scale (surface → text)

| Token | Dark value | Light value | Role |
|---|---|---|---|
| `--n-0` | `#060A10` | `#FFFFFF` | Page canvas |
| `--n-50` | `#0D1117` | `#F5F7FA` | Panel background |
| `--n-100` | `#161C27` | `#EAECF0` | Elevated panel / sidebar |
| `--n-150` | `#1E2535` | `#D8DCE5` | Panel header, input bg |
| `--n-200` | `#29334A` | `#C5CAD6` | Dividers, table row hover |
| `--n-300` | `#3D4D6E` | `#9BA5BA` | Borders, disabled text |
| `--n-400` | `#5A6B8A` | `#6E7A94` | Placeholder, secondary labels |
| `--n-500` | `#8694AE` | `#4A5568` | Body text |
| `--n-600` | `#B0BCCE` | `#2D3748` | Primary text |
| `--n-700` | `#D4DCE8` | `#1A202C` | Headings |
| `--n-800` | `#EDF0F5` | `#0F172A` | Maximum-contrast text |

### 2.2 Accent — Electric Cyan (one accent, used for one thing: interactive actions)

| Token | Value | Usage |
|---|---|---|
| `--accent` | `oklch(72% 0.19 205)` | Primary CTA buttons, active nav item, focus rings |
| `--accent-dim` | `oklch(55% 0.15 205)` | Hover state of accent, secondary links |
| `--accent-subtle` | `oklch(25% 0.08 205)` | Accent-tinted backgrounds (e.g., selected row) |
| `--accent-on` | `oklch(15% 0.05 205)` | Text on an accent-filled surface |

> **Rule**: `--accent` is used **only** for interactive affordances. It never appears as a data series colour, a status colour, or decoration.

### 2.3 Semantic Status Colours (each used for exactly one meaning)

| Token | Value (dark) | Meaning | Used for |
|---|---|---|---|
| `--status-ok` | `oklch(67% 0.18 145)` | Verified / nominal | "Loaded" events confirmed vs manifest, count within tolerance |
| `--status-warn` | `oklch(78% 0.18 75)` | Attention needed | Count mismatch, low confidence (<0.6), stale data (>5 min) |
| `--status-alert` | `oklch(67% 0.20 25)` | Active problem | Camera offline, wagon overdue, count error >10% |
| `--status-idle` | `--n-400` | Inactive / not started | Wagon not yet active, session not started |
| `--status-live` | `oklch(70% 0.22 145)` | Real-time active | Live camera feed, actively loading/unloading wagon |

> **Rule**: Never mix status colours for decorative purposes. A single colour means exactly one operational state.

### 2.4 Chart / Data Series Colours (distinct from all status colours)

Used only in `uPlot` charts. Never reused for status, actions, or text.

| Token | Value | Series |
|---|---|---|
| `--series-loaded` | `oklch(72% 0.16 220)` | Bags loaded |
| `--series-unloaded` | `oklch(72% 0.17 50)` | Bags unloaded |
| `--series-planned` | `--n-400` | Manifest / planned line (dashed) |

---

## 3. Typography

### 3.1 Typefaces

| Face | Family | Usage |
|---|---|---|
| **UI text** | `IBM Plex Sans` (400, 500, 600) | All prose, labels, nav, buttons |
| **Data / mono** | `IBM Plex Mono` (400, 500) | Every number, ID, timestamp, confidence score, code |

Both fonts are **self-hosted** (`/public/fonts/`). Zero CDN requests at runtime. Use `font-display: swap` with a `size-adjust` fallback to the system monospace to minimise layout shift.

Add `font-variant-numeric: tabular-nums` to every element that displays a number that updates dynamically. This prevents layout jitter as digits change width.

### 3.2 Type Scale

All sizes in `rem` (base 16 px). Line heights are unitless.

| Token | Size | Line-h | Weight | Face | Usage |
|---|---|---|---|---|---|
| `--text-2xs` | 0.625 rem (10 px) | 1.4 | 500 | Mono | Confidence badges, sub-labels |
| `--text-xs` | 0.75 rem (12 px) | 1.5 | 400 | Mono | Timestamps, IDs, table cells |
| `--text-sm` | 0.8125 rem (13 px) | 1.5 | 400 | Sans | Secondary labels, captions |
| `--text-base` | 0.875 rem (14 px) | 1.6 | 400 | Sans | Body text, form inputs |
| `--text-md` | 1 rem (16 px) | 1.5 | 500 | Sans | Panel headers, button text |
| `--text-lg` | 1.125 rem (18 px) | 1.4 | 600 | Sans | Screen section headings |
| `--text-xl` | 1.375 rem (22 px) | 1.3 | 600 | Sans | Page titles |
| `--text-kpi` | 2 rem (32 px) | 1 | 500 | Mono | Summary strip numbers |

---

## 4. Spacing Scale

Based on a 4 px base unit. Use only these values for `gap`, `padding`, `margin`.

| Token | Value | Typical use |
|---|---|---|
| `--sp-1` | 4 px | Icon-to-label gap, tight badge padding |
| `--sp-2` | 8 px | Input inner padding, chip padding |
| `--sp-3` | 12 px | Table cell padding |
| `--sp-4` | 16 px | Panel content padding |
| `--sp-5` | 20 px | Between sibling panels |
| `--sp-6` | 24 px | Panel header bottom margin |
| `--sp-8` | 32 px | Section separation |
| `--sp-12` | 48 px | Page-level inset |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--r-sm` | 3 px | Badges, chips, status pills |
| `--r-md` | 6 px | Panels, cards, inputs, buttons |
| `--r-lg` | 10 px | Modal dialogs, drawers |

No `full` / `9999px` radius. Avoid "pill" shapes on anything wider than 80 px.

---

## 6. Shadow & Depth

Depth is conveyed through **layered background colours** (n-0 → n-50 → n-100 → n-150), not through heavy drop shadows. Shadows are used sparingly for:

| Token | Value (dark) | Usage |
|---|---|---|
| `--shadow-panel` | `0 1px 3px rgba(0,0,0,.5), 0 0 0 1px var(--n-200)` | Panel border + subtle lift |
| `--shadow-float` | `0 4px 16px rgba(0,0,0,.6), 0 0 0 1px var(--n-200)` | Dropdowns, tooltips, modals |
| `--shadow-inset` | `inset 0 1px 0 var(--n-200)` | Table header divider, top-bar bottom |

> **Rule**: No blurred glowing shadows. No coloured box-shadows for decoration. Borders (`--n-200`) define panel edges; shadows add only a single step of lift.

---

## 7. Layout Grid

### 7.1 Desktop — 1440 px viewport

```
┌─────────────────────────────────────────────────────────────────┐
│  TOP BAR  (height: 48 px, full-width, sticky z-50)              │
├──────┬──────────────────────────────────────────────────────────┤
│ RAIL │                   MAIN CONTENT                           │
│ 56px │   (padding: 20px, grid/flex layout per screen)           │
│      │                                                          │
│ (col-│                                                          │
│ laps-│                                                          │
│ ible │                                                          │
│ to   │                                                          │
│ icon │                                                          │
│ only)│                                                          │
└──────┴──────────────────────────────────────────────────────────┘
```

- **Top bar**: 48 px tall, `--n-100` bg, `--shadow-inset` bottom border, `z-index: 50`
- **Left rail (collapsed)**: 56 px wide — icons only + tooltips
- **Left rail (expanded)**: 220 px wide — icon + label; toggled via a rail button
- **Main content**: fills remaining width; inner `padding: var(--sp-5)`
- **Panel grid** (Control Room): CSS Grid with named areas, resizable via `ResizablePanel` wrappers; columns `minmax(320px, 1fr)`

### 7.2 Tablet — 1024 px viewport

- Rail is collapsed to icon-only by default (can expand via toggle)
- Panel grid collapses to single-column stacked layout
- Top bar compresses: yard selector moves to a dropdown icon; search hidden behind icon
- Summary strip scrolls horizontally instead of wrapping

---

## 8. Panel Anatomy

Every panel follows this structure:

```
┌─────────────────────────────────────────────────────┐
│ PANEL HEADER (40px, --n-150 bg, --shadow-inset btm) │
│  [Icon] PANEL TITLE       [actions: sort/filter/…]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│   PANEL BODY (--n-50 bg, padding: --sp-4)            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

- **PanelHeader**: always present; title in `--text-md` / weight 500, icon 16 px, always `--n-700`; actions are `IconButton` components only (no text labels in the header action zone)
- **Panel body**: no inner padding in virtualized tables (rows extend to edge); `--sp-4` padding for all other content
- **Empty state**: centred, 2-line — label (`--n-500`) + sub-label (`--n-400`), no illustration
- **Loading state**: 3 skeleton rows (`--n-150` bg) at `8px` height with `2px` border-radius, animated via `opacity` pulse — no spinners in panels
- **Error state**: `--status-alert` left border (3 px), error label, optional retry `IconButton`

---

## 9. Summary Strip

The compact strip at the top of the Control Room grid replaces decorative stat cards:

```
[ Loaded today  4,201 ↑12% ]  [ Unloaded  3,988 ↓2% ]  [ Active wagons  14 ]  [ Accuracy  97.3% ]
```

- Four numbers in `--text-kpi` (IBM Plex Mono 32 px)
- Label in `--text-sm` above the number
- Delta indicator: `▲` or `▼` glyph in `--status-ok` / `--status-warn`, followed by percent in `--text-xs` Mono
- Background: `--n-100`; border-bottom: `--n-200`; height: 64 px
- Numbers animate on mount via a `requestAnimationFrame` count-up over 600 ms (no spring, linear ease-out)

> **Rule**: This strip is functional data, not a hero section. No icons inside the number, no gradient fills, no sparklines.

---

## 10. Status Pill Component

Used in tables, event stream, headers.

```
[ ● LIVE ]   [ ● MISMATCH ]   [ ● IDLE ]   [ ✓ VERIFIED ]
```

- Shape: `--r-sm` radius, `2px 6px` padding
- Font: `--text-2xs`, `IBM Plex Mono`, weight 500, uppercase, letter-spacing 0.06em
- Colours: background is the status colour at 15% opacity; text and dot at full status colour
- Never use `success / warning / danger` as the token names — use the semantic names defined in §2.3

---

## 11. Status Colour Meanings — Binding Rules

| Colour | Token | **Exactly one meaning** |
|---|---|---|
| Cyan | `--accent` | Interactive element is clickable / focused |
| Green | `--status-ok` | Count verified vs manifest; data within tolerance |
| Amber | `--status-warn` | Soft alert: low confidence, small mismatch, stale |
| Red-orange | `--status-alert` | Hard alert: camera down, major mismatch, overdue |
| Muted | `--status-idle` | Not yet active or session not started |
| Bright green | `--status-live` | Real-time stream actively receiving data |

Do **not** use green to mean "button is primary". Do **not** use amber for visual interest. Colour carries operational information only.

---

## 12. Anti-Patterns (Explicitly Forbidden)

These must never appear in any phase of the implementation:

1. **Purple / blue gradients** — banned; use flat surfaces with the neutral scale
2. **Glassmorphism** — no `backdrop-filter: blur` decoratively; no translucent floating cards
3. **Identical decorative stat cards** — the summary strip replaces them; no "KPI card grid" hero sections
4. **Sparklines without operational meaning** — no trend line in a card just because it looks nice
5. **Emoji or generic icon boxes** — icons come from a single consistent icon set (Lucide, 16 px stroke-1.5); no coloured circle backgrounds behind icons
6. **Inter as the only typeface** — IBM Plex Sans (UI) + IBM Plex Mono (data); Inter is not used
7. **Default shadcn/ui styling** — all Radix primitives get custom styles; zero shadcn classes or presets
8. **Hard-coded colour values in components** — all colours reference CSS tokens only
9. **Large drop shadows for depth** — use layered background colours + thin borders
10. **`any` types in TypeScript** — every prop and API shape is typed explicitly
11. **Recharts** — use uPlot for all time-series charts
12. **CDN-loaded fonts or scripts** — everything is bundled or self-hosted
13. **Font size below 11 px** — never; accessibility minimum is `--text-2xs` (10 px) only for badges with fallback
14. **`absolute` positioning for layout** — use Grid and Flexbox; `position: absolute` only for overlays and tooltips

---

## 13. Interaction & Motion

- **Hover**: `background-color` transition `120ms ease-out`; nav items and table rows use `--n-200` bg on hover
- **Focus ring**: `2px solid var(--accent)` with `outline-offset: 2px`; never remove `outline` without a visible replacement
- **Button press**: `transform: scale(0.97)` on `:active`, `80ms` transition
- **Page navigation**: no full-page transitions; only panel content fades in at `opacity 0 → 1` over `150ms`
- **KPI counter**: linear count-up via `requestAnimationFrame`, 600 ms, integers only
- **Table row expand**: `max-height` transition, `200ms ease-out`
- **Respect `prefers-reduced-motion`**: all animations wrapped in `@media (prefers-reduced-motion: no-preference)`; reduced-motion fallback shows instant state change

---

## 14. Accessibility Baseline

- WCAG AA contrast on all text / background pairs (dark and light modes)
- All interactive elements reachable and operable via keyboard (`Tab`, `Enter`, `Space`, arrow keys for lists/tables)
- `aria-label` on all `IconButton` elements
- Status pills include a screen-reader-visible text label (the dot is `aria-hidden`)
- Virtualized table announces row count and current range via `aria-rowcount` / `aria-rowindex`
- Focus is trapped inside modals/drawers via Radix `FocusTrap`
- Don't use colour alone to indicate state (per §2.3 — icons or glyphs accompany every status colour)

---

## 15. Implementation Notes for Phase 1

- **Tailwind v4** CSS-first config: tokens in `@theme {}` block; no `tailwind.config.js`
- **CSS custom properties** are the source of truth; Tailwind classes reference them via `var(--...)`
- `light-dark()` used for every colour token pair — eliminates redundant media queries
- `font-variant-numeric: tabular-nums` set globally on IBM Plex Mono via `@font-face`
- `color-scheme: dark light` on `:root`; `<meta name="color-scheme" content="dark light">` in `index.html`
- Dark mode is default; honour `prefers-color-scheme` for auto-switching; provide a manual toggle via `data-theme` attribute on `<html>`
