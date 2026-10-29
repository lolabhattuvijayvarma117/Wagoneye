"""ByteTrack tracking wrapper with occlusion buffer continuity for WagonEye."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import numpy as np
from wagoneye.config import TrackingConfig
from wagoneye.detect.detector import Detection


def calculate_iou(boxA: Tuple[float, float, float, float], boxB: Tuple[float, float, float, float]) -> float:
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0.0, xB - xA) * max(0.0, yB - yA)
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

    denom = float(boxAArea + boxBArea - interArea)
    if denom <= 0:
        return 0.0
    return interArea / denom


@dataclass
class TrackObservation:
    frame_idx: int
    timestamp: datetime
    box: Tuple[float, float, float, float]
    confidence: float
    center: Tuple[float, float]


@dataclass
class TrackedObject:
    track_id: int
    history: List[TrackObservation] = field(default_factory=list)
    state: str = "active"  # "active", "lost", "retired"
    frames_since_update: int = 0
    was_lost: bool = False  # Track was lost and re-acquired

    @property
    def latest(self) -> TrackObservation:
        return self.history[-1]

    @property
    def trajectory(self) -> List[Tuple[float, float]]:
        return [obs.center for obs in self.history]

    @property
    def mean_confidence(self) -> float:
        if not self.history:
            return 0.0
        return sum(obs.confidence for obs in self.history) / len(self.history)


class ByteTracker:
    """ByteTrack algorithm implementation with configurable occlusion buffer."""

    def __init__(self, config: TrackingConfig):
        self.config = config
        self.track_high_thresh = config.track_high_thresh
        self.track_low_thresh = config.track_low_thresh
        self.new_track_thresh = config.new_track_thresh
        self.track_buffer = config.track_buffer
        self.match_thresh = config.match_thresh

        self._next_id = 1
        self.active_tracks: Dict[int, TrackedObject] = {}
        self.lost_tracks: Dict[int, TrackedObject] = {}
        self.retired_tracks: List[TrackedObject] = []

    def update(self, detections: List[Detection], frame_idx: int, timestamp: datetime) -> List[TrackedObject]:
        # 1. Split detections into high and low confidence
        high_dets = [d for d in detections if d.confidence >= self.track_high_thresh]
        low_dets = [d for d in detections if self.track_low_thresh <= d.confidence < self.track_high_thresh]

        # All track candidates
        all_tracks = {**self.active_tracks, **self.lost_tracks}
        unmatched_tracks = set(all_tracks.keys())
        unmatched_high_dets = list(range(len(high_dets)))

        # 2. First association: active & lost tracks with high confidence detections
        matched_tracks_1, unmatched_tracks, unmatched_high_dets = self._match(
            all_tracks, high_dets, unmatched_tracks, unmatched_high_dets, self.match_thresh
        )

        for track_id, det_idx in matched_tracks_1:
            det = high_dets[det_idx]
            track = all_tracks[track_id]
            if track.state == "lost":
                track.was_lost = True
            track.state = "active"
            track.frames_since_update = 0
            track.history.append(
                TrackObservation(
                    frame_idx=frame_idx,
                    timestamp=timestamp,
                    box=det.box,
                    confidence=det.confidence,
                    center=det.center,
                )
            )
            self.active_tracks[track_id] = track
            self.lost_tracks.pop(track_id, None)

        # 3. Second association: remaining unmatched tracks with low confidence detections
        unmatched_low_dets = list(range(len(low_dets)))
        matched_tracks_2, unmatched_tracks, _ = self._match(
            all_tracks, low_dets, unmatched_tracks, unmatched_low_dets, self.match_thresh * 0.8
        )

        for track_id, det_idx in matched_tracks_2:
            det = low_dets[det_idx]
            track = all_tracks[track_id]
            if track.state == "lost":
                track.was_lost = True
            track.state = "active"
            track.frames_since_update = 0
            track.history.append(
                TrackObservation(
                    frame_idx=frame_idx,
                    timestamp=timestamp,
                    box=det.box,
                    confidence=det.confidence,
                    center=det.center,
                )
            )
            self.active_tracks[track_id] = track
            self.lost_tracks.pop(track_id, None)

        # 4. Handle remaining unmatched tracks (transition active -> lost -> retired)
        for track_id in unmatched_tracks:
            track = all_tracks[track_id]
            track.frames_since_update += 1
            if track.frames_since_update > self.track_buffer:
                track.state = "retired"
                self.retired_tracks.append(track)
                self.active_tracks.pop(track_id, None)
                self.lost_tracks.pop(track_id, None)
            else:
                track.state = "lost"
                self.lost_tracks[track_id] = track
                self.active_tracks.pop(track_id, None)

        # 5. Initialize new tracks from unmatched high confidence detections
        for det_idx in unmatched_high_dets:
            det = high_dets[det_idx]
            if det.confidence >= self.new_track_thresh:
                new_track = TrackedObject(
                    track_id=self._next_id,
                    history=[
                        TrackObservation(
                            frame_idx=frame_idx,
                            timestamp=timestamp,
                            box=det.box,
                            confidence=det.confidence,
                            center=det.center,
                        )
                    ],
                    state="active",
                    frames_since_update=0,
                )
                self.active_tracks[self._next_id] = new_track
                self._next_id += 1

        return list(self.active_tracks.values())

    def _match(
        self,
        tracks: Dict[int, TrackedObject],
        detections: List[Detection],
        track_ids: set,
        det_indices: List[int],
        threshold: float,
    ) -> Tuple[List[Tuple[int, int]], set, List[int]]:
        matches: List[Tuple[int, int]] = []
        remaining_track_ids = set(track_ids)
        remaining_det_indices = list(det_indices)

        if not remaining_track_ids or not remaining_det_indices:
            return matches, remaining_track_ids, remaining_det_indices

        # Greedy IoU matching
        cost_list = []
        for t_id in remaining_track_ids:
            track_box = tracks[t_id].latest.box
            for d_idx in remaining_det_indices:
                det_box = detections[d_idx].box
                iou = calculate_iou(track_box, det_box)
                if iou >= threshold:
                    cost_list.append((iou, t_id, d_idx))

        # Sort descending by IoU
        cost_list.sort(key=lambda x: x[0], reverse=True)

        matched_tracks = set()
        matched_dets = set()

        for iou, t_id, d_idx in cost_list:
            if t_id not in matched_tracks and d_idx not in matched_dets:
                matches.append((t_id, d_idx))
                matched_tracks.add(t_id)
                matched_dets.add(d_idx)

        remaining_track_ids -= matched_tracks
        remaining_det_indices = [idx for idx in remaining_det_indices if idx not in matched_dets]

        return matches, remaining_track_ids, remaining_det_indices
