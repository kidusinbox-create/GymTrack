import { useState } from 'react';
import { WORKOUT_PLANS, EXERCISES } from '../data/mockData';

const MODAL_STYLES = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-input)',
    borderRadius: 12,
    padding: 24,
    width: 480,
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflow: 'auto',
  },
};

function CreatePlanModal({ onClose, onSave }) {
  const [planName, setPlanName] = useState('');
  const [rows, setRows] = useState([{ exercise_id: '', sets: 3, reps: 10, weight: 0 }]);

  const addRow = () => setRows([...rows, { exercise_id: '', sets: 3, reps: 10, weight: 0 }]);
  const updateRow = (i, field, val) => {
    setRows(rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  return (
    <div style={MODAL_STYLES.overlay} onClick={onClose}>
      <div style={MODAL_STYLES.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Create Workout Plan</p>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 18, lineHeight: 1,
          }}>{'\u00D7'}</button>
        </div>

        <div style={{ marginBottom: 12 }}>
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

        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>Exercises</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ flex: 3, position: 'relative' }}>
                <select
                  value={row.exercise_id}
                  onChange={(e) => updateRow(i, 'exercise_id', e.target.value)}
                  style={{
                    width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-input)',
                    color: 'var(--text-primary)', padding: '6px 24px 6px 10px',
                    borderRadius: 6, fontSize: 12, cursor: 'pointer', outline: 'none',
                  }}
                >
                  <option value="">Select exercise</option>
                  {EXERCISES.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                <span style={{
                  position: 'absolute', right: 8, top: '50%',
                  transform: 'translateY(-50%)', pointerEvents: 'none',
                  color: 'var(--accent)', fontSize: 9,
                }}>{'\u25BC'}</span>
              </div>
              {['sets', 'reps', 'weight'].map((field) => (
                <input key={field} type="number" value={row[field]} min={0}
                  onChange={(e) => updateRow(i, field, e.target.value)}
                  placeholder={field}
                  style={{
                    flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-input)',
                    color: 'var(--text-primary)', padding: '6px 8px', borderRadius: 6, fontSize: 12,
                    outline: 'none', textAlign: 'center',
                  }} />
              ))}
              <button onClick={() => removeRow(i)} style={{
                background: 'none', border: 'none', color: 'var(--red)',
                cursor: 'pointer', fontSize: 16, padding: '0 4px',
              }}>{'\u00D7'}</button>
            </div>
          ))}
        </div>

        <button onClick={addRow} style={{
          marginTop: 8, width: '100%', padding: '8px',
          background: 'var(--bg-input)', border: '1px dashed var(--border-input)',
          color: 'var(--text-secondary)', borderRadius: 6, cursor: 'pointer', fontSize: 12,
        }}>+ Add Exercise</button>

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', background: 'transparent',
            border: '1px solid var(--border-input)', color: 'var(--text-secondary)',
            borderRadius: 8, cursor: 'pointer', fontSize: 13,
          }}>Cancel</button>
          <button
            onClick={() => { onSave({ planName, rows }); onClose(); }}
            disabled={!planName}
            style={{
              flex: 1, padding: '10px', background: 'var(--accent)',
              border: 'none', color: '#0a0a0a',
              borderRadius: 8, cursor: planName ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 700, opacity: planName ? 1 : 0.5,
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

  // Live input state for each exercise row
  const activePlan = plans.find((p) => p.id === Number(selectedPlan));
  const [inputRows, setInputRows] = useState([]);

  // When plan changes, populate input rows from template
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

  const updateInput = (i, field, val) => {
    setInputRows(inputRows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  const handleLog = () => {
    const volume = inputRows.reduce((s, r) =>
      s + (Number(r.sets) || 0) * (Number(r.reps) || 0) * (Number(r.weight) || 0), 0);
    setLastLogged({ plan: activePlan?.name, volume, time: new Date().toLocaleTimeString() });
  };

  const handleSavePlan = ({ planName, rows }) => {
    const newPlan = {
      id: Date.now(),
      name: planName,
      exercises: rows.filter((r) => r.exercise_id).map((r) => ({
        exercise_id: Number(r.exercise_id),
        sets: Number(r.sets),
        reps: Number(r.reps),
        weight: Number(r.weight),
      })),
    };
    setPlans([...plans, newPlan]);
    handlePlanChange(String(newPlan.id));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
      {/* Header row: label + plan selector + create button */}
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
              padding: '5px 26px 5px 10px', borderRadius: 6,
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
            color: 'var(--text-secondary)', borderRadius: 6, padding: '5px 10px',
            cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap',
          }}
        >+ New</button>
      </div>

      {/* Inline exercise input rows */}
      {activePlan && inputRows.length > 0 && (
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Column headers */}
          <div style={{ display: 'flex', gap: 4, paddingRight: 2, flexShrink: 0 }}>
            <div style={{ flex: 3, fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exercise</div>
            <div style={{ flex: 1, fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Sets</div>
            <div style={{ flex: 1, fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Reps</div>
            <div style={{ flex: 1, fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Lbs</div>
          </div>
          {inputRows.map((row, i) => {
            const ex = EXERCISES.find((e) => e.id === row.exercise_id);
            return (
              <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <p style={{
                  flex: 3, fontSize: 11, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {ex?.name ?? 'Unknown'}
                </p>
                {['sets', 'reps', 'weight'].map((field) => (
                  <input
                    key={field}
                    type="number"
                    value={row[field]}
                    min={0}
                    placeholder="—"
                    onChange={(e) => updateInput(i, field, e.target.value)}
                    style={{
                      flex: 1, background: 'var(--bg-input)',
                      border: '1px solid var(--border-input)',
                      color: 'var(--text-primary)', padding: '4px 4px',
                      borderRadius: 4, fontSize: 12,
                      outline: 'none', textAlign: 'center',
                      width: 0, // let flex control
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* No plan selected */}
      {!activePlan && (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: 12,
        }}>
          Select a workout plan to begin
        </div>
      )}

      {/* Log button */}
      {activePlan && (
        <button
          onClick={handleLog}
          style={{
            padding: '8px', background: 'var(--accent)',
            border: 'none', color: '#0a0a0a',
            borderRadius: 8, cursor: 'pointer',
            fontSize: 12, fontWeight: 700,
            flexShrink: 0,
          }}
        >
          Log Today's Session
        </button>
      )}

      {/* Success toast */}
      {lastLogged && (
        <div style={{
          background: '#0d1f0d', border: '1px solid #1a3a1a',
          borderRadius: 6, padding: '6px 10px', flexShrink: 0,
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
