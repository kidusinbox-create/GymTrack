from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from typing import List, Optional

from database import get_db
from models import Exercise, Session, SessionSet
from schemas import SessionCreate, SessionOut, SetOut

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _resolve_exercise(name: str, db: DBSession) -> Exercise:
    ex = db.query(Exercise).filter(Exercise.name.ilike(name.strip())).first()
    if not ex:
        ex = Exercise(name=name.strip())
        ex.muscle_groups = []
        db.add(ex)
        db.flush()
    return ex


def _session_out(session: Session) -> SessionOut:
    sets_out = [
        SetOut(
            id=s.id,
            exercise_id=s.exercise_id,
            exercise_name=s.exercise.name,
            set_number=s.set_number,
            reps=s.reps,
            weight_lbs=s.weight_lbs,
            volume=s.volume,
        )
        for s in session.sets
    ]
    total_volume = sum(s.volume for s in session.sets)
    return SessionOut(
        id=session.id,
        date=session.date,
        plan_id=session.plan_id,
        notes=session.notes,
        sets=sets_out,
        total_volume=total_volume,
    )


@router.get("", response_model=List[SessionOut])
def list_sessions(
    limit: int = 50,
    exercise_id: Optional[int] = None,
    db: DBSession = Depends(get_db),
):
    q = db.query(Session).order_by(Session.date.desc())
    if exercise_id:
        q = q.join(SessionSet).filter(SessionSet.exercise_id == exercise_id)
    return [_session_out(s) for s in q.limit(limit).all()]


@router.get("/{session_id}", response_model=SessionOut)
def get_session(session_id: int, db: DBSession = Depends(get_db)):
    s = db.query(Session).filter(Session.id == session_id).first()
    if not s:
        raise HTTPException(404, "Session not found")
    return _session_out(s)


@router.post("", response_model=SessionOut, status_code=201)
def log_session(body: SessionCreate, db: DBSession = Depends(get_db)):
    session = Session(
        date=body.date or date_type.today(),
        plan_id=body.plan_id,
        notes=body.notes,
    )
    db.add(session)
    db.flush()

    for set_in in body.sets:
        ex = _resolve_exercise(set_in.exercise_name, db)
        db.add(SessionSet(
            session_id=session.id,
            exercise_id=ex.id,
            set_number=set_in.set_number,
            reps=set_in.reps,
            weight_lbs=set_in.weight_lbs,
        ))

    db.commit()
    db.refresh(session)
    return _session_out(session)


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: int, db: DBSession = Depends(get_db)):
    s = db.query(Session).filter(Session.id == session_id).first()
    if not s:
        raise HTTPException(404, "Session not found")
    db.delete(s)
    db.commit()
