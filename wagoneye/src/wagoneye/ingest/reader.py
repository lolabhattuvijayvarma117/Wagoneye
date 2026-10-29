"""Video ingestion and clip slicing for WagonEye."""

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Generator, List, Optional, Tuple
import cv2
import numpy as np


@dataclass
class FramePacket:
    frame_idx: int
    frame: np.ndarray
    timestamp_utc: datetime
    local_offset: str


@dataclass
class WagonScheduleItem:
    wagon_id: str
    start_time_utc: datetime
    end_time_utc: datetime
    train_id: Optional[str] = None


class VideoIngest:
    """Reads video frames and associates UTC timestamps with local offset."""

    def __init__(
        self,
        video_path: str | Path,
        fps: Optional[float] = None,
        start_time_utc: Optional[datetime] = None,
        local_offset: str = "+00:00",
    ):
        self.video_path = Path(video_path)
        self.local_offset = local_offset
        self.start_time_utc = start_time_utc or datetime.now(timezone.utc)

        if not self.video_path.exists():
            raise FileNotFoundError(f"Video file not found: {self.video_path}")

        cap = cv2.VideoCapture(str(self.video_path))
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {self.video_path}")

        detected_fps = cap.get(cv2.CAP_PROP_FPS)
        self.fps = fps or (detected_fps if detected_fps > 0 else 25.0)
        self.total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()

    def frames(
        self, stride: int = 1, start_frame: int = 0, max_frames: Optional[int] = None
    ) -> Generator[FramePacket, None, None]:
        cap = cv2.VideoCapture(str(self.video_path))
        if start_frame > 0:
            cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

        curr_frame = start_frame
        frames_yielded = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            if (curr_frame - start_frame) % stride == 0:
                offset_seconds = curr_frame / self.fps
                frame_ts_utc = self.start_time_utc + timedelta(seconds=offset_seconds)
                yield FramePacket(
                    frame_idx=curr_frame,
                    frame=frame,
                    timestamp_utc=frame_ts_utc,
                    local_offset=self.local_offset,
                )
                frames_yielded += 1
                if max_frames and frames_yielded >= max_frames:
                    break

            curr_frame += 1

        cap.release()

    def slice_clip_for_wagon(
        self,
        schedule: WagonScheduleItem,
        output_dir: str | Path = "data/clips",
    ) -> Path:
        """Slices video segment corresponding to wagon schedule."""
        out_dir = Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        clip_path = out_dir / f"{schedule.wagon_id}_session.mp4"

        # Calculate frame boundaries
        start_sec = max(0.0, (schedule.start_time_utc - self.start_time_utc).total_seconds())
        end_sec = (schedule.end_time_utc - self.start_time_utc).total_seconds()
        start_frame = int(start_sec * self.fps)
        end_frame = int(end_sec * self.fps)

        cap = cv2.VideoCapture(str(self.video_path))
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(str(clip_path), fourcc, self.fps, (self.width, self.height))

        curr = start_frame
        while cap.isOpened() and curr <= end_frame:
            ret, frame = cap.read()
            if not ret or frame is None:
                break
            writer.write(frame)
            curr += 1

        cap.release()
        writer.release()
        return clip_path
