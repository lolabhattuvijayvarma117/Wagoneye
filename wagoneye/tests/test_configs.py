"""Unit tests for configuration loading and validation."""

from pathlib import Path
import pytest
from wagoneye.config import (
    load_camera_config,
    load_doors_config,
    load_model_config,
    CameraConfig,
    WagonDoorsConfig,
    ModelConfig,
)


def test_camera_config_loads_successfully():
    config_path = Path("configs/camera.yaml")
    assert config_path.exists(), "configs/camera.yaml must exist"
    cfg = load_camera_config(config_path)
    assert isinstance(cfg, CameraConfig)
    assert cfg.camera_id == "CAM-PORT-DOCK-04"
    assert cfg.fps > 0
    assert cfg.resolution.width == 1920
    assert cfg.resolution.height == 1080
    assert cfg.timezone.utc_offset == "+05:30"


def test_wagon_doors_config_loads_successfully():
    config_path = Path("configs/wagon_doors.yaml")
    assert config_path.exists(), "configs/wagon_doors.yaml must exist"
    cfg = load_doors_config(config_path)
    assert isinstance(cfg, WagonDoorsConfig)
    assert "WGN-4471" in cfg.doors
    doors = cfg.doors["WGN-4471"]
    assert len(doors) >= 1
    d1 = doors[0]
    assert d1.door_id == "DOOR-WGN-4471-A"
    assert len(d1.p1) == 2
    assert len(d1.p2) == 2
    assert len(d1.side_vector) == 2
    assert d1.line_tolerance > 0


def test_model_config_loads_successfully():
    config_path = Path("configs/model.yaml")
    assert config_path.exists(), "configs/model.yaml must exist"
    cfg = load_model_config(config_path)
    assert isinstance(cfg, ModelConfig)
    assert cfg.detection.frame_stride == 3
    assert cfg.detection.model_type == "yolov8s"
    assert cfg.detection.weights_path == "weights/yolov8s.pt"
    assert cfg.detection.confidence_threshold == 0.35
    assert "bag" in cfg.detection.classes
    assert cfg.tracking.track_buffer == 30
    assert cfg.tracking.tracker_type == "bytetrack"
    assert cfg.review.low_confidence_threshold == 0.60
    assert "bag" in cfg.detection.zero_shot.text_queries
