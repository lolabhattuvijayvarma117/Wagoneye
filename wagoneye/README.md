# WagonEye

Computer-vision bag counting and logistics tracking platform for train wagons at ports.

WagonEye detects and tracks bags being loaded onto and unloaded from freight train wagons in real time using computer vision, reports per-wagon totals and crossing events, queues low-confidence detections for human review, evaluates against operational manifests, and exposes a high-performance FastAPI backend.

---

## Repository Structure

```
wagoneye/
  configs/            # camera.yaml, wagon_doors.yaml, model.yaml
  data/
    raw/              # Input video files (gitignored)
    manifests/        # Operational manifests CSV (wagon_id, train_id, date, count, direction)
    labels/           # Exported review queues in CVAT XML & COCO JSON (gitignored)
  src/wagoneye/
    ingest/           # Video reader, wagon-schedule clip splitter
    detect/           # Detector wrapper (YOLO and zero-shot OWL-ViT)
    track/            # ByteTrack wrapper, track-ID continuity & occlusion buffer
    count/            # Virtual door-line crossing counter (loaded / unloaded)
    review/           # Low-confidence review queue, CVAT XML & COCO JSON exporters
    evaluate/         # Count evaluation vs manifests (MAE, % error, direction accuracy)
    api/              # FastAPI application & Pydantic response models
    store/            # SQLAlchemy database models & repository layer
    mock/             # Seeded realistic fake data generator for the dashboard
  tests/              # Unit tests for all modules
  scripts/            # CLI scripts: run_pipeline.py, run_eval.py, seed_mock.py
```

---

## Quick Setup

### 1. Prerequisites
- Python 3.11+
- Virtual environment (`venv` or `uv`)

### 2. Environment Setup

```bash
cd wagoneye
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev,ml]"
```

### 3. Running in Mock Mode

For frontend development and testing without waiting for video processing:

```bash
export MOCK_MODE=true
python scripts/seed_mock.py
uvicorn wagoneye.api.app:app --host 0.0.0.0 --port 8000 --reload
```

Open the OpenAPI documentation at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Running the Computer Vision Pipeline

```bash
python scripts/run_pipeline.py --video data/raw/train_feed.mp4 --config configs/model.yaml
```

### 5. Running Manifest Evaluation

```bash
python scripts/run_eval.py --manifest data/manifests/sample_manifest.csv
```

### 6. Running Tests

```bash
pytest tests/ -v
```
