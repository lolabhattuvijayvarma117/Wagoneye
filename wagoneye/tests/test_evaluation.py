"""Unit tests for manifest loading and evaluation calculations."""

from pathlib import Path
import pytest
from wagoneye.evaluate.evaluator import (
    ManifestEvaluator,
    ManifestRecord,
    ModelCountRecord,
    load_manifest_csv,
)


def test_load_manifest_csv():
    manifest_path = Path("data/manifests/sample_manifest.csv")
    assert manifest_path.exists()
    records = load_manifest_csv(manifest_path)
    assert len(records) >= 5
    rec1 = records[0]
    assert rec1.wagon_id == "WGN-4471"
    assert rec1.train_id == "TR-2210"
    assert rec1.manifest_bag_count == 280
    assert rec1.direction == "loaded"


def test_evaluator_perfect_counts(tmp_path):
    records = [
        ManifestRecord("WGN-01", "TR-1", "2026-10-25", 100, "loaded"),
        ManifestRecord("WGN-02", "TR-1", "2026-10-25", 200, "unloaded"),
    ]
    model_counts = {
        ("WGN-01", "2026-10-25"): ModelCountRecord("WGN-01", "2026-10-25", 100, 0),
        ("WGN-02", "2026-10-25"): ModelCountRecord("WGN-02", "2026-10-25", 0, 200),
    }

    evaluator = ManifestEvaluator()
    out_file = tmp_path / "eval_test.md"
    report = evaluator.evaluate(records, model_counts, report_output_path=out_file)

    assert report.total_wagons == 2
    assert report.mae == 0.0
    assert report.mean_percent_error == 0.0
    assert report.direction_accuracy_pct == 100.0
    assert out_file.exists()


def test_evaluator_discrepancy_and_direction_error():
    records = [
        # Manifest: 100 loaded, Model: 96 loaded -> Error = 4 (4%)
        ManifestRecord("WGN-01", "TR-1", "2026-10-25", 100, "loaded"),
        # Manifest: 200 unloaded, Model: 190 unloaded -> Error = 10 (5%)
        ManifestRecord("WGN-02", "TR-1", "2026-10-25", 200, "unloaded"),
        # Direction mismatch: Manifest is unloaded (50), Model counted 50 loaded
        ManifestRecord("WGN-03", "TR-1", "2026-10-25", 50, "unloaded"),
    ]
    model_counts = {
        ("WGN-01", "2026-10-25"): ModelCountRecord("WGN-01", "2026-10-25", 96, 0),
        ("WGN-02", "2026-10-25"): ModelCountRecord("WGN-02", "2026-10-25", 0, 190),
        ("WGN-03", "2026-10-25"): ModelCountRecord("WGN-03", "2026-10-25", 50, 0),  # primary is loaded!
    }

    evaluator = ManifestEvaluator()
    report = evaluator.evaluate(records, model_counts)

    assert report.total_wagons == 3
    # Wagon 1: abs_err = 4, pct = 4.0%
    # Wagon 2: abs_err = 10, pct = 5.0%
    # Wagon 3: direction is unloaded -> detected unloaded count is 0! abs_err = 50, pct = 100.0%
    # Total abs_err = 4 + 10 + 50 = 64 / 3 = 21.33
    assert report.mae == pytest.approx(21.33, abs=0.01)
    # Direction correct: 2 out of 3 = 66.7%
    assert report.direction_accuracy_pct == pytest.approx(66.67, abs=0.1)
    assert "| `WGN-01` |" in report.markdown_content
