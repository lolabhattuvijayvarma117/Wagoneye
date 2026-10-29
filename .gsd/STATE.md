# WagonEye — Current State

## Current Position
- Phase: 3 (End-to-End Testing & Production Hardening) — IN-PROGRESS
- Next Phase: Phase 4 (Real-time Integration & Backend Hookup)
- Completed Phases:
  - Phase 1: Tokens, Fonts & Primitives (Tailwind v4, IBM Plex fonts, UI components)
  - Phase 2: Layout & Screens Redesign (Topbar, Sidebar, Control Room Dashboard, Wagon Detail, Reports, Ask AI, Settings, Login)

## Accumulated Decisions
- Token architecture: All colors use `--color-*` CSS variables defined in `@theme` block in `src/index.css`.
- IBM Plex Sans for UI text; IBM Plex Mono (with tabular-nums) for IDs, timestamps, counts, confidence metrics.
- Industrial terminal aesthetic: No SaaS purple gradients, no glassmorphism, no sparklines without operational meaning.
- Charts: Using `uPlot` exclusively for time-series charts with container ResizeObserver and unmount cleanup.
- Toast system: Context-based `useToast` accessible across entire application.
- Code Splitting: Rollup manualChunks configured in `vite.config.ts` separating react, uplot, and tanstack.
- Dark mode default with persistent styling.

## Verification
- `npm run build` exits 0 with zero warnings or errors.
