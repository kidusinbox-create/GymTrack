// Mock data — 24 weeks of generated history

export const EXERCISES = [
  { id: 1,  name: 'Bench Press',         muscle_groups: ['chest', 'triceps', 'front_delts'] },
  { id: 2,  name: 'Squat',               muscle_groups: ['quads', 'glutes', 'hamstrings'] },
  { id: 3,  name: 'Deadlift',            muscle_groups: ['hamstrings', 'glutes', 'lower_back', 'traps'] },
  { id: 4,  name: 'Pull-up',             muscle_groups: ['lats', 'biceps', 'rear_delts'] },
  { id: 5,  name: 'Overhead Press',      muscle_groups: ['front_delts', 'triceps', 'traps'] },
  { id: 6,  name: 'Barbell Row',         muscle_groups: ['lats', 'rear_delts', 'biceps', 'traps'] },
  { id: 7,  name: 'Incline Bench Press', muscle_groups: ['chest', 'front_delts', 'triceps'] },
  { id: 8,  name: 'Romanian Deadlift',   muscle_groups: ['hamstrings', 'glutes', 'lower_back'] },
  { id: 9,  name: 'Lateral Raise',       muscle_groups: ['side_delts'] },
  { id: 10, name: 'Bicep Curl',          muscle_groups: ['biceps'] },
  { id: 11, name: 'Tricep Pushdown',     muscle_groups: ['triceps'] },
  { id: 12, name: 'Leg Press',           muscle_groups: ['quads', 'glutes'] },
];

export const WORKOUT_PLANS = [
  {
    id: 1,
    name: 'Push Day A',
    exercises: [
      { exercise_id: 1,  sets: 4, reps: 8,  weight: 185, exercise_name: 'Bench Press' },
      { exercise_id: 7,  sets: 3, reps: 10, weight: 135, exercise_name: 'Incline Bench Press' },
      { exercise_id: 5,  sets: 3, reps: 10, weight: 115, exercise_name: 'Overhead Press' },
      { exercise_id: 9,  sets: 3, reps: 15, weight: 30,  exercise_name: 'Lateral Raise' },
      { exercise_id: 11, sets: 3, reps: 12, weight: 50,  exercise_name: 'Tricep Pushdown' },
    ],
  },
  {
    id: 2,
    name: 'Pull Day A',
    exercises: [
      { exercise_id: 6,  sets: 4, reps: 8,  weight: 155, exercise_name: 'Barbell Row' },
      { exercise_id: 4,  sets: 3, reps: 8,  weight: 0,   exercise_name: 'Pull-up' },
      { exercise_id: 3,  sets: 3, reps: 5,  weight: 225, exercise_name: 'Deadlift' },
      { exercise_id: 10, sets: 3, reps: 12, weight: 35,  exercise_name: 'Bicep Curl' },
    ],
  },
  {
    id: 3,
    name: 'Leg Day A',
    exercises: [
      { exercise_id: 2,  sets: 4, reps: 6,  weight: 225, exercise_name: 'Squat' },
      { exercise_id: 8,  sets: 3, reps: 10, weight: 175, exercise_name: 'Romanian Deadlift' },
      { exercise_id: 12, sets: 3, reps: 12, weight: 270, exercise_name: 'Leg Press' },
    ],
  },
];

// Generate 24 weeks of exercise history
const generateHistory = () => {
  const history = [];
  const today = new Date();
  const exercises = [
    { id: 1, name: 'Bench Press',    baseWeight: 165, sets: 4, reps: 8  },
    { id: 2, name: 'Squat',          baseWeight: 205, sets: 4, reps: 6  },
    { id: 3, name: 'Deadlift',       baseWeight: 205, sets: 3, reps: 5  },
    { id: 4, name: 'Pull-up',        baseWeight: 0,   sets: 3, reps: 7  },
    { id: 5, name: 'Overhead Press', baseWeight: 95,  sets: 3, reps: 10 },
  ];

  for (let week = 23; week >= 0; week--) {
    [1, 3, 5].forEach((dayOffset) => {
      const date = new Date(today);
      date.setDate(today.getDate() - week * 7 - (7 - dayOffset));
      if (date > today) return;

      const sessionExercises =
        week % 3 === 0 ? [exercises[0], exercises[4]] :
        week % 3 === 1 ? [exercises[3], exercises[2]] :
                         [exercises[1]];

      sessionExercises.forEach((ex) => {
        // Progressive overload over 24 weeks with some variation
        const progression = (24 - week) * 2.5;
        const variation  = (Math.sin(week * 1.3 + dayOffset) * 0.08 + 1); // ±8%
        const weight = (ex.baseWeight + progression) * variation;
        const sets   = ex.sets;
        const reps   = Math.round(ex.reps * (0.9 + Math.random() * 0.2));
        const volume = sets * reps * (weight || 1);
        history.push({
          date: date.toISOString().split('T')[0],
          exercise_id: ex.id,
          exercise_name: ex.name,
          sets,
          reps,
          weight_lbs: Math.round(weight * 2) / 2,
          volume: Math.round(volume),
        });
      });
    });
  }
  return history;
};

export const SESSION_HISTORY = generateHistory();

export const getExerciseHistory = (exerciseId) =>
  SESSION_HISTORY
    .filter((s) => s.exercise_id === exerciseId)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((s) => ({
      date: s.date,
      weight: s.weight_lbs,
      volume: s.volume,
      reps: s.reps,
      sets: s.sets,
    }));

export const getCalendarData = () => {
  const byDate = {};
  SESSION_HISTORY.forEach((s) => {
    byDate[s.date] = (byDate[s.date] || 0) + s.volume;
  });
  return byDate;
};

export const getEfficiencyData = () => {
  const byDate = {};
  SESSION_HISTORY.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = { date: s.date, volume: 0 };
    byDate[s.date].volume += s.volume;
  });
  return Object.values(byDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 24)
    .map((s) => ({
      ...s,
      label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
};

export const getMuscleData = () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const muscleVolume = {};
  SESSION_HISTORY
    .filter((s) => new Date(s.date) >= cutoff)
    .forEach((s) => {
      const ex = EXERCISES.find((e) => e.id === s.exercise_id);
      if (!ex) return;
      ex.muscle_groups.forEach((m) => {
        muscleVolume[m] = (muscleVolume[m] || 0) + s.volume;
      });
    });
  const max = Math.max(...Object.values(muscleVolume), 1);
  const normalized = {};
  Object.entries(muscleVolume).forEach(([m, v]) => { normalized[m] = v / max; });
  return normalized;
};
