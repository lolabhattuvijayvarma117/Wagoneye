#!/usr/bin/env python3
"""Run WagonEye computer vision bag detection, tracking, counting and review pipeline."""

import argparse
from datetime import datetime, timezone
from pathlib import Path
import sys

# Add src to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from wagoneye.config import load_camera_config, load_doors_config, load_model_config
from wagoneye.count.counter import DoorLineCounter
from wagoneye.detect.detector import YOLODetector
from wagoneye.ingest.reader import VideoIngest, WagonScheduleItem
from wagoneye.review.exporters import export_coco_json, export_cvat_xml
from wagoneye.review.queue import ReviewQueueBuilder
from wagoneye.store.database import SessionLocal
from wagoneye.store.repository import DatabaseRepository
from wagoneye.track.tracker import ByteTracker


def main():
    parser = argparse.ArgumentParser(description="Run WagonEye CV Pipeline on video")
    parser.add_argument("--video", type=str, required=True, help="Path to input video file")
    parser.add_argument("--wagon-id", type=str, default="WGN-4471", help="Target wagon ID")
    parser.add_argument("--train-id", type=str, default="TR-2210", help="Associated train ID")
    parser.add_argument("--camera-config", type=str, default="configs/camera.yaml", help="Path to camera.yaml")
    parser.add_argument("--doors-config", type=str, default="configs/wagon_doors.yaml", help="Path to wagon_doors.yaml")
    parser.add_argument("--model-config", type=str, default="configs/model.yaml", help="Path to model.yaml")
    args = parser.parse_args()

    video_path = Path(args.video)
    if not video_path.exists():
        print(f"[Error] Video not found: {video_path}")
        sys.exit(1)

    print(f"[WagonEye] Loading configurations...")
    cam_cfg = load_camera_config(args.camera_config)
    doors_cfg = load_doors_config(args.doors_config)
    model_cfg = load_model_config(args.model_config)

    wagon_doors = doors_cfg.doors.get(args.wagon_id, doors_cfg.doors.get("DEFAULT", []))
    print(f"✓ Configured {len(wagon_doors)} virtual door lines for {args.wagon_id}.")

    # Ingest
    ingest = VideoIngest(
        video_path=video_path,
        fps=cam_cfg.fps,
        local_offset=cam_cfg.timezone.utc_offset,
    )

    # Initialize CV components
    detector = YOLODetector(model_cfg.detection)
    tracker = ByteTracker(model_cfg.tracking)
    counter = DoorLineCounter(
        wagon_id=args.wagon_id,
        doors=wagon_doors,
        config=model_cfg.counting,
        thumbnail_dir=cam_cfg.ingest.thumbnail_output_dir,
    )
    repo = DatabaseRepository(session_factory=SessionLocal)

    print(f"[WagonEye] Processing video {video_path} (stride={model_cfg.detection.frame_stride})...")
    total_frames_processed = 0
    stride = model_cfg.detection.frame_stride

    for packet in ingest.frames(stride=stride):
        detections = detector.detect(packet.frame, packet.frame_idx, packet.timestamp_utc)
        tracks = tracker.update(detections, packet.frame_idx, packet.timestamp_utc)
        counter.process_tracks(tracks, current_frame=packet.frame, clip_ref=str(video_path))
        total_frames_processed += 1

    # Store results in Database
    now = datetime.now(timezone.utc)
    loaded_count = sum(1 for e in counter.events if e.direction == "loaded")
    unloaded_count = sum(1 for e in counter.events if e.direction == "unloaded")

    repo.upsert_wagon(
        wagon_id=args.wagon_id,
        train_id=args.train_id,
        status="completed",
        arrival=now,
        departure=now,
        bags_loaded=loaded_count,
        bags_unloaded=unloaded_count,
    )

    for ev in counter.events:
        repo.add_crossing_event(
            event_id=ev.event_id,
            wagon_id=ev.wagon_id,
            door_id=ev.door_id,
            track_id=ev.track_id,
            direction=ev.direction,
            timestamp=ev.timestamp,
            confidence=ev.confidence,
            frame_idx=ev.frame_idx,
            box=ev.box,
            clip_ref=ev.clip_ref,
            thumbnail_path=ev.thumbnail_path,
            was_lost=ev.was_lost,
        )

    # Build review queue
    review_builder = ReviewQueueBuilder(model_cfg.review)
    review_items = review_builder.filter_events(counter.events)

    if review_items:
        cvat_out = Path("data/labels/review_task.xml")
        coco_out = Path("data/labels/review_coco.json")
        export_cvat_xml(review_items, cvat_out, task_name=f"Wagon {args.wagon_id} Review Queue")
        export_coco_json(review_items, coco_out)
        print(f"✓ Exported {len(review_items)} review items to {cvat_out} and {coco_out}")

    print("\n--- Pipeline Run Summary ---")
    print(f"Wagon ID: {args.wagon_id}")
    print(f"Frames processed: {total_frames_processed}")
    print(f"Bags Loaded: {loaded_count}")
    print(f"Bags Unloaded: {unloaded_count}")
    print(f"Total Crossing Events: {len(counter.events)}")
    print(f"Flagged for Review: {len(review_items)}")


if __name__ == "__main__":
    main()
