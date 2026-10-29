---
phase: 2
plan: 2
title: "Phase 2: Layout & Screens Redesign"
wave: 1
dependencies: []
---

# Plan: Phase 2 — Layout & Screens Redesign

## Objective
Implement all core application screens and system layouts according to `docs/design-brief.md`: Topbar, collapsible Sidebar, Control Room Dashboard (with live footage wall, uPlot throughput chart, event stream, rake visualization, virtualized wagons DataTable, attention panel), Wagon Detail, Reports, Ask AI, Settings, and Login.

## Tasks

### Task 1: Redesign Topbar, Sidebar, and Layout shell
- Update `src/components/layout/Topbar.tsx` with WAGONEYE wordmark, yard selector dropdown, global search input, dynamic real-time clock (local + UTC), connection status pill (`LIVE` / `OK`), and alerts icon button.
- Update `src/components/layout/Sidebar.tsx` with collapsible states (56px collapsed icon-only with Tooltip ↔ 220px expanded with text labels), navigation items (Control Room, Wagons, Rakes, Reports, Ask AI, Cameras, Settings), and operator info footer.
- Update `src/components/layout/Layout.tsx` to handle responsive collapsing, 48px topbar, and main content area.
- Update `src/App.tsx` routes if needed for additional sidebar targets.
<verify>
`npm run build` passes with no TypeScript errors in layout components.
</verify>

### Task 2: Create reusable uPlot Chart Component
- Import `uplot/dist/uPlot.min.css` in `src/index.css`.
- Create `src/components/ui/UPlotChart.tsx` supporting time-series data, responsive resizing with `ResizeObserver`, proper `destroy()` lifecycle on unmount, dark-theme gridlines, tooltips, and theme token styling.
- Export `UPlotChart` from `src/components/ui/index.ts`.
<verify>
`npm run build` succeeds and uPlot is properly bundled with no TS/CSS issues.
</verify>

### Task 3: Implement Screen 1 — Control Room (Dashboard.tsx)
- Integrate `SummaryStrip` with 4 KPIs ("Bags Loaded Today", "Bags Unloaded Today", "Active Wagons", "Detection Accuracy").
- Create Live Footage Wall panel with camera tiles (CAM-01, CAM-02), simulated door crossing lines, detection bounding boxes, and LIVE badge.
- Integrate Throughput Chart with uPlot: hourly loaded vs unloaded vs planned dashed line.
- Integrate Event Stream panel with newest-first events, mono timestamps, wagon, door, direction pills, confidence badges, and status.
- Integrate Rake Status strip with horizontal train rake cells colored by status, count tooltips, and mismatch alerts.
- Integrate Wagons virtualized `DataTable` using TanStack Table & TanStack Virtual with status pills, planned vs counted, and delta.
- Integrate Attention Panel showing wagons with low confidence (<0.6), count mismatches, and camera warnings.
<verify>
`npm run build` passes; Dashboard renders all 6 panels without errors.
</verify>

### Task 4: Implement Screen 2 — Wagon Detail (WagonDetail.tsx)
- Header: Wagon ID (e.g. WGN-8492), Train ID (TRN-2024-08), arrival/departure timestamps, status pill, "Verified by Manifest" badge, back button.
- Cumulative loaded vs unloaded progress chart using `UPlotChart` with planned manifest reference line.
- Per-door breakdown card for Door A and Door B with bag counts and flow rate.
- Event timeline with simulated video thumbnail frames, confidence badges, timestamps, and direction pills.
<verify>
`npm run build` passes; WagonDetail compiles and handles route params cleanly.
</verify>

### Task 5: Implement Screen 3 — Reports (Reports.tsx)
- Filter bar: date range selector, wagon search, yard selector, export CSV/PDF buttons.
- Reports metrics summary and reports table/card view with discrepancy flags, verification status pills, manifest references.
- One-click export triggering toast notification and CSV download simulation.
<verify>
`npm run build` passes; Reports compiles with filters and export actions.
</verify>

### Task 6: Implement Screen 4 — Ask AI (AskAI.tsx)
- Industrial yard control room style chat interface (dark telemetry, no consumer bubbles).
- Preset prompt chips ("How many bags unloaded from wagon 12?", "Show count discrepancies for Rake #4", "Summarize Cam-02 accuracy").
- AI responses with structured sources section (e.g. `[Manifest CSV]`, `[Cam-01 Event Log #4928]`).
<verify>
`npm run build` passes; chat interface handles message flow and prompt clicks.
</verify>

### Task 7: Implement Screen 5 — Settings (Settings.tsx)
- Cameras configuration (FPS, RTSP URL, door line coordinates).
- Detection thresholds (YOLOv8s confidence threshold, ByteTrack buffer frames, door crossing offset).
- Notification preferences and yard operator credentials.
- Industrial inputs styled with WagonEye tokens.
<verify>
`npm run build` passes; Settings compiles with all configuration forms.
</verify>

### Task 8: Implement Screen 6 — Login (Login.tsx)
- Industrial split-screen layout:
  - Left: Dark industrial terminal / yard telemetry console with live SVG schematic, status readout, and port terminal typography.
  - Right: High-contrast crisp login form with email, password, and sign-in button using WagonEye tokens.
<verify>
`npm run build` passes; Login page compiles and navigates to Dashboard on submission.
</verify>

### Task 9: Full Integration Verification and Polish
- Verify all routes and screens compile cleanly under `npm run build`.
- Check compliance with all anti-patterns in `docs/design-brief.md`.
- Verify dark mode default and font tokens.
<verify>
`npm run build` exits with code 0.
</verify>
