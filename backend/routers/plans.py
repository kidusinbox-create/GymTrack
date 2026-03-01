from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Exercise, WorkoutPlan, PlanExercise
from schemas import WorkoutPlanCreate, WorkoutPlanOut, WorkoutPlanUpdate, PlanExerciseOut

router = APIRouter(prefix="/plans", tags=["plans"])


def _resolve_exercise(name: str, db: Session) -> Exercise:
    """Return an existing exercise by name (case-insensitive) or create it."""
    ex = db.query(Exercise).filter(
        Exercise.name.ilike(name.strip())
    ).first()
    if not ex:
        ex = Exercise(name=name.strip())
        ex.muscle_groups = []
        db.add(ex)
        db.flush()   # get the id without committing
    return ex


def _plan_out(plan: WorkoutPlan) -> WorkoutPlanOut:
    exercises = [
        PlanExerciseOut(
            id=pe.id,
            exercise_id=pe.exercise_id,
            exercise_name=pe.exercise.name,
            sort_order=pe.sort_order,
        )
        for pe in plan.exercises
    ]
    return WorkoutPlanOut(
        id=plan.id,
        name=plan.name,
        created_at=plan.created_at,
        exercises=exercises,
    )


@router.get("", response_model=List[WorkoutPlanOut])
def list_plans(db: Session = Depends(get_db)):
    plans = db.query(WorkoutPlan).order_by(WorkoutPlan.name).all()
    return [_plan_out(p) for p in plans]


@router.get("/{plan_id}", response_model=WorkoutPlanOut)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(404, "Plan not found")
    return _plan_out(plan)


@router.post("", response_model=WorkoutPlanOut, status_code=201)
def create_plan(body: WorkoutPlanCreate, db: Session = Depends(get_db)):
    plan = WorkoutPlan(name=body.name)
    db.add(plan)
    db.flush()

    for i, ex_in in enumerate(body.exercises):
        ex = _resolve_exercise(ex_in.exercise_name, db)
        db.add(PlanExercise(plan_id=plan.id, exercise_id=ex.id, sort_order=i))

    db.commit()
    db.refresh(plan)
    return _plan_out(plan)


@router.put("/{plan_id}", response_model=WorkoutPlanOut)
def update_plan(plan_id: int, body: WorkoutPlanUpdate, db: Session = Depends(get_db)):
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(404, "Plan not found")

    if body.name is not None:
        plan.name = body.name

    if body.exercises is not None:
        # Delete existing and rebuild from scratch
        for pe in plan.exercises:
            db.delete(pe)
        db.flush()
        for i, ex_in in enumerate(body.exercises):
            ex = _resolve_exercise(ex_in.exercise_name, db)
            db.add(PlanExercise(plan_id=plan.id, exercise_id=ex.id, sort_order=i))

    db.commit()
    db.refresh(plan)
    return _plan_out(plan)


@router.delete("/{plan_id}", status_code=204)
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(404, "Plan not found")
    db.delete(plan)
    db.commit()
