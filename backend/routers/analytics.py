"""
Analytics endpoints:
  GET /analytics/volume          → per-session volume by exercise
  GET /analytics/efficiency      → sigmoid 0-1 effort rating per session date
  GET /analytics/muscles         → muscle activation (last N days)
"""

import math
from collections import defaultdict
from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models import Exercise, Session, SessionSet
from schemas import EfficiencyPoint, MuscleActivation, VolumePoint

router = APIRouter(prefix="/analytics", tags=["analytics"])

K         = 0.0006   # sigmoid steepness
MIDPOINT  = 5000     # volume (lbs) at which rating == 0.5


def _sigmoid(volume: float) -> float:
    return 1.0 / (1.0 + math.exp(-K * (volume - MIDPOINT)))


# ── /analytics/volume ────────────────────────────────────────────────────────

@router.get("/volume", response_model=List[VolumePoint])
def volume_history(
    exercise_id: Optional[int] = None,
    days: int = 90,
    db: DBSession = Depends(get_db),
):
    """
    Returns one row per (date, exercise) aggregated across sets.
    """
    cutoff = date.today() - timedelta(days=days)

    q = (
        db.query(Session, SessionSet, Exercise)
        .join(SessionSet, SessionSet.session_id == Session.id)
        .join(Exercise,  Exercise.id == SessionSet.exercise_id)
        .filter(Session.date >= cutoff)
    )
    if exercise_id:
        q = q.filter(SessionSet.exercise_id == exercise_id)

    rows = q.order_by(Session.date).all()

    # Aggregate by (date, exercise)
    agg: dict = defaultdict(lambda: {"volume": 0.0, "reps": 0, "sets": 0, "weight": 0.0, "count": 0})
    for session, s_set, ex in rows:
        key = (session.date, ex.id, ex.name)
        agg[key]["volume"] += s_set.volume
        agg[key]["reps"]   += s_set.reps
        agg[key]["sets"]   += 1
        agg[key]["weight"]  = max(agg[key]["weight"], s_set.weight_lbs)
        agg[key]["count"]  += 1

    return [
        VolumePoint(
            date=k[0],
            exercise_id=k[1],
            exercise_name=k[2],
            volume=round(v["volume"], 1),
            reps=v["reps"],
            weight_lbs=v["weight"],
            sets=v["sets"],
        )
        for k, v in sorted(agg.items(), key=lambda x: x[0][0])
    ]


# ── /analytics/efficiency ────────────────────────────────────────────────────

@router.get("/efficiency", response_model=List[EfficiencyPoint])
def efficiency_history(days: int = 90, db: DBSession = Depends(get_db)):
    """
    QB-style sigmoid effort rating (0-1) per session date.
    TV = Σ (reps × weight_lbs) per session.
    """
    cutoff = date.today() - timedelta(days=days)

    sessions = (
        db.query(Session)
        .filter(Session.date >= cutoff)
        .order_by(Session.date.desc())
        .all()
    )

    # Sum volume across all sets in each session
    by_date: dict = defaultdict(float)
    for session in sessions:
        total = sum(s.volume for s in session.sets)
        by_date[session.date] += total

    return [
        EfficiencyPoint(date=d, volume=round(v, 1), rating=round(_sigmoid(v), 4))
        for d, v in sorted(by_date.items(), key=lambda x: x[0], reverse=True)
    ]


# ── /analytics/muscles ───────────────────────────────────────────────────────

@router.get("/muscles", response_model=List[MuscleActivation])
def muscle_activation(days: int = 7, db: DBSession = Depends(get_db)):
    """
    Aggregated training volume per muscle group over the last N days.
    Intensity is normalised to the most-worked muscle = 1.0.
    """
    cutoff = date.today() - timedelta(days=days)

    rows = (
        db.query(SessionSet, Exercise)
        .join(Exercise, Exercise.id == SessionSet.exercise_id)
        .join(Session,  Session.id  == SessionSet.session_id)
        .filter(Session.date >= cutoff)
        .all()
    )

    muscle_vol: dict = defaultdict(float)
    for s_set, ex in rows:
        for muscle in ex.muscle_groups:
            muscle_vol[muscle] += s_set.volume

    if not muscle_vol:
        return []

    max_vol = max(muscle_vol.values())
    return [
        MuscleActivation(
            muscle=m,
            volume=round(v, 1),
            intensity=round(v / max_vol, 4),
        )
        for m, v in sorted(muscle_vol.items(), key=lambda x: x[1], reverse=True)
    ]
