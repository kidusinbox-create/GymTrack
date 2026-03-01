// Mock data for Phase 1 UI development

export const EXERCISES = [
  { id: 1, name: 'Bench Press', muscle_groups: ['chest', 'triceps', 'front_delts'] },
  { id: 2, name: 'Squat', muscle_groups: ['quads', 'glutes', 'hamstrings'] },
  { id: 3, name: 'Deadlift', muscle_groups: ['hamstrings', 'glutes', 'lower_back', 'traps'] },
  { id: 4, name: 'Pull-up', muscle_groups: ['lats', 'biceps', 'rear_delts'] },
  { id: 5, name: 'Overhead Press', muscle_groups: ['front_delts', 'triceps', 'traps'] },
  { id: 6, name: 'Barbell Row', muscle_groups: ['lats', 'rear_delts', 'biceps', 'traps'] },
  { id: 7, name: 'Incline Bench Press', muscle_groups: ['chest', 'front_delts', 'triceps'] },
  { id: 8, name: 'Romanian Deadlift', muscle_groups: ['hamstrings', 'glutes', 'lower_back'] },
  { id: 9, name: 'Lateral Raise', muscle_groups: ['side_delts'] },
  { id: 10, name: 'Bicep Curl', muscle_groups: ['biceps'] },
  { id: 11, name: 'Tricep Pushdown', muscle_groups: ['triceps'] },
  { id: 12, name: 'Leg Press', muscle_groups: ['quads', 'glutes'] },
];

export const WORKOUT_PLANS = [
  {
    id: 1,
    name: 'Push Day A',
    exercises: [
      { exercise_id: 1, sets: 4, reps: 8, weight: 185 },
      { exercise_id: 7, sets: 3, reps: 10, weight: 135 },
      { exercise_id: 5, sets: 3, reps: 10, weight: 115 },
      { exercise_id: 9, sets: 3, reps: 15, weight: 30 },
      { exercise_id: 11, sets: 3, reps: 12, weight: 50 },
    ],
  },
  {
    id: 2,
    name: 'Pull Day A',
    exercises: [
      { exercise_id: 6, sets: 4, reps: 8, weight: 155 },
      { exercise_id: 4, sets: 3, reps: 8, weight: 0 },
      { exercise_id: 3, sets: 3, reps: 5, weight: 225 },
      { exercise_id: 10, sets: 3, reps: 12, weight: 35 },
    ],
  },
  {
    id: 3,
    name: 'Leg Day A',
    exercises: [
      { exercise_id: 2, sets: 4, reps: 6, weight: 225 },
      { exercise_id: 8, sets: 3, reps: 10, weight: 175 },
      { exercise_id: 12, sets: 3, reps: 12, weight: 270 },
    ],
  },
];

// Generate 8 weeks of exercise history
const generateHistory = () => {
  const history = [];
  const today = new Date();
  const exercises = [
    { id: 1, name: 'Bench Press', baseWeight: 185, sets: 4, reps: 8 },
    { id: 2, name: 'Squat', baseWeight: 225, sets: 4, reps: 6 },
    { id: 3, name: 'Deadlift', baseWeight: 225, sets: 3, reps: 5 },
    { id: 4, name: 'Pull-up', baseWeight: 0, sets: 3, reps: 8 },
    { id: 5, name: 'Overhead Press', baseWeight: 115, sets: 3, reps: 10 },
  ];

  for (let week = 7; week >= 0; week--) {
    // Push day (Mon), Pull day (Wed), Legs (Fri)
    [1, 3, 5].forEach((dayOffset) => {
      const date = new Date(today);
      date.setDate(today.getDate() - week * 7 - (7 - dayOffset));

      const sessionExercises = week % 3 === 0
        ? [exercises[0], exercises[4]] // push
        : week % 3 === 1
          ? [exercises[3], exercises[2]] // pull
          : [exercises[1]]; // legs

      sessionExercises.forEach((ex) => {
        const progression = (8 - week) * 2.5;
        const weight = ex.baseWeight + progression;
        const volume = ex.sets * ex.reps * (weight || 1);
        history.push({
          date: date.toISOString().split('T')[0],
          exercise_id: ex.id,
          exercise_name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight_lbs: weight,
          volume,
        });
      });
    });
  }
  return history;
};

export const SESSION_HISTORY = generateHistory();

// Aggregate by exercise for the chart
export const getExerciseHistory = (exerciseId) => {
  return SESSION_HISTORY
    .filter((s) => s.exercise_id === exerciseId)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((s) => ({
      date: s.date,
      weight: s.weight_lbs,
      volume: s.volume,
      reps: s.reps,
      sets: s.sets,
    }));
};

// Calendar: volume by date
export const getCalendarData = () => {
  const byDate = {};
  SESSION_HISTORY.forEach((s) => {
    byDate[s.date] = (byDate[s.date] || 0) + s.volume;
  });
  return byDate;
};

// Efficiency ratings: normalized volume per session date
export const getEfficiencyData = () => {
  const byDate = {};
  SESSION_HISTORY.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = { date: s.date, volume: 0 };
    byDate[s.date].volume += s.volume;
  });

  const sessions = Object.values(byDate).sort((a, b) => new Date(b.date) - new Date(a.date));
  const maxVol = Math.max(...sessions.map((s) => s.volume));

  return sessions.slice(0, 10).map((s) => ({
    ...s,
    efficiency: Math.round((s.volume / maxVol) * 100),
    label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));
};

// Muscle volume accumulation (last 7 days)
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
  Object.entries(muscleVolume).forEach(([m, v]) => {
    normalized[m] = v / max; // 0–1
  });
  return normalized;
};
