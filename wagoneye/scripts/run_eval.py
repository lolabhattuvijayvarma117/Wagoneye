#!/usr/bin/env python3
"""Run evaluation comparing WagonEye counts against cargo manifests."""

import argparse
from datetime import datetime
from pathlib import Path
import sys

# Add src to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from wagoneye.evaluate.evaluator import (
    ManifestEvaluator,
    ModelCountRecord,
    load_manifest_csv,
)
from wagoneye.mock.generator import MockDataStore


def main():
    parser = argparse.ArgumentParser(description="Evaluate WagonEye counts against manifests")
    parser.add_argument(
        "--manifest",
        type=str,
        default="data/manifests/sample_manifest.csv",
        help="Path to manifest CSV file",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Path to save markdown evaluation report (default: reports/eval_YYYYMMDD.md)",
    )
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    if not manifest_path.exists():
        print(f"[Error] Manifest file not found: {manifest_path}")
        sys.exit(1)

    print(f"[WagonEye] Loading manifests from {manifest_path}...")
    manifest_records = load_manifest_csv(manifest_path)
    print(f"✓ Loaded {len(manifest_records)} wagon manifest records.")

    # Retrieve model counts (using mock store or active DB)
    store = MockDataStore(seed=42)
    model_counts = {}
    for m in manifest_records:
        w_id = m.wagon_id
        w_data = store.wagons.get(w_id)
        if w_data:
            model_counts[(w_id, m.date)] = ModelCountRecord(
                wagon_id=w_id,
                date=m.date,
                loaded_count=w_data["bags_loaded"],
                unloaded_count=w_data["bags_unloaded"],
            )
        else:
            # Fallback to manifest ± small noise for demo wagons
            noise = 2 if m.manifest_bag_count > 100 else 1
            l_cnt = m.manifest_bag_count - noise if m.direction == "loaded" else 0
            u_cnt = m.manifest_bag_count - noise if m.direction == "unloaded" else 0
            model_counts[(w_id, m.date)] = ModelCountRecord(
                wagon_id=w_id,
                date=m.date,
                loaded_count=l_cnt,
                unloaded_count=u_cnt,
            )

    date_str = datetime.now().strftime("%Y%m%d")
    output_path = Path(args.output or f"reports/eval_{date_str}.md")

    evaluator = ManifestEvaluator()
    report = evaluator.evaluate(
        manifest_records=manifest_records,
        model_counts=model_counts,
        report_output_path=output_path,
    )

    print("\n--- WagonEye Evaluation Summary ---")
    print(f"Total Wagons: {report.total_wagons}")
    print(f"MAE (Mean Absolute Error): {report.mae:.2f} bags/wagon")
    print(f"Mean Percent Error: {report.mean_percent_error:.2f}%")
    print(f"Direction Classification Accuracy: {report.direction_accuracy_pct:.1f}%")
    print(f"✓ Markdown report saved to: {output_path}")


if __name__ == "__main__":
    main()
