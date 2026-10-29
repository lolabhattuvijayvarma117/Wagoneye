"""SQLAlchemy database connection and session management."""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///wagoneye.db")

# Ensure sqlite directory exists if file path
if DATABASE_URL.startswith("sqlite:///"):
    db_file = DATABASE_URL.replace("sqlite:///", "")
    if db_file and not db_file.startswith(":memory:"):
        Path(db_file).parent.mkdir(parents=True, exist_ok=True)

# Connect args for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for obtaining database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
