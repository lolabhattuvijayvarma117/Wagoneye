"""Tests for WagonEye FastAPI application in mock mode."""

import pytest
from fastapi.testclient import TestClient
from wagoneye.api.app import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["mock_mode"] is True
    assert "version" in data
    assert "timestamp" in data


def test_list_wagons(client):
    res = client.get("/wagons")
    assert res.status_code == 200
    wagons = res.json()
    assert isinstance(wagons, list)
    assert len(wagons) >= 5
    first = wagons[0]
    assert "wagon_id" in first
    assert "train_id" in first
    assert "status" in first
    assert "bags_loaded" in first
    assert "bags_unloaded" in first
    assert "last_updated" in first
    assert first["wagon_id"].startswith("WGN-")


def test_get_wagon_header_success(client):
    res = client.get("/wagons/WGN-4471")
    assert res.status_code == 200
    header = res.json()
    assert header["wagon_id"] == "WGN-4471"
    assert "train_id" in header
    assert "arrival" in header
    assert "status" in header
    assert header["total_loaded"] >= 0


def test_get_wagon_header_not_found(client):
    res = client.get("/wagons/NON-EXISTENT")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_get_wagon_events(client):
    res = client.get("/wagons/WGN-4471/events")
    assert res.status_code == 200
    events = res.json()
    assert isinstance(events, list)
    assert len(events) > 0
    ev = events[0]
    assert ev["wagon_id"] == "WGN-4471"
    assert ev["direction"] in ("loaded", "unloaded")
    assert 0.5 <= ev["confidence"] <= 1.0
    assert "door_id" in ev


def test_get_wagon_events_filtering(client):
    res_loaded = client.get("/wagons/WGN-4471/events?type=loaded")
    assert res_loaded.status_code == 200
    for ev in res_loaded.json():
        assert ev["direction"] == "loaded"


def test_get_wagon_cumulative(client):
    res = client.get("/wagons/WGN-4471/cumulative")
    assert res.status_code == 200
    cum = res.json()
    assert cum["wagon_id"] == "WGN-4471"
    points = cum["points"]
    assert len(points) >= 2
    assert points[0]["bags_loaded"] == 0
    assert points[-1]["bags_loaded"] >= points[0]["bags_loaded"]


def test_get_dashboard_summary(client):
    res = client.get("/summary")
    assert res.status_code == 200
    summary = res.json()
    assert summary["bags_loaded_today"] > 0
    assert summary["bags_unloaded_today"] > 0
    assert summary["active_wagons"] > 0
    assert summary["detection_accuracy"] >= 95.0
    assert len(summary["daily_series"]) == 7


def test_get_recent_activity(client):
    res = client.get("/activity/recent?limit=5")
    assert res.status_code == 200
    activities = res.json()
    assert isinstance(activities, list)
    assert len(activities) <= 5
    assert len(activities) > 0
    first = activities[0]
    assert "event_id" in first
    assert "wagon_id" in first
    assert "direction" in first
    assert "confidence" in first


def test_list_and_get_reports(client):
    res = client.get("/reports")
    assert res.status_code == 200
    reports = res.json()
    assert len(reports) >= 3
    rep_id = reports[0]["id"]

    res_single = client.get(f"/reports/{rep_id}")
    assert res_single.status_code == 200
    rep = res_single.json()
    assert rep["id"] == rep_id
    assert "summary" in rep
    assert "full_text" in rep
    assert "metrics" in rep


def test_openapi_documentation(client):
    res = client.get("/openapi.json")
    assert res.status_code == 200
    spec = res.json()
    assert spec["info"]["title"] == "WagonEye API"
    paths = spec["paths"]
    assert "/health" in paths
    assert "/wagons" in paths
    assert "/wagons/{wagon_id}" in paths
    assert "/wagons/{wagon_id}/events" in paths
    assert "/wagons/{wagon_id}/cumulative" in paths
    assert "/summary" in paths
    assert "/activity/recent" in paths
    assert "/reports" in paths
    assert "/reports/{id}" in paths
