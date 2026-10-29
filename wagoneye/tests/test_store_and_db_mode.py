"""Unit and integration tests for SQLAlchemy store layer and DB-backed API mode."""

import os
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from wagoneye.api.app import app, db_repo
from wagoneye.mock.generator import MockDataStore
from wagoneye.store.database import Base
from wagoneye.store.repository import DatabaseRepository


@pytest.fixture
def in_memory_repo():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    repo = DatabaseRepository(session_factory=session_factory)
    return repo


def test_repository_upsert_and_event(in_memory_repo):
    now = datetime(2026, 10, 28, 12, 0, 0, tzinfo=timezone.utc)
    w = in_memory_repo.upsert_wagon(
        wagon_id="WGN-9999",
        train_id="TR-8888",
        status="loading",
        arrival=now,
        bags_loaded=10,
        bags_unloaded=0,
    )
    assert w.wagon_id == "WGN-9999"

    # Add crossing event
    ev = in_memory_repo.add_crossing_event(
        event_id="EV-TEST-1",
        wagon_id="WGN-9999",
        door_id="DOOR-A",
        track_id=42,
        direction="loaded",
        timestamp=now,
        confidence=0.96,
        box=(10, 20, 30, 40),
    )
    assert ev.event_id == "EV-TEST-1"

    # Query back
    header = in_memory_repo.get_wagon_header("WGN-9999")
    assert header is not None
    assert header.wagon_id == "WGN-9999"
    # Bags loaded increased by 1 via crossing event
    assert header.total_loaded == 11

    events = in_memory_repo.get_wagon_events("WGN-9999")
    assert len(events) == 1
    assert events[0].direction == "loaded"
    assert events[0].confidence == 0.96


def test_db_backed_api_mode(monkeypatch):
    # Seed mock data into real database repo
    mock = MockDataStore(seed=42)
    db_repo.seed_from_mock_store(mock)

    # Switch to DB mode (MOCK_MODE=false)
    monkeypatch.setenv("MOCK_MODE", "false")

    client = TestClient(app)

    # Health check should reflect mock_mode=False
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["mock_mode"] is False

    # Wagons should be served from DB
    res_wagons = client.get("/wagons")
    assert res_wagons.status_code == 200
    wagons = res_wagons.json()
    assert len(wagons) >= 10
    assert any(w["wagon_id"] == "WGN-4471" for w in wagons)

    # Detail header
    res_header = client.get("/wagons/WGN-4471")
    assert res_header.status_code == 200
    assert res_header.json()["wagon_id"] == "WGN-4471"

    # Events from DB
    res_events = client.get("/wagons/WGN-4471/events")
    assert res_events.status_code == 200
    assert len(res_events.json()) > 0

    # Summary
    res_summary = client.get("/summary")
    assert res_summary.status_code == 200
    assert res_summary.json()["active_wagons"] > 0

    # Reports
    res_reports = client.get("/reports")
    assert res_reports.status_code == 200
    assert len(res_reports.json()) >= 3
