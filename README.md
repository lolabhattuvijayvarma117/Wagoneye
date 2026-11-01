# WagonEye — AI-Powered Port & Rail Logistics Platform

WagonEye is an edge-ready computer vision and operations analytics platform engineered for seaport and rail freight hubs to automate bag and sack tallying across train wagon doors.

---

## 🌐 Live Deployment & Demo Links

- **Permanent GitHub Pages Deployment:** [https://lolabhattuvijayvarma117.github.io/Wagoneye/](https://lolabhattuvijayvarma117.github.io/Wagoneye/)
- **GitHub Repository:** [https://github.com/lolabhattuvijayvarma117/Wagoneye](https://github.com/lolabhattuvijayvarma117/Wagoneye)

---

## 🚀 Key Features

1. **Official Corporate & Operations Portal (`/`)**: Overview of CV architecture, active rake schedules, terminal directory, and SLA compliance.
2. **Yard Control Room Dashboard (`/dashboard`)**: Live camera wall with annotated detections, uPlot hourly throughput, rake sequence map, and attention panel.
3. **Wagons Fleet Ledger (`/wagons`)**: Filterable, sortable TanStack virtualized table of all docked wagons with manifest reconciliation deltas.
4. **Rake Work Orders & Sequence Visualizer (`/rakes`)**: Horizontal wagon string coupled map showing per-wagon status.
5. **Sensor Fleet & Door Geometry (`/cameras`)**: WebRTC/HLS latency monitor and virtual crossing plane coordinates.
6. **Shift Reports & Audits (`/reports`)**: Manifest discrepancy audits, scorecards, and one-click CSV export.
7. **Ask AI Telemetry Console (`/ask-ai`)**: Operational natural language assistant with grounded source citations.

---

## 🛠 Local Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Run local frontend server
npm run dev

# 3. Build for production
npm run build
```

