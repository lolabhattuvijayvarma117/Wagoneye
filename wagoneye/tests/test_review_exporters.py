"""Unit tests for review queue builder and CVAT/COCO exporters."""

import json
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
import pytest
from wagoneye.config import ReviewConfig
from wagoneye.count.counter import CrossingEvent
from wagoneye.review.exporters import export_coco_json, export_cvat_xml
from wagoneye.review.queue import ReviewQueueBuilder


@pytest.fixture
def sample_events(tmp_path):
    now = datetime(2026, 10, 28, 12, 0, 0, tzinfo=timezone.utc)
    # Create a dummy thumbnail
    thumb_path = tmp_path / "thumb_WGN-4471_tr101_1.jpg"
    thumb_path.write_bytes(b"dummy image data")

    ev_low_conf = CrossingEvent(
        event_id="EV-001",
        wagon_id="WGN-4471",
        door_id="DOOR-A",
        track_id=101,
        direction="loaded",
        timestamp=now,
        confidence=0.54,  # < 0.60
        frame_idx=15,
        box=(50.0, 60.0, 120.0, 140.0),
        thumbnail_path=str(thumb_path),
        was_lost=False,
    )

    ev_lost = CrossingEvent(
        event_id="EV-002",
        wagon_id="WGN-4471",
        door_id="DOOR-A",
        track_id=102,
        direction="loaded",
        timestamp=now,
        confidence=0.88,  # high confidence, but was lost
        frame_idx=30,
        box=(200.0, 150.0, 280.0, 220.0),
        thumbnail_path=None,
        was_lost=True,
    )

    ev_normal = CrossingEvent(
        event_id="EV-003",
        wagon_id="WGN-4471",
        door_id="DOOR-A",
        track_id=103,
        direction="loaded",
        timestamp=now,
        confidence=0.95,
        frame_idx=45,
        box=(300.0, 180.0, 360.0, 240.0),
        thumbnail_path=None,
        was_lost=False,
    )

    return [ev_low_conf, ev_lost, ev_normal]


def test_review_queue_filtering(sample_events):
    cfg = ReviewConfig(low_confidence_threshold=0.60, flag_lost_reacquired=True)
    builder = ReviewQueueBuilder(cfg)
    items = builder.filter_events(sample_events)

    # ev_low_conf (conf 0.54) and ev_lost (was_lost=True) should be flagged; ev_normal should not
    assert len(items) == 2
    reasons = [it.reason for it in items]
    assert "low_confidence" in reasons
    assert "lost_reacquired" in reasons


def test_review_queue_density_discrepancy(sample_events):
    cfg = ReviewConfig(density_disagreement_ratio=0.15)
    builder = ReviewQueueBuilder(cfg)
    # Line count = 100, density estimate = 70 => 30% diff > 15% threshold
    items = builder.filter_events(sample_events, wagon_count=100, secondary_estimate=70)
    assert len(items) >= 2


def test_cvat_xml_exporter(sample_events, tmp_path):
    builder = ReviewQueueBuilder()
    items = builder.filter_events(sample_events)

    xml_path = tmp_path / "review_task.xml"
    thumb_dir = tmp_path / "exported_thumbs"
    export_cvat_xml(items, xml_path, task_name="Test Wagon Review", export_thumbnails_dir=thumb_dir)

    assert xml_path.exists()
    tree = ET.parse(xml_path)
    root = tree.getroot()
    assert root.tag == "annotations"

    task = root.find("meta/task")
    assert task is not None
    assert task.find("name").text == "Test Wagon Review"

    images = root.findall("image")
    assert len(images) == len(items)

    first_box = images[0].find("box")
    assert first_box is not None
    assert first_box.get("label") == "bag"
    assert float(first_box.get("xtl")) == 50.0

    # Verify thumbnail was copied
    assert (thumb_dir / "thumb_WGN-4471_tr101_1.jpg").exists()


def test_coco_json_exporter(sample_events, tmp_path):
    builder = ReviewQueueBuilder()
    items = builder.filter_events(sample_events)

    json_path = tmp_path / "review_dataset.json"
    thumb_dir = tmp_path / "exported_thumbs_coco"
    export_coco_json(items, json_path, export_thumbnails_dir=thumb_dir)

    assert json_path.exists()
    with open(json_path, "r", encoding="utf-8") as f:
        coco = json.load(f)

    assert "images" in coco
    assert "annotations" in coco
    assert "categories" in coco
    assert len(coco["images"]) == len(items)
    assert len(coco["annotations"]) == len(items)

    ann = coco["annotations"][0]
    assert ann["category_id"] == 1
    # Bbox in COCO is [x, y, width, height]
    bbox = ann["bbox"]
    assert bbox[0] == 50.0  # x1
    assert bbox[1] == 60.0  # y1
    assert bbox[2] == 70.0  # width = 120 - 50
    assert bbox[3] == 80.0  # height = 140 - 60
    assert ann["attributes"]["direction"] == "loaded"
    assert ann["attributes"]["wagon_id"] == "WGN-4471"
