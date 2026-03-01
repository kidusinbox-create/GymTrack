"""
GymTrack API — FastAPI + SQLite backend.

Start:  uvicorn main:app --reload --port 8000
Docs:   http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base
from routers import exercises, plans, sessions, analytics
from seed import seed

# Create all tables on startup (idempotent)
Base.metadata.create_all(bind=engine)
seed()   # no-op if data already exists

app = FastAPI(
    title="GymTrack API",
    description="Local training-volume tracker backend",
    version="0.2.0",
)

# Allow the Vite dev server (localhost:5173) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exercises.router)
app.include_router(plans.router)
app.include_router(sessions.router)
app.include_router(analytics.router)


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.2.0"}
