"""Detector wrapper supporting YOLO and Zero-Shot OWL-ViT for WagonEye."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple
import numpy as np
from wagoneye.config import DetectionConfig


@dataclass
class Detection:
    frame_idx: int
    timestamp: datetime
    box: Tuple[float, float, float, float]  # (x1, y1, x2, y2)
    class_name: str
    confidence: float

    @property
    def center(self) -> Tuple[float, float]:
        x1, y1, x2, y2 = self.box
        return ((x1 + x2) / 2.0, (y1 + y2) / 2.0)

    @property
    def width(self) -> float:
        return self.box[2] - self.box[0]

    @property
    def height(self) -> float:
        return self.box[3] - self.box[1]


class BaseDetector(ABC):
    @abstractmethod
    def detect(self, frame: np.ndarray, frame_idx: int, timestamp: datetime) -> List[Detection]:
        pass


class YOLODetector(BaseDetector):
    """Ultralytics YOLO wrapper for trained bag detection."""

    def __init__(self, config: DetectionConfig):
        self.config = config
        self.classes = config.classes
        self.conf_thresh = config.confidence_threshold
        self.iou_thresh = config.iou_threshold
        self.model = None

        # Lazy load weights if path exists
        weights_path = Path(config.weights_path)
        if weights_path.exists():
            try:
                from ultralytics import YOLO
                self.model = YOLO(str(weights_path))
            except Exception as e:
                print(f"[Warning] Could not load YOLO model from {weights_path}: {e}")

    def detect(self, frame: np.ndarray, frame_idx: int, timestamp: datetime) -> List[Detection]:
        if self.model is None:
            # Fallback or synthetic passthrough when weights file is not present
            return []

        results = self.model.predict(
            source=frame,
            conf=self.conf_thresh,
            iou=self.iou_thresh,
            verbose=False,
            device=self.config.device,
        )

        detections = []
        for r in results:
            boxes = r.boxes
            for b in boxes:
                cls_id = int(b.cls[0].item())
                name = self.model.names.get(cls_id, "bag") if hasattr(self.model, "names") else "bag"
                conf = float(b.conf[0].item())
                x1, y1, x2, y2 = b.xyxy[0].tolist()
                detections.append(
                    Detection(
                        frame_idx=frame_idx,
                        timestamp=timestamp,
                        box=(x1, y1, x2, y2),
                        class_name=name,
                        confidence=conf,
                    )
                )
        return detections


class ZeroShotDetector(BaseDetector):
    """Zero-shot detector using OWL-ViT for pre-labeling with text prompts."""

    def __init__(self, config: DetectionConfig):
        self.config = config
        self.text_queries = config.zero_shot.text_queries
        self.score_thresh = config.zero_shot.score_threshold
        self.processor = None
        self.model = None

        try:
            from transformers import OwlViTForObjectDetection, OwlViTProcessor
            self.processor = OwlViTProcessor.from_pretrained(config.zero_shot.model_name)
            self.model = OwlViTForObjectDetection.from_pretrained(config.zero_shot.model_name)
            self.model.eval()
        except Exception:
            # Lazy fallback if transformers or weights not downloaded yet
            self.processor = None
            self.model = None

    def detect(self, frame: np.ndarray, frame_idx: int, timestamp: datetime) -> List[Detection]:
        if self.model is None or self.processor is None:
            return []

        import torch
        from PIL import Image

        image = Image.fromarray(frame[:, :, ::-1])  # BGR to RGB
        inputs = self.processor(text=self.text_queries, images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = self.model(**inputs)

        target_sizes = torch.tensor([image.size[::-1]])
        results = self.processor.post_process_object_detection(
            outputs=outputs, target_sizes=target_sizes, threshold=self.score_thresh
        )[0]

        detections = []
        for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
            conf = float(score.item())
            lbl_name = self.text_queries[label.item()] if label.item() < len(self.text_queries) else "bag"
            x1, y1, x2, y2 = [float(v) for v in box.tolist()]
            detections.append(
                Detection(
                    frame_idx=frame_idx,
                    timestamp=timestamp,
                    box=(x1, y1, x2, y2),
                    class_name=lbl_name,
                    confidence=conf,
                )
            )
        return detections


class MockDetector(BaseDetector):
    """Configurable synthetic detector for unit testing."""

    def __init__(self, predefined_detections: Optional[List[Detection]] = None):
        self.predefined = predefined_detections or []

    def detect(self, frame: np.ndarray, frame_idx: int, timestamp: datetime) -> List[Detection]:
        return [d for d in self.predefined if d.frame_idx == frame_idx]
