# WagonEye — Current State

## Current Position
- Phase: 2 (Layout & Screens Redesign)
- Status: In Progress
- Completed Phase 1: Tokens, Fonts & Primitives (Tailwind v4, IBM Plex fonts, UI components)

## Accumulated Decisions
- Token architecture: All colors use `--color-*` CSS variables defined in `@theme` block in `src/index.css`.
- IBM Plex Sans for UI text; IBM Plex Mono (with tabular-nums) for IDs, timestamps, counts, confidence metrics.
- Industrial terminal aesthetic: No SaaS purple gradients, no glassmorphism, no sparklines without operational meaning.
- Charts: Using `uPlot` exclusively for time-series charts.
- Dark mode default with persistent styling.

## Known Blockers & Mitigations
- uPlot requires DOM container dimensions and hex/rgb/oklch strings for canvas 2D context; resolved via `ResizeObserver` and computed styles.
