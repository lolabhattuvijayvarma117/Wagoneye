"""Evaluation of model counts against operational cargo manifests."""

import csv
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple


@dataclass
class ManifestRecord:
    wagon_id: str
    train_id: str
    date: str
    manifest_bag_count: int
    direction: str  # "loaded" or "unloaded"


@dataclass
class ModelCountRecord:
    wagon_id: str
    date: str
    loaded_count: int
    unloaded_count: int

    @property
    def primary_direction(self) -> str:
        if self.loaded_count >= self.unloaded_count:
            return "loaded"
        return "unloaded"

    def get_count_for_direction(self, direction: str) -> int:
        if direction.lower() == "loaded":
            return self.loaded_count
        return self.unloaded_count


@dataclass
class WagonComparison:
    wagon_id: str
    train_id: str
    date: str
    direction: str
    manifest_count: int
    model_count: int
    abs_error: int
    percent_error: float
    direction_correct: bool


@dataclass
class EvaluationReport:
    timestamp: str
    total_wagons: int
    mae: float
    mean_percent_error: float
    direction_accuracy_pct: float
    comparisons: List[WagonComparison]
    markdown_content: str


def load_manifest_csv(csv_path: str | Path) -> List[ManifestRecord]:
    """Reads manifest CSV records."""
    path = Path(csv_path)
    records = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(
                ManifestRecord(
                    wagon_id=row["wagon_id"].strip(),
                    train_id=row["train_id"].strip(),
                    date=row["date"].strip(),
                    manifest_bag_count=int(row["manifest_bag_count"].strip()),
                    direction=row["direction"].strip().lower(),
                )
            )
    return records


class ManifestEvaluator:
    """Evaluates computer-vision counts against operational cargo manifests."""

    def evaluate(
        self,
        manifest_records: List[ManifestRecord],
        model_counts: Dict[Tuple[str, str], ModelCountRecord],  # (wagon_id, date) -> ModelCountRecord
        report_output_path: Optional[str | Path] = None,
    ) -> EvaluationReport:
        comparisons: List[WagonComparison] = []

        total_abs_error = 0
        total_pct_error = 0.0
        correct_directions = 0

        for m in manifest_records:
            key = (m.wagon_id, m.date)
            m_count = model_counts.get(key)

            if m_count is None:
                # Fallback to wagon_id only if date is unspecified
                candidates = [v for k, v in model_counts.items() if k[0] == m.wagon_id]
                m_count = candidates[0] if candidates else ModelCountRecord(m.wagon_id, m.date, 0, 0)

            detected_count = m_count.get_count_for_direction(m.direction)
            abs_err = abs(detected_count - m.manifest_bag_count)
            pct_err = (abs_err / m.manifest_bag_count * 100.0) if m.manifest_bag_count > 0 else 0.0
            dir_correct = (m_count.primary_direction == m.direction)

            total_abs_error += abs_err
            total_pct_error += pct_err
            if dir_correct:
                correct_directions += 1

            comparisons.append(
                WagonComparison(
                    wagon_id=m.wagon_id,
                    train_id=m.train_id,
                    date=m.date,
                    direction=m.direction,
                    manifest_count=m.manifest_bag_count,
                    model_count=detected_count,
                    abs_error=abs_err,
                    percent_error=pct_err,
                    direction_correct=dir_correct,
                )
            )

        n = len(manifest_records)
        mae = total_abs_error / n if n > 0 else 0.0
        mpe = total_pct_error / n if n > 0 else 0.0
        dir_acc = (correct_directions / n * 100.0) if n > 0 else 0.0

        ts_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        md = self._generate_markdown(ts_str, n, mae, mpe, dir_acc, comparisons)

        if report_output_path:
            out_p = Path(report_output_path)
            out_p.parent.mkdir(parents=True, exist_ok=True)
            with open(out_p, "w", encoding="utf-8") as f:
                f.write(md)

        return EvaluationReport(
            timestamp=ts_str,
            total_wagons=n,
            mae=round(mae, 2),
            mean_percent_error=round(mpe, 2),
            direction_accuracy_pct=round(dir_acc, 2),
            comparisons=comparisons,
            markdown_content=md,
        )

    def _generate_markdown(
        self,
        timestamp: str,
        n: int,
        mae: float,
        mpe: float,
        dir_acc: float,
        comparisons: List[WagonComparison],
    ) -> str:
        lines = [
            "# WagonEye Model Evaluation Report vs Operational Manifests",
            f"**Generated:** {timestamp}  ",
            f"**Total Wagons Evaluated:** {n}  ",
            "",
            "## Summary Metrics",
            f"- **Mean Absolute Error (MAE):** `{mae:.2f} bags/wagon`",
            f"- **Mean Percent Error (MPE):** `{mpe:.2f}%`",
            f"- **Direction Classification Accuracy:** `{dir_acc:.1f}%`",
            "",
            "## Wagon-by-Wagon Comparison",
            "| Wagon ID | Train ID | Date | Direction | Manifest | Model | Abs Error | Error % | Direction OK |",
            "| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |",
        ]
        for c in comparisons:
            dir_icon = "✓" if c.direction_correct else "✗"
            lines.append(
                f"| `{c.wagon_id}` | `{c.train_id}` | {c.date} | {c.direction} | {c.manifest_count} | "
                f"{c.model_count} | {c.abs_error} | {c.percent_error:.2f}% | {dir_icon} |"
            )

        lines.append("")
        lines.append("---")
        lines.append("*Automated evaluation generated by WagonEye Quality Assurance Pipeline.*")
        return "\n".join(lines)
