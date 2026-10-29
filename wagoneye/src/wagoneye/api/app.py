"""FastAPI application for WagonEye with Mock and SQLite/Postgres DB backend support."""

import os
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from wagoneye.api.schemas import (
    CumulativeResponse,
    DashboardSummary,
    HealthResponse,
    ReportDetail,
    ReportItem,
    WagonDetailHeader,
    WagonEvent,
    WagonSummaryItem,
)
from wagoneye.mock.generator import MockDataStore
from wagoneye.store.database import SessionLocal
from wagoneye.store.repository import DatabaseRepository

app = FastAPI(
    title="WagonEye API",
    description="Computer-Vision Port Logistics & Train Wagon Bag Counting API",
    version="0.1.0",
)

# Enable CORS for React dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data sources
mock_store = MockDataStore(seed=42)
db_repo = DatabaseRepository(session_factory=SessionLocal)


def is_mock_mode_enabled() -> bool:
    return os.getenv("MOCK_MODE", "true").lower() in ("true", "1", "yes")


def get_data_source():
    """Retrieve active data store (mock or database repository)."""
    if is_mock_mode_enabled():
        return mock_store
    return db_repo


@app.get("/health", response_model=HealthResponse, tags=["System"])
def get_health():
    """System health check and mode indicator."""
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(timezone.utc).isoformat(),
        mock_mode=is_mock_mode_enabled(),
        version="0.1.0",
    )


@app.get("/wagons", response_model=List[WagonSummaryItem], tags=["Wagons"])
def list_wagons(date: Optional[str] = Query(None, description="Filter wagons by date (YYYY-MM-DD)")):
    """List wagons with train ID, status, bag counts, and last updated timestamp."""
    source = get_data_source()
    return source.list_wagons(date=date)


@app.get("/wagons/{wagon_id}", response_model=WagonDetailHeader, tags=["Wagons"])
def get_wagon_header(wagon_id: str):
    """Retrieve header metadata and summary counts for a specific wagon."""
    source = get_data_source()
    header = source.get_wagon_header(wagon_id=wagon_id)
    if not header:
        raise HTTPException(status_code=404, detail=f"Wagon '{wagon_id}' not found")
    return header


@app.get("/wagons/{wagon_id}/events", response_model=List[WagonEvent], tags=["Wagons"])
def get_wagon_events(
    wagon_id: str,
    type: Optional[str] = Query(None, alias="type", description="Event type: loaded or unloaded"),
    from_time: Optional[str] = Query(None, alias="from", description="ISO start timestamp"),
    to_time: Optional[str] = Query(None, alias="to", description="ISO end timestamp"),
):
    """Get the event timeline for a wagon with confidence scores and thumbnail URLs."""
    source = get_data_source()
    events = source.get_wagon_events(
        wagon_id=wagon_id,
        event_type=type,
        from_time=from_time,
        to_time=to_time,
    )
    return events


@app.get("/wagons/{wagon_id}/cumulative", response_model=CumulativeResponse, tags=["Wagons"])
def get_wagon_cumulative(wagon_id: str):
    """Get running loaded vs unloaded cumulative bag counts over the wagon session."""
    source = get_data_source()
    series = source.get_wagon_cumulative(wagon_id=wagon_id)
    if not series:
        raise HTTPException(status_code=404, detail=f"Wagon '{wagon_id}' not found")
    return series


@app.get("/summary", response_model=DashboardSummary, tags=["Dashboard"])
def get_summary(date: Optional[str] = Query(None, description="Date for summary (YYYY-MM-DD)")):
    """Get top-level dashboard metrics (loaded today, unloaded today, active wagons, accuracy, 7-day series)."""
    source = get_data_source()
    return source.get_summary(date=date)


@app.get("/activity/recent", response_model=List[WagonEvent], tags=["Dashboard"])
def get_recent_activity(
    limit: int = Query(15, ge=1, le=100, description="Maximum number of detection events to return")
):
    """Live activity feed of the latest bag detection and crossing events."""
    source = get_data_source()
    return source.get_recent_activity(limit=limit)


@app.get("/reports", response_model=List[ReportItem], tags=["Reports"])
def list_reports(
    from_date: Optional[str] = Query(None, alias="from", description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, alias="to", description="End date (YYYY-MM-DD)"),
    wagon: Optional[str] = Query(None, description="Filter by wagon ID"),
):
    """List generated operational and incident reports with AI summary previews."""
    source = get_data_source()
    return source.list_reports(from_date=from_date, to_date=to_date, wagon_id=wagon)


@app.get("/reports/{id}", response_model=ReportDetail, tags=["Reports"])
def get_report(id: str):
    """Get full details, metrics, and chart series for a specific report."""
    source = get_data_source()
    report = source.get_report(report_id=id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Report '{id}' not found")
    return report
