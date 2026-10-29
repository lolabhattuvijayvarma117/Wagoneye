"""Virtual door-line crossing counter for WagonEye."""

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple
import cv2
import numpy as np
from wagoneye.config import CountingConfig, DoorConfig
from wagoneye.track.tracker import TrackObservation, TrackedObject


@dataclass
class CrossingEvent:
    event_id: str
    wagon_id: str
    door_id: str
    track_id: int
    direction: str  # "loaded" or "unloaded"
    timestamp: datetime
    confidence: float
    frame_idx: int
    box: Tuple[float, float, float, float]
    clip_ref: Optional[str] = None
    thumbnail_path: Optional[str] = None
    was_lost: bool = False


def ccw(A: Tuple[float, float], B: Tuple[float, float], C: Tuple[float, float]) -> float:
    """Counter-clockwise cross product (B - A) x (C - A)."""
    return (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0])


def segments_intersect(
    A: Tuple[float, float],
    B: Tuple[float, float],
    C: Tuple[float, float],
    D: Tuple[float, float],
    tolerance: float = 0.0,
) -> bool:
    """Check if segment AB intersects segment CD."""
    # Bounding box rejection test
    if max(min(A[0], B[0]), min(C[0], D[0])) > min(max(A[0], B[0]), max(C[0], D[0])) + tolerance:
        return False
    if max(min(A[1], B[1]), min(C[1], D[1])) > min(max(A[1], B[1]), max(C[1], D[1])) + tolerance:
        return False

    d1 = ccw(A, B, C)
    d2 = ccw(A, B, D)
    d3 = ccw(C, D, A)
    d4 = ccw(C, D, B)

    # Check if endpoints straddle each other
    straddle_1 = (d1 * d2 <= tolerance)
    straddle_2 = (d3 * d4 <= tolerance)

    return straddle_1 and straddle_2


class DoorLineCounter:
    """Counts bag loading and unloading across virtual wagon door lines."""

    def __init__(
        self,
        wagon_id: str,
        doors: List[DoorConfig],
        config: Optional[CountingConfig] = None,
        thumbnail_dir: str | Path = "data/thumbnails",
    ):
        self.wagon_id = wagon_id
        self.doors = {d.door_id: d for d in doors}
        self.config = config or CountingConfig()
        self.thumbnail_dir = Path(thumbnail_dir)
        self.thumbnail_dir.mkdir(parents=True, exist_ok=True)

        # Track IDs already counted per door: {door_id: set(track_ids)}
        self.counted_tracks: Dict[str, Set[int]] = {d_id: set() for d_id in self.doors}
        self.events: List[CrossingEvent] = []
        self._event_counter = 1

    def process_tracks(
        self,
        tracks: List[TrackedObject],
        current_frame: Optional[np.ndarray] = None,
        clip_ref: Optional[str] = None,
    ) -> List[CrossingEvent]:
        new_events = []

        for track in tracks:
            # Need at least two points to establish trajectory vector
            if len(track.history) < 2:
                continue

            curr_obs = track.history[-1]
            prev_obs = track.history[-2]

            pt_curr = curr_obs.center
            pt_prev = prev_obs.center

            # Movement vector
            mv_x = pt_curr[0] - pt_prev[0]
            mv_y = pt_curr[1] - pt_prev[1]

            for door_id, door in self.doors.items():
                # Deduplication rule: one bag counts once per door
                if track.track_id in self.counted_tracks[door_id]:
                    continue

                # Intersection test between previous trajectory segment and door line
                p1 = door.p1
                p2 = door.p2
                tol = door.line_tolerance or self.config.default_line_tolerance

                if segments_intersect(pt_prev, pt_curr, p1, p2, tolerance=tol):
                    # Direction test: dot product of movement vector with side_vector
                    sx, sy = door.side_vector
                    dot = mv_x * sx + mv_y * sy
                    direction = "loaded" if dot >= 0 else "unloaded"

                    # Calculate mean confidence near crossing window
                    win = self.config.crossing_confidence_window
                    recent_obs = track.history[-win:]
                    mean_conf = sum(o.confidence for o in recent_obs) / len(recent_obs)

                    # Mark track as counted for this door
                    self.counted_tracks[door_id].add(track.track_id)

                    # Save thumbnail if frame is provided
                    thumb_path = None
                    if current_frame is not None:
                        thumb_path = self._save_thumbnail(current_frame, curr_obs.box, track.track_id)

                    event = CrossingEvent(
                        event_id=f"EV-{self.wagon_id}-{self._event_counter:05d}",
                        wagon_id=self.wagon_id,
                        door_id=door_id,
                        track_id=track.track_id,
                        direction=direction,
                        timestamp=curr_obs.timestamp,
                        confidence=round(mean_conf, 3),
                        frame_idx=curr_obs.frame_idx,
                        box=curr_obs.box,
                        clip_ref=clip_ref,
                        thumbnail_path=str(thumb_path) if thumb_path else None,
                        was_lost=track.was_lost,
                    )
                    self._event_counter += 1
                    self.events.append(event)
                    new_events.append(event)

        return new_events

    def _save_thumbnail(
        self, frame: np.ndarray, box: Tuple[float, float, float, float], track_id: int
    ) -> Path:
        h, w = frame.shape[:2]
        x1, y1, x2, y2 = [int(v) for v in box]
        # 10% padding
        pad_x = int((x2 - x1) * 0.1)
        pad_y = int((y2 - y1) * 0.1)
        x1_p = max(0, x1 - pad_x)
        y1_p = max(0, y1 - pad_y)
        x2_p = min(w, x2 + pad_x)
        y2_p = min(h, y2 + pad_y)

        crop = frame[y1_p:y2_p, x1_p:x2_p]
        filename = f"thumb_{self.wagon_id}_tr{track_id}_{self._event_counter}.jpg"
        file_path = self.thumbnail_dir / filename
        if crop.size > 0:
            cv2.imwrite(str(file_path), crop)
        return file_path
