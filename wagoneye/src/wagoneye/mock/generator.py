"""Deterministic realistic mock data generator for WagonEye."""

from datetime import datetime, timedelta, timezone
import random
from typing import Any, Dict, List, Optional
from wagoneye.api.schemas import (
    CumulativePoint,
    CumulativeResponse,
    DailyActivityPoint,
    DashboardSummary,
    ReportDetail,
    ReportItem,
    WagonDetailHeader,
    WagonEvent,
    WagonSummaryItem,
)


class MockDataStore:
    def __init__(self, seed: int = 42, base_time: Optional[datetime] = None):
        self.rng = random.Random(seed)
        self.base_time = base_time or datetime(2026, 10, 28, 14, 0, 0, tzinfo=timezone.utc)
        self.wagons: Dict[str, Dict[str, Any]] = {}
        self.events: List[WagonEvent] = []
        self.reports: List[ReportDetail] = []
        self._generate_dataset()

    def _generate_dataset(self):
        train_ids = ["TR-2210", "TR-1022", "TR-3301", "TR-4412"]
        wagon_numbers = [
            "WGN-4471",
            "WGN-1102",
            "WGN-7782",
            "WGN-3391",
            "WGN-8840",
            "WGN-5519",
            "WGN-9023",
            "WGN-6214",
            "WGN-2198",
            "WGN-7011",
        ]

        # 7 days of dates up to base_time
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        self.daily_activity: List[DailyActivityPoint] = []
        for i in range(6, -1, -1):
            dt = self.base_time - timedelta(days=i)
            # deterministic daily counts
            loaded = self.rng.randint(2200, 4800)
            unloaded = self.rng.randint(1800, 3900)
            day_name = day_names[dt.weekday()]
            self.daily_activity.append(
                DailyActivityPoint(
                    name=day_name,
                    date=dt.strftime("%Y-%m-%d"),
                    loaded=loaded,
                    unloaded=unloaded,
                )
            )

        # Generate wagons
        event_counter = 1
        for idx, w_id in enumerate(wagon_numbers):
            t_id = train_ids[idx % len(train_ids)]
            # Active vs completed
            if idx < 4:
                status = "loading" if idx % 2 == 0 else "unloading"
                arrival_dt = self.base_time - timedelta(hours=self.rng.randint(1, 3))
                departure_dt = None
            elif idx < 8:
                status = "completed"
                arrival_dt = self.base_time - timedelta(days=self.rng.randint(1, 4))
                departure_dt = arrival_dt + timedelta(hours=self.rng.randint(2, 4))
            else:
                status = "idle"
                arrival_dt = self.base_time - timedelta(hours=self.rng.randint(4, 8))
                departure_dt = None

            bag_count = self.rng.randint(60, 400)
            loaded_count = bag_count if status in ("loading", "completed") and idx % 2 == 0 else 0
            unloaded_count = bag_count if status in ("unloading", "completed") and idx % 2 != 0 else 0
            if status == "idle":
                loaded_count = 0
                unloaded_count = 0

            last_updated = (
                self.base_time - timedelta(minutes=self.rng.randint(1, 15))
                if status in ("loading", "unloading")
                else (departure_dt or arrival_dt)
            )

            self.wagons[w_id] = {
                "wagon_id": w_id,
                "train_id": t_id,
                "status": status,
                "bags_loaded": loaded_count,
                "bags_unloaded": unloaded_count,
                "arrival": arrival_dt.isoformat(),
                "departure": departure_dt.isoformat() if departure_dt else None,
                "last_updated": last_updated.isoformat(),
                "events": [],
            }

            # Generate individual events for active or completed wagons
            total_events = min(loaded_count + unloaded_count, 45)  # sample sequence
            direction = "loaded" if loaded_count > 0 else "unloaded"
            door_id = f"DOOR-{w_id}-A"

            step_dt = arrival_dt + timedelta(minutes=10)
            w_events = []
            for ev_i in range(total_events):
                step_dt += timedelta(seconds=self.rng.randint(8, 45))
                # Realistic confidence between 0.55 and 0.98
                conf = round(self.rng.uniform(0.55, 0.98), 3)
                ev = WagonEvent(
                    event_id=f"EV-{event_counter:05d}",
                    wagon_id=w_id,
                    door_id=door_id,
                    track_id=100 + ev_i,
                    direction=direction,
                    timestamp=step_dt.isoformat(),
                    confidence=conf,
                    thumbnail_url=f"/api/v1/thumbnails/{w_id}_ev_{ev_i}.jpg",
                    clip_ref=f"clips/{w_id}_session.mp4",
                )
                event_counter += 1
                w_events.append(ev)
                self.events.append(ev)

            self.wagons[w_id]["events"] = w_events

        # Sort all events chronologically descending for feed
        self.events.sort(key=lambda x: x.timestamp, reverse=True)

        # Generate realistic reports
        self.reports = [
            ReportDetail(
                id="REP-001",
                title="Daily Shift Summary: Berth 3 Morning Operations",
                report_type="shift_summary",
                date=self.base_time.strftime("%Y-%m-%d"),
                summary="Operations proceeded smoothly across Berth 3. High throughput with 99.8% computer-vision detection confidence.",
                full_text="Berth 3 Train Siding East handled train TR-2210 carrying grain sacks. Total 12,403 bags loaded and 8,234 unloaded across active wagons. Camera CAM-PORT-DOCK-04 maintained continuous 25fps feed with zero dropped frames. Anomaly detection flagged 4 occluded bags on WGN-4471 door A which were verified within 3 minutes.",
                wagon_id=None,
                metrics={
                    "total_bags": 20637,
                    "active_wagons": 4,
                    "avg_confidence": 0.982,
                    "review_queue_items": 4,
                },
                chart_data=[
                    {"hour": "08:00", "count": 2800},
                    {"hour": "10:00", "count": 3400},
                    {"hour": "12:00", "count": 3100},
                    {"hour": "14:00", "count": 3103},
                ],
            ),
            ReportDetail(
                id="REP-002",
                title="Wagon WGN-3391 Unloading Discrepancy Review",
                report_type="incident",
                date=(self.base_time - timedelta(days=1)).strftime("%Y-%m-%d"),
                summary="Manifest count showed 240 bags; vision counter recorded 238 bags due to tandem conveyor stacking.",
                full_text="During rapid conveyor offloading from Wagon WGN-3391 (Train TR-1022), two bags were positioned overlapping in the vertical plane. The occlusion buffer tracked continuity correctly for 238 items. 2 events were assigned confidence < 0.60 and routed to CVAT review queue for operator validation.",
                wagon_id="WGN-3391",
                metrics={
                    "manifest_count": 240,
                    "vision_count": 238,
                    "error_pct": 0.83,
                    "low_confidence_events": 2,
                },
                chart_data=[
                    {"time": "14:00", "cumulative": 60},
                    {"time": "14:30", "cumulative": 140},
                    {"time": "15:00", "cumulative": 210},
                    {"time": "15:30", "cumulative": 238},
                ],
            ),
            ReportDetail(
                id="REP-003",
                title="Weekly Throughput & Accuracy Audit",
                report_type="weekly",
                date=(self.base_time - timedelta(days=3)).strftime("%Y-%m-%d"),
                summary="Weekly bag volume rose by 14% to 84,200 units with an overall mean absolute error (MAE) of 1.4 bags/wagon.",
                full_text="Weekly audit compared 42 wagon manifests against WagonEye automated counts. Direction classification accuracy achieved 100.0%. Mean Absolute Error was 1.41 bags per wagon, outperforming the operational target of <= 3.0 bags per wagon.",
                wagon_id=None,
                metrics={
                    "weekly_bags": 84200,
                    "wagons_processed": 42,
                    "mae": 1.41,
                    "direction_accuracy_pct": 100.0,
                },
                chart_data=[
                    {"day": "Mon", "bags": 11200},
                    {"day": "Tue", "bags": 12800},
                    {"day": "Wed", "bags": 13400},
                    {"day": "Thu", "bags": 14100},
                    {"day": "Fri", "bags": 12900},
                    {"day": "Sat", "bags": 10500},
                    {"day": "Sun", "bags": 9300},
                ],
            ),
        ]

    def get_summary(self, date: Optional[str] = None) -> DashboardSummary:
        # Sum bags for today or last day in daily series
        today_data = self.daily_activity[-1]
        active_count = sum(
            1 for w in self.wagons.values() if w["status"] in ("loading", "unloading")
        )
        return DashboardSummary(
            bags_loaded_today=today_data.loaded,
            bags_unloaded_today=today_data.unloaded,
            active_wagons=active_count,
            detection_accuracy=99.8,
            loaded_trend_pct=14.2,
            unloaded_trend_pct=-2.1,
            daily_series=self.daily_activity,
        )

    def list_wagons(self, date: Optional[str] = None) -> List[WagonSummaryItem]:
        res = []
        for w in self.wagons.values():
            res.append(
                WagonSummaryItem(
                    wagon_id=w["wagon_id"],
                    train_id=w["train_id"],
                    status=w["status"],
                    bags_loaded=w["bags_loaded"],
                    bags_unloaded=w["bags_unloaded"],
                    last_updated=w["last_updated"],
                )
            )
        return res

    def get_wagon_header(self, wagon_id: str) -> Optional[WagonDetailHeader]:
        w = self.wagons.get(wagon_id)
        if not w:
            return None
        return WagonDetailHeader(
            wagon_id=w["wagon_id"],
            train_id=w["train_id"],
            arrival=w["arrival"],
            departure=w["departure"],
            status=w["status"],
            total_loaded=w["bags_loaded"],
            total_unloaded=w["bags_unloaded"],
        )

    def get_wagon_events(
        self,
        wagon_id: str,
        event_type: Optional[str] = None,
        from_time: Optional[str] = None,
        to_time: Optional[str] = None,
    ) -> List[WagonEvent]:
        w = self.wagons.get(wagon_id)
        if not w:
            return []
        events: List[WagonEvent] = w["events"]
        filtered = []
        for ev in events:
            if event_type and ev.direction.lower() != event_type.lower():
                continue
            if from_time and ev.timestamp < from_time:
                continue
            if to_time and ev.timestamp > to_time:
                continue
            filtered.append(ev)
        return filtered

    def get_wagon_cumulative(self, wagon_id: str) -> Optional[CumulativeResponse]:
        w = self.wagons.get(wagon_id)
        if not w:
            return None
        events: List[WagonEvent] = list(reversed(w["events"]))  # chronological
        points: List[CumulativePoint] = []
        c_loaded = 0
        c_unloaded = 0

        # Start with 0 at arrival
        points.append(
            CumulativePoint(
                timestamp=w["arrival"],
                bags_loaded=0,
                bags_unloaded=0,
                net_bags=0,
            )
        )

        for ev in events:
            if ev.direction == "loaded":
                c_loaded += 1
            else:
                c_unloaded += 1
            points.append(
                CumulativePoint(
                    timestamp=ev.timestamp,
                    bags_loaded=c_loaded,
                    bags_unloaded=c_unloaded,
                    net_bags=c_loaded - c_unloaded,
                )
            )
        return CumulativeResponse(wagon_id=wagon_id, points=points)

    def get_recent_activity(self, limit: int = 15) -> List[WagonEvent]:
        return self.events[:limit]

    def list_reports(
        self,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        wagon_id: Optional[str] = None,
    ) -> List[ReportItem]:
        results = []
        for r in self.reports:
            if wagon_id and r.wagon_id and r.wagon_id != wagon_id:
                continue
            if from_date and r.date < from_date:
                continue
            if to_date and r.date > to_date:
                continue
            results.append(
                ReportItem(
                    id=r.id,
                    title=r.title,
                    report_type=r.report_type,
                    date=r.date,
                    summary=r.summary,
                    wagon_id=r.wagon_id,
                    key_metrics=r.metrics,
                )
            )
        return results

    def get_report(self, report_id: str) -> Optional[ReportDetail]:
        for r in self.reports:
            if r.id == report_id:
                return r
        return None
