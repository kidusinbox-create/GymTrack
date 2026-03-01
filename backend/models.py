"""
SQLAlchemy ORM models.

Schema
------
exercises          id | name | muscle_groups (JSON) | created_at
workout_plans      id | name | created_at
plan_exercises     id | plan_id → workout_plans | exercise_id → exercises
                      | sort_order
sessions           id | date | plan_id → workout_plans | notes | created_at
session_sets       id | session_id → sessions | exercise_id → exercises
                      | set_number | reps | weight_lbs
"""

import json
from datetime import date, datetime
from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime,
    ForeignKey, Text, func,
)
from sqlalchemy.orm import relationship
from database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(120), unique=True, nullable=False)
    _muscle_groups = Column("muscle_groups", Text, default="[]")  # JSON list
    created_at    = Column(DateTime, default=func.now())

    plan_exercises  = relationship("PlanExercise",  back_populates="exercise")
    session_sets    = relationship("SessionSet",    back_populates="exercise")

    @property
    def muscle_groups(self):
        return json.loads(self._muscle_groups or "[]")

    @muscle_groups.setter
    def muscle_groups(self, value):
        self._muscle_groups = json.dumps(value)


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(120), nullable=False)
    created_at = Column(DateTime, default=func.now())

    exercises  = relationship(
        "PlanExercise", back_populates="plan",
        order_by="PlanExercise.sort_order", cascade="all, delete-orphan",
    )
    sessions   = relationship("Session", back_populates="plan")


class PlanExercise(Base):
    """Ordered list of exercises belonging to a workout plan."""
    __tablename__ = "plan_exercises"

    id          = Column(Integer, primary_key=True, index=True)
    plan_id     = Column(Integer, ForeignKey("workout_plans.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"),     nullable=False)
    sort_order  = Column(Integer, default=0)

    plan     = relationship("WorkoutPlan", back_populates="exercises")
    exercise = relationship("Exercise",    back_populates="plan_exercises")


class Session(Base):
    """A single completed workout session."""
    __tablename__ = "sessions"

    id         = Column(Integer, primary_key=True, index=True)
    date       = Column(Date,    nullable=False, default=date.today)
    plan_id    = Column(Integer, ForeignKey("workout_plans.id"), nullable=True)
    notes      = Column(Text,    default="")
    created_at = Column(DateTime, default=func.now())

    plan = relationship("WorkoutPlan", back_populates="sessions")
    sets = relationship(
        "SessionSet", back_populates="session",
        order_by="SessionSet.set_number", cascade="all, delete-orphan",
    )


class SessionSet(Base):
    """One logged exercise set within a session."""
    __tablename__ = "session_sets"

    id          = Column(Integer, primary_key=True, index=True)
    session_id  = Column(Integer, ForeignKey("sessions.id"),   nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"),  nullable=False)
    set_number  = Column(Integer, nullable=False, default=1)
    reps        = Column(Integer, nullable=False, default=0)
    weight_lbs  = Column(Float,   nullable=False, default=0.0)

    session  = relationship("Session",  back_populates="sets")
    exercise = relationship("Exercise", back_populates="session_sets")

    @property
    def volume(self) -> float:
        """Training volume = reps × weight (sets counted by set_number)."""
        return self.reps * self.weight_lbs
