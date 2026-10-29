#!/usr/bin/env python3
"""Script to generate and display seeded mock data for WagonEye."""

import argparse
import json
import sys
from pathlib import Path

# Add src to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from wagoneye.mock.generator import MockDataStore


def main():
    parser = argparse.ArgumentParser(description="Seed mock data for WagonEye")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for deterministic generation")
    parser.add_argument("--output", type=str, default=None, help="Optional JSON file to save mock snapshot")
    args = parser.parse_args()

    print(f"[WagonEye] Generating mock dataset (seed={args.seed})...")
    store = MockDataStore(seed=args.seed)

    summary = store.get_summary()
    wagons = store.list_wagons()
    events = store.get_recent_activity(limit=5)
    reports = store.list_reports()

    print(f"✓ Generated {len(wagons)} wagons across 7-day operational window.")
    print(f"  - Active wagons: {summary.active_wagons}")
    print(f"  - Bags loaded today: {summary.bags_loaded_today}")
    print(f"  - Bags unloaded today: {summary.bags_unloaded_today}")
    print(f"  - Detection accuracy: {summary.detection_accuracy}%")
    print(f"✓ Total simulated detection events: {len(store.events)}")
    print(f"✓ Generated {len(reports)} shift and incident reports.")

    if args.output:
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        snapshot = {
            "summary": summary.model_dump(),
            "wagons": [w.model_dump() for w in wagons],
            "recent_events": [e.model_dump() for e in events],
            "reports": [r.model_dump() for r in reports],
        }
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(snapshot, f, indent=2)
        print(f"✓ Saved mock snapshot to: {out_path}")


if __name__ == "__main__":
    main()
