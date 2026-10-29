"""Configuration management for WagonEye."""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import yaml
from pydantic import BaseModel, Field


class ResolutionConfig(BaseModel):
    width: int = 1920
    height: int = 1080


class TimezoneConfig(BaseModel):
    utc_offset: str = "+00:00"
    tz_name: str = "UTC"


class IngestConfig(BaseModel):
    clip_output_dir: str = "data/clips"
    thumbnail_output_dir: str = "data/thumbnails"
    time_format: str = "ISO8601"


class CameraConfig(BaseModel):
    camera_id: str
    location: str
    source: str
    fps: float = 25.0
    resolution: ResolutionConfig = Field(default_factory=ResolutionConfig)
    timezone: TimezoneConfig = Field(default_factory=TimezoneConfig)
    ingest: IngestConfig = Field(default_factory=IngestConfig)


class DoorConfig(BaseModel):
    door_id: str
    p1: Tuple[float, float]
    p2: Tuple[float, float]
    side_vector: Tuple[float, float] = (0.0, 1.0)
    line_tolerance: float = 15.0


class WagonDoorsConfig(BaseModel):
    doors: Dict[str, List[DoorConfig]]


class ZeroShotConfig(BaseModel):
    model_name: str = "google/owlvit-base-patch32"
    text_queries: List[str] = Field(default_factory=lambda: ["bag", "sack", "package"])
    score_threshold: float = 0.25


class DetectionConfig(BaseModel):
    mode: str = "yolo"  # "yolo" or "zero_shot"
    model_type: str = "yolov8s"
    weights_path: str = "weights/yolov8s.pt"
    device: str = "cpu"
    confidence_threshold: float = 0.35
    iou_threshold: float = 0.45
    frame_stride: int = 3
    classes: List[str] = Field(default_factory=lambda: ["bag"])
    zero_shot: ZeroShotConfig = Field(default_factory=ZeroShotConfig)


class TrackingConfig(BaseModel):
    tracker_type: str = "bytetrack"
    track_high_thresh: float = 0.5
    track_low_thresh: float = 0.1
    new_track_thresh: float = 0.6
    track_buffer: int = 30
    match_thresh: float = 0.8
    frame_rate: int = 25


class CountingConfig(BaseModel):
    crossing_confidence_window: int = 5
    default_line_tolerance: float = 15.0


class ReviewConfig(BaseModel):
    low_confidence_threshold: float = 0.60
    flag_lost_reacquired: bool = True
    density_disagreement_ratio: float = 0.15


class ModelConfig(BaseModel):
    detection: DetectionConfig = Field(default_factory=DetectionConfig)
    tracking: TrackingConfig = Field(default_factory=TrackingConfig)
    counting: CountingConfig = Field(default_factory=CountingConfig)
    review: ReviewConfig = Field(default_factory=ReviewConfig)


def load_yaml(path: str | Path) -> Dict[str, Any]:
    """Load a YAML file."""
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def load_camera_config(path: str | Path = "configs/camera.yaml") -> CameraConfig:
    data = load_yaml(path)
    return CameraConfig(**data)


def load_doors_config(path: str | Path = "configs/wagon_doors.yaml") -> WagonDoorsConfig:
    data = load_yaml(path)
    return WagonDoorsConfig(**data)


def load_model_config(path: str | Path = "configs/model.yaml") -> ModelConfig:
    data = load_yaml(path)
    return ModelConfig(**data)
