import { useState } from 'react';
import { WORKOUT_PLANS, EXERCISES } from '../data/mockData';

const OVERLAY = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.75)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100,
  backdropFilter: 'blur(4px)',
};
const MODAL = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-input)',
  borderRadius: 12,
  padding: 22,
  width: 440,
  maxWidth: '90vw',
  maxHeight: '80vh',
  overflow: 'auto',
};

function CreatePlanModal({ onClose, onSave }) {
  const [planName, setPlanName] = useState('');
  // Each row is just an exercise name string — sets/reps/weight entered during logging
  const [exercises, setExercises] = useState(['']);

  const updateExercise = (i, val) =>
    setExercises(exercises.map((e, idx) => (idx === i ? val : e)));
  const addRow = () => setExercises([...exercises, '']);
  const removeRow = (i) => setExercises(exercises.filter((_, idx) => idx !== i));

  const handleSave = () => {
    const cleaned = exercises.filter((e) => e.trim());
    if (!planName.trim() || !cleaned.length) return;
    onSave({ planName: planName.trim(), exerciseNames: cleaned });
    onClose();
  };

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={MODAL} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Create Workout Plan</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>&times;</button>
        </div>

        {/* Plan name */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Plan Name</p>
          <input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g. Push Day A"
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-input)',
              color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 6, fontSize: 13, outline: 'none',
            }}
          />
        </div>

        {/* Exercise list — text inputs only */}
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Exercises</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {exercises.map((ex, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                value={ex}
                onChange={(e) => updateExercise(i, e.target.value)}
                placeholder={`Exercise ${i + 1} (e.g. Bench Press)`}
                style={{
                  flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-input)',
                  color: 'var(--text-primary)', padding: '7px 12px', borderRadius: 6, fontSize: 13, outline: 'none',
                }}
              />
              {exercises.length > 1 && (
                <button onClick={() => removeRow(i)} style={{
                  background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px',
                }}>&times;</button>
              )}
            </div>
          ))}
        </div>

        <button onClick={addRow} style={{
          marginTop: 8, width: '100%', padding: '7px',
          background: 'var(--bg-input)', border: '1px dashed var(--border-input)',
          color: 'var(--text-secondary)', borderRadius: 6, cursor: 'pointer', fontSize: 12,
        }}>+ Add Exercise</button>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '9px', background: 'transparent',
            border: '1px solid var(--border-input)', color: 'var(--text-secondary)',
            borderRadius: 8, cursor: 'pointer', fontSize: 13,
          }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={!planName.trim()}
            style={{
              flex: 1, padding: '9px', background: 'var(--accent)',
              border: 'none', color: '#0a0a0a',
              borderRadius: 8, cursor: planName.trim() ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 700, opacity: planName.trim() ? 1 : 0.4,
            }}>
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutInput() {
  const [plans, setPlans] = useState(WORKOUT_PLANS);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [lastLogged, setLastLogged] = useState(null);
  const [inputRows, setInputRows] = useState([]);

  const activePlan = plans.find((p) => p.id === Number(selectedPlan));

  const handlePlanChange = (planId) => {
    setSelectedPlan(planId);
    setLastLogged(null);
    const plan = plans.find((p) => p.id === Number(planId));
    if (plan) {
      setInputRows(plan.exercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        sets: '',
        reps: '',
        weight: '',
      })));
    } else {
      setInputRows([]);
    }
  };

  const updateInput = (i, field, val) =>
    setInputRows(inputRows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const handleLog = () => {
    const volume = inputRows.reduce(
      (s, r) => s + (Number(r.sets) || 0) * (Number(r.reps) || 0) * (Number(r.weight) || 0),
      0
    );
    setLastLogged({ plan: activePlan?.name, volume, time: new Date().toLocaleTimeString() });
  };

  const handleSavePlan = ({ planName, exerciseNames }) => {
    // Map typed names to exercise IDs (match against known list, else create placeholder)
    const exercises = exerciseNames.map((name, i) => {
      const match = EXERCISES.find(
        (e) => e.name.toLowerCase() === name.toLowerCase()
      );
      return {
        exercise_id: match ? match.id : 1000 + i, // placeholder id for unknown
        exercise_name: name,
        sets: 3,
        reps: 10,
        weight: 0,
      };
    });
    const newPlan = { id: Date.now(), name: planName, exercises };
    setPlans([...plans, newPlan]);
    handlePlanChange(String(newPlan.id));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
          Today's Workout
        </p>
        <div style={{ position: 'relative', flex: 1 }}>
          <select
            value={selectedPlan}
            onChange={(e) => handlePlanChange(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg-input)',
              border: '1px solid var(--border-input)', color: 'var(--text-primary)',
              padding: '5px 24px 5px 10px', borderRadius: 6,
              fontSize: 12, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">Select plan...</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <span style={{
            position: 'absolute', right: 8, top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
            color: 'var(--accent)', fontSize: 8,
          }}>{'\u25BC'}</span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: 'var(--bg-input)', border: '1px solid var(--border-input)',
            color: 'var(--text-secondary)', borderRadius: 6, padding: '5px 9px',
            cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap',
          }}
        >+ New</button>
      </div>

      {/* Inline exercise inputs */}
      {activePlan && inputRows.length > 0 && (
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Column headers */}
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <div style={{ flex: 3, fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exercise</div>
            {['Sets', 'Reps', 'Lbs'].map((h) => (
              <div key={h} style={{ flex: 1, fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>{h}</div>
            ))}
          </div>
          {inputRows.map((row, i) => {
            const ex = EXERCISES.find((e) => e.id === row.exercise_id);
            const name = ex?.name ?? activePlan.exercises[i]?.exercise_name ?? 'Exercise';
            return (
              <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <p style={{
                  flex: 3, fontSize: 11, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {name}
                </p>
                {['sets', 'reps', 'weight'].map((field) => (
                  <input
                    key={field}
                    type="number"
                    value={row[field]}
                    min={0}
                    placeholder="\u2014"
                    onChange={(e) => updateInput(i, field, e.target.value)}
                    style={{
                      flex: 1, background: 'var(--bg-input)',
                      border: '1px solid var(--border-input)',
                      color: 'var(--text-primary)', padding: '4px 2px',
                      borderRadius: 4, fontSize: 12,
                      outline: 'none', textAlign: 'center', width: 0,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {!activePlan && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
          Select a plan to begin
        </div>
      )}

      {activePlan && (
        <button
          onClick={handleLog}
          style={{
            padding: '7px', background: 'var(--accent)',
            border: 'none', color: '#0a0a0a',
            borderRadius: 7, cursor: 'pointer',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}
        >
          Log Today&apos;s Session
        </button>
      )}

      {lastLogged && (
        <div style={{
          background: '#0d1f0d', border: '1px solid #1a3a1a',
          borderRadius: 5, padding: '5px 10px', flexShrink: 0,
        }}>
          <p style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>
            Logged! {lastLogged.plan} &middot; {lastLogged.volume.toLocaleString()} lbs &middot; {lastLogged.time}
          </p>
        </div>
      )}

      {showCreate && (
        <CreatePlanModal onClose={() => setShowCreate(false)} onSave={handleSavePlan} />
      )}
    </div>
  );
}
