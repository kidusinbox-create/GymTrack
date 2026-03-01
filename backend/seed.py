"""
Seed the database with exercises and three starter workout plans.
Run once: python seed.py
"""

from database import SessionLocal, engine
from models import Base, Exercise, WorkoutPlan, PlanExercise

EXERCISES = [
    ("Bench Press",         ["chest", "triceps", "front_delts"]),
    ("Squat",               ["quads", "glutes", "hamstrings"]),
    ("Deadlift",            ["hamstrings", "glutes", "lower_back", "traps"]),
    ("Pull-up",             ["lats", "biceps", "rear_delts"]),
    ("Overhead Press",      ["front_delts", "triceps", "traps"]),
    ("Barbell Row",         ["lats", "rear_delts", "biceps", "traps"]),
    ("Incline Bench Press", ["chest", "front_delts", "triceps"]),
    ("Romanian Deadlift",   ["hamstrings", "glutes", "lower_back"]),
    ("Lateral Raise",       ["side_delts"]),
    ("Bicep Curl",          ["biceps"]),
    ("Tricep Pushdown",     ["triceps"]),
    ("Leg Press",           ["quads", "glutes"]),
    ("Dumbbell Fly",        ["chest"]),
    ("Face Pull",           ["rear_delts", "traps"]),
    ("Hip Thrust",          ["glutes", "hamstrings"]),
]

PLANS = [
    ("Push Day A",  ["Bench Press", "Incline Bench Press", "Overhead Press", "Lateral Raise", "Tricep Pushdown"]),
    ("Pull Day A",  ["Barbell Row", "Pull-up", "Deadlift", "Bicep Curl", "Face Pull"]),
    ("Leg Day A",   ["Squat", "Romanian Deadlift", "Leg Press", "Hip Thrust"]),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(Exercise).count() > 0:
            print("Database already seeded — skipping.")
            return

        # Insert exercises
        ex_map = {}
        for name, muscles in EXERCISES:
            ex = Exercise(name=name)
            ex.muscle_groups = muscles
            db.add(ex)
            db.flush()
            ex_map[name] = ex.id

        # Insert plans
        for plan_name, exercise_names in PLANS:
            plan = WorkoutPlan(name=plan_name)
            db.add(plan)
            db.flush()
            for i, ex_name in enumerate(exercise_names):
                db.add(PlanExercise(
                    plan_id=plan.id,
                    exercise_id=ex_map[ex_name],
                    sort_order=i,
                ))

        db.commit()
        print(f"Seeded {len(EXERCISES)} exercises and {len(PLANS)} plans.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
