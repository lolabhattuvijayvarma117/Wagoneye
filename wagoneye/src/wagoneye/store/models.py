"""SQLAlchemy ORM models for WagonEye."""

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from wagoneye.store.database import Base


class WagonModel(Base):
    __tablename__ = "wagons"

    wagon_id = Column(String(64), primary_key=True, index=True)
    train_id = Column(String(64), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="idle")
    arrival = Column(DateTime(timezone=True), nullable=False)
    departure = Column(DateTime(timezone=True), nullable=True)
    bags_loaded = Column(Integer, default=0, nullable=False)
    bags_unloaded = Column(Integer, default=0, nullable=False)
    last_updated = Column(DateTime(timezone=True), nullable=False)

    events = relationship("EventModel", back_populates="wagon", cascade="all, delete-orphan")


class EventModel(Base):
    __tablename__ = "events"

    event_id = Column(String(64), primary_key=True, index=True)
    wagon_id = Column(String(64), ForeignKey("wagons.wagon_id"), nullable=False, index=True)
    door_id = Column(String(64), nullable=False, index=True)
    track_id = Column(Integer, nullable=False, index=True)
    direction = Column(String(16), nullable=False)  # "loaded" or "unloaded"
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    frame_idx = Column(Integer, nullable=True)
    box_x1 = Column(Float, nullable=True)
    box_y1 = Column(Float, nullable=True)
    box_x2 = Column(Float, nullable=True)
    box_y2 = Column(Float, nullable=True)
    clip_ref = Column(String(256), nullable=True)
    thumbnail_path = Column(String(256), nullable=True)
    was_lost = Column(Boolean, default=False, nullable=False)

    wagon = relationship("WagonModel", back_populates="events")


class ReportModel(Base):
    __tablename__ = "reports"

    report_id = Column(String(64), primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    report_type = Column(String(64), nullable=False)
    date = Column(String(32), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    full_text = Column(Text, nullable=False)
    wagon_id = Column(String(64), nullable=True, index=True)
    metrics_json = Column(Text, default="{}")
    chart_data_json = Column(Text, default="[]")
