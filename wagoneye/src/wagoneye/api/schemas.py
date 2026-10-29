"""Pydantic v2 schemas for WagonEye FastAPI REST endpoints."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    timestamp: str
    mock_mode: bool
    version: str = "0.1.0"


class WagonSummaryItem(BaseModel):
    wagon_id: str
    train_id: str
    status: str = Field(description="Operational status: loading, unloading, completed, idle")
    bags_loaded: int = 0
    bags_unloaded: int = 0
    last_updated: str


class WagonDetailHeader(BaseModel):
    wagon_id: str
    train_id: str
    arrival: str
    departure: Optional[str] = None
    status: str
    total_loaded: int = 0
    total_unloaded: int = 0


class WagonEvent(BaseModel):
    event_id: str
    wagon_id: str
    door_id: str
    track_id: int
    direction: str = Field(description="Direction: loaded or unloaded")
    timestamp: str
    confidence: float
    thumbnail_url: Optional[str] = None
    clip_ref: Optional[str] = None


class CumulativePoint(BaseModel):
    timestamp: str
    bags_loaded: int
    bags_unloaded: int
    net_bags: int


class CumulativeResponse(BaseModel):
    wagon_id: str
    points: List[CumulativePoint]


class DailyActivityPoint(BaseModel):
    name: str  # e.g., 'Mon', 'Tue' or YYYY-MM-DD
    date: str  # YYYY-MM-DD
    loaded: int
    unloaded: int


class DashboardSummary(BaseModel):
    bags_loaded_today: int
    bags_unloaded_today: int
    active_wagons: int
    detection_accuracy: float
    loaded_trend_pct: float
    unloaded_trend_pct: float
    daily_series: List[DailyActivityPoint]


class ReportItem(BaseModel):
    id: str
    title: str
    report_type: str
    date: str
    summary: str
    wagon_id: Optional[str] = None
    key_metrics: Optional[Dict[str, Any]] = None


class ReportDetail(BaseModel):
    id: str
    title: str
    report_type: str
    date: str
    summary: str
    full_text: str
    wagon_id: Optional[str] = None
    metrics: Dict[str, Any] = Field(default_factory=dict)
    chart_data: Optional[List[Dict[str, Any]]] = None
