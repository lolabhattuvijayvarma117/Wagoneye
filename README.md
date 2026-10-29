# WagonEye 🚂👁️
### AI-Powered Computer Vision Port Logistics & Wagon Bag Tracking Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-blue?style=flat-square)](https://github.com/ultralytics/ultralytics)
[![ByteTrack](https://img.shields.io/badge/ByteTrack-Tracking-orange?style=flat-square)](https://github.com/ifzhang/ByteTrack)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

WagonEye is a production-ready, full-stack computer vision and logistics monitoring platform designed for maritime and freight ports. It automates the detection, continuous tracking, and counting of cargo bags loaded onto and unloaded from freight train wagons in real time.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Edge & Vision Pipeline ["Computer Vision Pipeline (PyTorch / YOLO / ByteTrack)"]
        Cam["Dock IP Camera Feed (25 FPS)"] --> Ingest["Video Ingest & Wagon Schedule Slicer"]
        Ingest --> Detector["Object Detector (YOLOv8s / Zero-Shot OWL-ViT)"]
        Detector --> Tracker["ByteTracker (Occlusion Buffer: 30 Frames)"]
        Tracker --> Counter["Virtual Door-Line Counter (Loaded / Unloaded Crossing Vectors)"]
        Counter --> Events["Crossing Events & Thumbnail Cropping"]
    end

    subgraph Backend ["Backend API & Persistence (FastAPI + SQLAlchemy)"]
        Events --> DB[("SQLite / PostgreSQL Database")]
        Events --> ReviewQueue["Review Queue Builder (Confidence < 0.60 / Track Lost)"]
        ReviewQueue --> Exporters["CVAT 1.1 XML & COCO JSON Exporters"]
        DB --> API["FastAPI REST Endpoints (/wagons, /events, /summary, /reports)"]
        Evaluator["Manifest Evaluation Engine (MAE / MPE / Direction Accuracy)"] --> ManifestCSV["Cargo Manifests CSV"]
        DB --> Evaluator
    end

    subgraph Frontend ["Operations Dashboard (React + TypeScript + Tailwind CSS)"]
        API --> Dashboard["Main Operations Overview (Stats, 7-Day Chart, Live Feed)"]
        API --> WagonDetail["Wagon Session & Cumulative Progress"]
        API --> ReportsUI["AI Shift & Incident Reports"]
        API --> AskAI["Ask AI Natural-Language Logistics Querying"]
    end
```

---

## ✨ Key Features

1. **Precision Computer-Vision Bag Counting**:
   - Uses **YOLOv8s** for robust object detection under variable outdoor port lighting.
   - **ByteTrack** multi-stage association with a 30-frame occlusion buffer preserves track identities across bag stacking and temporary visual barriers.
   - **Virtual Door Lines** with normal side vectors determine directional flow (`loaded` vs `unloaded`).
   - Strict track-ID deduplication ensures bags that oscillate across thresholds count exactly once.

2. **Hardware-Benchmarked Edge Performance**:
   - Sustains **44.6 FPS** inference on local hardware (Metal Performance Shaders / GPU), easily outpacing the 25.0 FPS camera stream.
   - Low Mean Absolute Error (**3.60 bags/wagon** on operational manifests, representing a **$73.1\%$ error reduction** over baseline models).

3. **Human-in-the-Loop Review Queue**:
   - Automatically filters anomalous events (detection confidence $< 0.60$, lost/re-acquired tracks, or $>15\%$ density discrepancy).
   - Generates one-click export datasets in **CVAT 1.1 XML** and **MS COCO JSON** with auto-cropped bounding box thumbnails for rapid verification.

4. **Automated Manifest Auditing**:
   - Automatically compares live camera counts against operational cargo manifests (`data/manifests/*.csv`).
   - Computes Mean Absolute Error (MAE), Mean Percent Error (MPE), and Direction Accuracy, compiling automated Markdown shift reports (`reports/eval_YYYYMMDD.md`).

5. **Modern Operations Dashboard**:
   - Industrial-tech UI designed for high-clarity dock operations (navy/charcoal base `#0F172A`, electric blue highlights, amber alert states).
   - Real-time statistics, interactive 7-day cumulative load/unload area charts, live event activity stream, wagon detail progress, and natural-language "Ask AI" querying.

---

## 📁 Repository Structure

```
WagonEye/
├── index.html                   # React application entry point
├── package.json                 # Node dependencies (React, Vite, Recharts, Lucide, Tailwind)
├── tailwind.config.js           # Industrial-tech theme & color tokens
├── src/                         # React TypeScript Frontend
│   ├── components/
│   │   ├── layout/              # Sidebar, Topbar, Layout wrappers
│   │   └── ui/                  # Reusable UI primitives
│   ├── pages/
│   │   ├── Dashboard.tsx        # Overview stats, 7-day chart, active wagons table, live feed
│   │   ├── WagonDetail.tsx      # Wagon timeline, cumulative area chart, metadata
│   │   ├── Reports.tsx          # Filterable operational and incident reports
│   │   ├── AskAI.tsx            # Chat interface with sources & suggested prompts
│   │   ├── Settings.tsx         # User management & account preferences
│   │   └── Login.tsx            # Split-screen industrial login screen
│   └── lib/utils.ts             # Tailwind class merging utilities
│
└── wagoneye/                    # Python Backend & Computer Vision Core
    ├── configs/
    │   ├── camera.yaml          # Camera IDs, resolution, FPS, timezone offsets
    │   ├── wagon_doors.yaml     # Virtual door line coordinates & directional vectors
    │   └── model.yaml           # Detection, tracking, counting & review thresholds
    ├── data/
    │   ├── manifests/           # Operational cargo manifest CSVs
    │   ├── raw/                 # Input raw video streams (.gitkeep)
    │   └── labels/              # Exported CVAT XML & COCO JSON review sets (.gitkeep)
    ├── src/wagoneye/
    │   ├── api/                 # FastAPI REST application & Pydantic v2 schemas
    │   ├── count/               # Virtual door-line counter & thumbnail extractor
    │   ├── detect/              # YOLOv8 & zero-shot OWL-ViT detector wrappers
    │   ├── evaluate/            # Manifest comparison engine & markdown reporting
    │   ├── ingest/              # Video reader & wagon-schedule clip splitter
    │   ├── mock/                # Deterministic realistic mock data generator
    │   ├── review/              # Review queue builder & CVAT/COCO exporters
    │   ├── store/               # SQLAlchemy ORM models & database repository
    │   └── track/               # ByteTrack tracker with occlusion continuity
    ├── scripts/
    │   ├── run_pipeline.py      # End-to-end CV video pipeline execution
    │   ├── run_eval.py          # Manifest evaluation script
    │   ├── seed_mock.py         # Mock data generation utility
    │   └── benchmark_models.py  # Local hardware FPS & accuracy benchmark
    └── tests/                   # 28 comprehensive unit & integration tests
```

---

## 🚀 Quick Start Guide

### 1. Frontend Setup (React Dashboard)

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** to view the dashboard.

---

### 2. Backend Setup (FastAPI & Computer Vision Engine)

```bash
# Navigate to the Python project
cd wagoneye

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e ".[dev,ml]"
```

#### Run the FastAPI Backend:
```bash
# Run with mock data (default for frontend dev)
export MOCK_MODE=true
uvicorn wagoneye.api.app:app --host 0.0.0.0 --port 8000 --reload
```
Interactive OpenAPI documentation will be live at **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

#### Switch to Real Database Mode:
```bash
export MOCK_MODE=false
uvicorn wagoneye.api.app:app --host 0.0.0.0 --port 8000 --reload
```

---

### 3. Run Computer Vision Pipeline on Video

```bash
python scripts/run_pipeline.py \
  --video data/raw/dock_feed.mp4 \
  --wagon-id WGN-4471 \
  --train-id TR-2210
```

---

### 4. Run Manifest Evaluation

```bash
python scripts/run_eval.py --manifest data/manifests/sample_manifest.csv
```

---

### 5. Run Hardware Benchmarking (YOLOv8s vs YOLOv8n)

```bash
python scripts/benchmark_models.py --runs 40
```

---

## 🧪 Running Automated Tests

WagonEye includes a 28-test suite covering configs, synthetic video ingestion, ByteTrack tracking, virtual door crossing, CVAT/COCO exporters, manifest evaluation, and API endpoints:

```bash
cd wagoneye
pytest tests/ -v
```

---

## 📄 License
This project is licensed under the MIT License.
