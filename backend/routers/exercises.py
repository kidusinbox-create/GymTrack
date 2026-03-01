from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Exercise
from schemas import ExerciseCreate, ExerciseOut

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("", response_model=List[ExerciseOut])
def list_exercises(db: Session = Depends(get_db)):
    return db.query(Exercise).order_by(Exercise.name).all()


@router.get("/{exercise_id}", response_model=ExerciseOut)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(404, "Exercise not found")
    return ex


@router.post("", response_model=ExerciseOut, status_code=201)
def create_exercise(body: ExerciseCreate, db: Session = Depends(get_db)):
    ex = Exercise(name=body.name)
    ex.muscle_groups = body.muscle_groups
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return ex


@router.put("/{exercise_id}", response_model=ExerciseOut)
def update_exercise(exercise_id: int, body: ExerciseCreate, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(404, "Exercise not found")
    ex.name = body.name
    ex.muscle_groups = body.muscle_groups
    db.commit()
    db.refresh(ex)
    return ex


@router.delete("/{exercise_id}", status_code=204)
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    ex = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(404, "Exercise not found")
    db.delete(ex)
    db.commit()
