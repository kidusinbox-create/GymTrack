"""Pydantic request/response schemas."""

from __future__ import annotations
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ── Exercise ─────────────────────────────────────────────────────────────────

class ExerciseCreate(BaseModel):
    name: str
    muscle_groups: List[str] = []


class ExerciseOut(BaseModel):
    id: int
    name: str
    muscle_groups: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Workout Plan ─────────────────────────────────────────────────────────────

class PlanExerciseIn(BaseModel):
    exercise_name: str          # user types a name; backend resolves / creates it


class WorkoutPlanCreate(BaseModel):
    name: str
    exercises: List[PlanExerciseIn]


class WorkoutPlanUpdate(BaseModel):
    name: Optional[str] = None
    exercises: Optional[List[PlanExerciseIn]] = None


class PlanExerciseOut(BaseModel):
    id: int
    exercise_id: int
    exercise_name: str
    sort_order: int

    class Config:
        from_attributes = True


class WorkoutPlanOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    exercises: List[PlanExerciseOut]

    class Config:
        from_attributes = True


# ── Session ──────────────────────────────────────────────────────────────────

class SetIn(BaseModel):
    exercise_name: str
    set_number: int = 1
    reps: int       = Field(ge=0)
    weight_lbs: float = Field(ge=0)


class SessionCreate(BaseModel):
    date: Optional[date] = None   # defaults to today in router
    plan_id: Optional[int] = None
    notes: str = ""
    sets: List[SetIn]


class SetOut(BaseModel):
    id: int
    exercise_id: int
    exercise_name: str
    set_number: int
    reps: int
    weight_lbs: float
    volume: float

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id: int
    date: date
    plan_id: Optional[int]
    notes: str
    sets: List[SetOut]
    total_volume: float

    class Config:
        from_attributes = True


# ── Analytics ────────────────────────────────────────────────────────────────

class VolumePoint(BaseModel):
    date: date
    exercise_id: int
    exercise_name: str
    volume: float
    reps: int
    weight_lbs: float
    sets: int


class EfficiencyPoint(BaseModel):
    date: date
    volume: float
    rating: float       # sigmoid 0-1


class MuscleActivation(BaseModel):
    muscle: str
    volume: float
    intensity: float    # 0-1 relative to max in window
