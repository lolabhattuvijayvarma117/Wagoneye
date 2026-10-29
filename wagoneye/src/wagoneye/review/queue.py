"""Review queue builder for flagging low-confidence or anomalous events."""

from dataclasses import dataclass
from typing import List, Optional
from wagoneye.config import ReviewConfig
from wagoneye.count.counter import CrossingEvent


@dataclass
class ReviewItem:
    item_id: str
    event: CrossingEvent
    reason: str  # "low_confidence", "lost_reacquired", "density_discrepancy"
    details: str
    thumbnail_path: Optional[str] = None


class ReviewQueueBuilder:
    """Filters and aggregates events needing human verification."""

    def __init__(self, config: Optional[ReviewConfig] = None):
        self.config = config or ReviewConfig()

    def filter_events(
        self,
        events: List[CrossingEvent],
        wagon_count: Optional[int] = None,
        secondary_estimate: Optional[int] = None,
    ) -> List[ReviewItem]:
        review_items: List[ReviewItem] = []

        # Check for density / secondary count disagreement
        density_discrepancy = False
        discrepancy_detail = ""
        if wagon_count is not None and secondary_estimate is not None and wagon_count > 0:
            diff = abs(wagon_count - secondary_estimate)
            ratio = diff / wagon_count
            if ratio >= self.config.density_disagreement_ratio:
                density_discrepancy = True
                discrepancy_detail = (
                    f"Count mismatch: line count={wagon_count}, density estimate={secondary_estimate} "
                    f"({ratio:.1%} diff vs threshold {self.config.density_disagreement_ratio:.1%})"
                )

        item_idx = 1
        for ev in events:
            reasons = []
            if ev.confidence < self.config.low_confidence_threshold:
                reasons.append("low_confidence")
            if self.config.flag_lost_reacquired and ev.was_lost:
                reasons.append("lost_reacquired")
            if density_discrepancy:
                reasons.append("density_discrepancy")

            if reasons:
                primary_reason = reasons[0]
                details = f"Confidence {ev.confidence:.3f} < {self.config.low_confidence_threshold}"
                if "lost_reacquired" in reasons:
                    details += "; track was lost & reacquired across occlusion"
                if "density_discrepancy" in reasons:
                    details += f"; {discrepancy_detail}"

                review_items.append(
                    ReviewItem(
                        item_id=f"REV-{item_idx:04d}",
                        event=ev,
                        reason=primary_reason,
                        details=details,
                        thumbnail_path=ev.thumbnail_path,
                    )
                )
                item_idx += 1

        return review_items
