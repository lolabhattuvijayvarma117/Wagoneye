"""Unit tests for Ingest, Detector, Tracker, and DoorLineCounter with synthetic clips."""

from datetime import datetime, timezone
from pathlib import Path
import cv2
import numpy as np
import pytest
from wagoneye.config import CountingConfig, DoorConfig, TrackingConfig
from wagoneye.count.counter import DoorLineCounter
from wagoneye.detect.detector import Detection, MockDetector
from wagoneye.ingest.reader import VideoIngest, WagonScheduleItem
from wagoneye.track.tracker import ByteTracker, TrackObservation, TrackedObject


def create_synthetic_video(file_path: Path, num_frames: int = 30, width: int = 640, height: int = 480) -> Path:
    """Creates a synthetic test video with a moving white rectangle on black background."""
    file_path.parent.mkdir(parents=True, exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(file_path), fourcc, 10.0, (width, height))

    for i in range(num_frames):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        # Move rectangle downwards from y=50 to y=350
        y = int(50 + (i / num_frames) * 300)
        cv2.rectangle(frame, (250, y), (350, y + 60), (255, 255, 255), -1)
        out.write(frame)

    out.release()
    return file_path


def test_synthetic_video_ingest_and_slicing(tmp_path):
    video_path = tmp_path / "test_feed.mp4"
    create_synthetic_video(video_path, num_frames=30)

    start_utc = datetime(2026, 10, 28, 10, 0, 0, tzinfo=timezone.utc)
    ingest = VideoIngest(video_path=video_path, start_time_utc=start_utc, local_offset="+05:30")

    assert ingest.total_frames == 30
    assert ingest.width == 640
    assert ingest.height == 480

    frames = list(ingest.frames(stride=2))
    assert len(frames) == 15
    f0 = frames[0]
    assert f0.frame_idx == 0
    assert f0.timestamp_utc == start_utc
    assert f0.local_offset == "+05:30"

    # Test clip slicing
    schedule = WagonScheduleItem(
        wagon_id="WGN-TEST-01",
        start_time_utc=start_utc,
        end_time_utc=start_utc + (frames[-1].timestamp_utc - start_utc),
    )
    clip_path = ingest.slice_clip_for_wagon(schedule, output_dir=tmp_path / "clips")
    assert clip_path.exists()


def test_bytetrack_tracking_continuity_and_occlusion():
    cfg = TrackingConfig(
        track_high_thresh=0.5,
        track_low_thresh=0.1,
        new_track_thresh=0.6,
        track_buffer=5,  # 5 frames occlusion buffer
        match_thresh=0.4,
    )
    tracker = ByteTracker(cfg)
    now = datetime.now(timezone.utc)

    # Frame 0: High confidence detection
    d0 = Detection(frame_idx=0, timestamp=now, box=(100, 100, 150, 150), class_name="bag", confidence=0.9)
    tracks_0 = tracker.update([d0], frame_idx=0, timestamp=now)
    assert len(tracks_0) == 1
    t_id = tracks_0[0].track_id

    # Frame 1: Detection moves slightly
    d1 = Detection(frame_idx=1, timestamp=now, box=(105, 105, 155, 155), class_name="bag", confidence=0.85)
    tracks_1 = tracker.update([d1], frame_idx=1, timestamp=now)
    assert len(tracks_1) == 1
    assert tracks_1[0].track_id == t_id  # Track ID persists!

    # Frames 2, 3: Occlusion (no detections) - track should be kept in buffer
    tracks_2 = tracker.update([], frame_idx=2, timestamp=now)
    assert t_id in tracker.lost_tracks
    assert tracker.lost_tracks[t_id].state == "lost"

    # Frame 4: Re-appears with low confidence (0.25)
    d4 = Detection(frame_idx=4, timestamp=now, box=(110, 110, 160, 160), class_name="bag", confidence=0.25)
    tracks_4 = tracker.update([d4], frame_idx=4, timestamp=now)
    assert len(tracks_4) == 1
    assert tracks_4[0].track_id == t_id  # Continuity preserved!
    assert tracks_4[0].was_lost is True


def test_counter_both_directions(tmp_path):
    door = DoorConfig(
        door_id="DOOR-01",
        p1=(100.0, 300.0),
        p2=(500.0, 300.0),
        side_vector=(0.0, 1.0),  # Top -> Down is loaded
        line_tolerance=10.0,
    )
    counter = DoorLineCounter(wagon_id="WGN-TEST", doors=[door], thumbnail_dir=tmp_path / "thumbs")
    now = datetime.now(timezone.utc)

    # 1. Track moving downwards: (200, 250) -> (200, 350) => LOADED
    tr_load = TrackedObject(
        track_id=1,
        history=[
            TrackObservation(frame_idx=0, timestamp=now, box=(180, 230, 220, 270), confidence=0.9, center=(200.0, 250.0)),
            TrackObservation(frame_idx=1, timestamp=now, box=(180, 330, 220, 370), confidence=0.95, center=(200.0, 350.0)),
        ],
    )
    events_load = counter.process_tracks([tr_load])
    assert len(events_load) == 1
    assert events_load[0].direction == "loaded"
    assert events_load[0].wagon_id == "WGN-TEST"
    assert events_load[0].door_id == "DOOR-01"

    # 2. Track moving upwards: (300, 350) -> (300, 250) => UNLOADED
    tr_unload = TrackedObject(
        track_id=2,
        history=[
            TrackObservation(frame_idx=0, timestamp=now, box=(280, 330, 320, 370), confidence=0.8, center=(300.0, 350.0)),
            TrackObservation(frame_idx=1, timestamp=now, box=(280, 230, 320, 270), confidence=0.85, center=(300.0, 250.0)),
        ],
    )
    events_unload = counter.process_tracks([tr_unload])
    assert len(events_unload) == 1
    assert events_unload[0].direction == "unloaded"


def test_counter_deduplication_tracks_crossing_twice(tmp_path):
    door = DoorConfig(
        door_id="DOOR-01",
        p1=(100.0, 300.0),
        p2=(500.0, 300.0),
        side_vector=(0.0, 1.0),
    )
    counter = DoorLineCounter(wagon_id="WGN-TEST", doors=[door], thumbnail_dir=tmp_path / "thumbs")
    now = datetime.now(timezone.utc)

    tr = TrackedObject(
        track_id=42,
        history=[
            TrackObservation(frame_idx=0, timestamp=now, box=(180, 250, 220, 290), confidence=0.9, center=(200.0, 270.0)),
            TrackObservation(frame_idx=1, timestamp=now, box=(180, 310, 220, 350), confidence=0.9, center=(200.0, 330.0)),
        ],
    )

    # First crossing -> should emit event
    ev1 = counter.process_tracks([tr])
    assert len(ev1) == 1

    # Track moves back upwards across the line
    tr.history.append(
        TrackObservation(frame_idx=2, timestamp=now, box=(180, 250, 220, 290), confidence=0.88, center=(200.0, 270.0))
    )
    ev2 = counter.process_tracks([tr])
    assert len(ev2) == 0  # Deduplicated!

    # Track crosses downwards again
    tr.history.append(
        TrackObservation(frame_idx=3, timestamp=now, box=(180, 310, 220, 350), confidence=0.92, center=(200.0, 330.0))
    )
    ev3 = counter.process_tracks([tr])
    assert len(ev3) == 0  # Deduplicated: still counts only once!

    # Total events emitted across session must be 1
    assert len(counter.events) == 1
    assert counter.events[0].track_id == 42


def test_counter_confidence_averaging(tmp_path):
    door = DoorConfig(door_id="DOOR-01", p1=(0, 100), p2=(200, 100), side_vector=(0, 1))
    counter = DoorLineCounter(
        wagon_id="WGN-CONF",
        doors=[door],
        config=CountingConfig(crossing_confidence_window=3),
        thumbnail_dir=tmp_path / "thumbs",
    )
    now = datetime.now(timezone.utc)

    tr = TrackedObject(
        track_id=99,
        history=[
            TrackObservation(frame_idx=0, timestamp=now, box=(10, 10, 30, 30), confidence=0.80, center=(20.0, 20.0)),
            TrackObservation(frame_idx=1, timestamp=now, box=(10, 80, 30, 100), confidence=0.90, center=(20.0, 90.0)),
            TrackObservation(frame_idx=2, timestamp=now, box=(10, 110, 30, 130), confidence=0.70, center=(20.0, 120.0)),
        ],
    )
    ev = counter.process_tracks([tr])
    assert len(ev) == 1
    # Average of last 3 observations: (0.80 + 0.90 + 0.70) / 3 = 0.80
    assert ev[0].confidence == pytest.approx(0.80, abs=0.01)
