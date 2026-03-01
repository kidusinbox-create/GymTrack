from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# SQLite file lives next to this module
DATABASE_URL = "sqlite:///./gymtrack.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},   # needed for SQLite + FastAPI
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# FastAPI dependency — yields a DB session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
