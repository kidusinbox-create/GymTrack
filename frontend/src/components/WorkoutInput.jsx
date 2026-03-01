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
    background: '#111',
    border: '1px solid #2a2a2a',
    borderRadius: 12,
    padding: 24,
    width: 480,
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflow: 'auto',
  },
};

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <p style={{ fontSize: 11, color: '#7a7570', marginBottom: 4 }}>{label}</p>}
    <input
      {...props}
      style={{
        width: '100%',
        background: '#161616',
        border: '1px solid #2a2a2a',
        color: '#f0ece4',
        padding: '8px 12px',
        borderRadius: 6,
        fontSize: 13,
        outline: 'none',
      }}
    />
  </div>
);

function CreatePlanModal({ onClose, onSave }) {
  const [planName, setPlanName] = useState('');
  const [rows, setRows] = useState([{ exercise_id: '', sets: 3, reps: 10, weight: 0 }]);

  const addRow = () => setRows([...rows, { exercise_id: '', sets: 3, reps: 10, weight: 0 }]);
  const updateRow = (i, field, val) => {
    const updated = rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    setRows(updated);
  };
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  return (
    <div style={MODAL_STYLES.overlay} onClick={onClose}>
      <div style={MODAL_STYLES.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f0ece4' }}>Create Workout Plan</p>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#7a7570',
            cursor: 'pointer', fontSize: 18, lineHeight: 1,
          }}>×</button>
        </div>

        <Input
          label="Plan Name"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          placeholder="e.g. Push Day A"
        />

        <p style={{ fontSize: 11, color: '#7a7570', marginBottom: 8 }}>Exercises</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Exercise select */}
              <div style={{ flex: 3, position: 'relative' }}>
                <select
                  value={row.exercise_id}
                  onChange={(e) => updateRow(i, 'exercise_id', e.target.value)}
                  style={{
                    width: '100%', background: '#161616', border: '1px solid #2a2a2a',
                    color: '#f0ece4', padding: '6px 24px 6px 10px',
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
                  color: '#c8a96e', fontSize: 9,
                }}>▼</span>
              </div>
              {/* Sets */}
              <input type="number" value={row.sets} min={1} max={20}
                onChange={(e) => updateRow(i, 'sets', e.target.value)}
                placeholder="Sets"
                style={{
                  flex: 1, background: '#161616', border: '1px solid #2a2a2a',
                  color: '#f0ece4', padding: '6px 8px', borderRadius: 6, fontSize: 12,
                  outline: 'none', textAlign: 'center',
                }} />
              {/* Reps */}
              <input type="number" value={row.reps} min={1} max={100}
                onChange={(e) => updateRow(i, 'reps', e.target.value)}
                placeholder="Reps"
                style={{
                  flex: 1, background: '#161616', border: '1px solid #2a2a2a',
                  color: '#f0ece4', padding: '6px 8px', borderRadius: 6, fontSize: 12,
                  outline: 'none', textAlign: 'center',
                }} />
              {/* Weight */}
              <input type="number" value={row.weight} min={0}
                onChange={(e) => updateRow(i, 'weight', e.target.value)}
                placeholder="lbs"
                style={{
                  flex: 1, background: '#161616', border: '1px solid #2a2a2a',
                  color: '#f0ece4', padding: '6px 8px', borderRadius: 6, fontSize: 12,
                  outline: 'none', textAlign: 'center',
                }} />
              <button onClick={() => removeRow(i)} style={{
                background: 'none', border: 'none', color: '#f87171',
                cursor: 'pointer', fontSize: 16, padding: '0 4px',
              }}>×</button>
            </div>
          ))}
          {/* Column labels */}
          <div style={{ display: 'flex', gap: 6, paddingLeft: 0 }}>
            <div style={{ flex: 3 }} />
            {['Sets', 'Reps', 'Lbs', ''].map((l) => (
              <div key={l} style={{
                flex: 1, textAlign: 'center',
                fontSize: 9, color: '#444', textTransform: 'uppercase',
              }}>{l}</div>
            ))}
          </div>
        </div>

        <button onClick={addRow} style={{
          marginTop: 8, width: '100%', padding: '8px',
          background: '#161616', border: '1px dashed #2a2a2a',
          color: '#7a7570', borderRadius: 6, cursor: 'pointer', fontSize: 12,
        }}>
          + Add Exercise
        </button>

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', background: 'transparent',
            border: '1px solid #2a2a2a', color: '#7a7570',
            borderRadius: 8, cursor: 'pointer', fontSize: 13,
          }}>Cancel</button>
          <button
            onClick={() => { onSave({ planName, rows }); onClose(); }}
            disabled={!planName}
            style={{
              flex: 1, padding: '10px', background: '#c8a96e',
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

function LogSessionModal({ plan, onClose, onLog }) {
  const [setData, setSetData] = useState(
    plan?.exercises.map((ex) => ({
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
    })) ?? []
  );
  const [notes, setNotes] = useState('');

  if (!plan) return null;

  const updateSet = (i, field, val) => {
    setSetData(setSetData.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const totalVolume = setData.reduce((sum, s) => sum + s.sets * s.reps * (s.weight || 1), 0);

  return (
    <div style={MODAL_STYLES.overlay} onClick={onClose}>
      <div style={MODAL_STYLES.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f0ece4' }}>Log Session</p>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#7a7570',
            cursor: 'pointer', fontSize: 18, lineHeight: 1,
          }}>×</button>
        </div>
        <p style={{ fontSize: 13, color: '#c8a96e', marginBottom: 16 }}>{plan.name}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {setData.map((row, i) => {
            const ex = EXERCISES.find((e) => e.id === row.exercise_id);
            return (
              <div key={i} style={{
                background: '#161616', border: '1px solid #222',
                borderRadius: 8, padding: '10px 12px',
              }}>
                <p style={{ fontSize: 12, color: '#f0ece4', marginBottom: 8, fontWeight: 600 }}>
                  {ex?.name ?? 'Unknown'}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { field: 'sets', label: 'Sets' },
                    { field: 'reps', label: 'Reps' },
                    { field: 'weight', label: 'lbs' },
                  ].map(({ field, label }) => (
                    <div key={field} style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: '#444', textAlign: 'center', marginBottom: 3 }}>{label}</p>
                      <input
                        type="number"
                        value={row[field]}
                        min={0}
                        onChange={(e) => updateSet(i, field, Number(e.target.value))}
                        style={{
                          width: '100%', background: '#111',
                          border: '1px solid #2a2a2a',
                          color: '#f0ece4', padding: '6px 8px',
                          borderRadius: 6, fontSize: 13,
                          outline: 'none', textAlign: 'center',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ margin: '14px 0' }}>
          <p style={{ fontSize: 11, color: '#7a7570', marginBottom: 4 }}>Notes (optional)</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            style={{
              width: '100%', background: '#161616', border: '1px solid #2a2a2a',
              color: '#f0ece4', padding: '8px 12px', borderRadius: 6, fontSize: 13,
              outline: 'none', resize: 'none',
            }}
            placeholder="Great session, felt strong..."
          />
        </div>

        <div style={{
          background: '#161616', border: '1px solid #222',
          borderRadius: 8, padding: '10px 14px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 14,
        }}>
          <p style={{ fontSize: 12, color: '#7a7570' }}>Est. Training Volume</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#c8a96e' }}>
            {totalVolume.toLocaleString()} <span style={{ fontSize: 11, color: '#7a7570' }}>lbs</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', background: 'transparent',
            border: '1px solid #2a2a2a', color: '#7a7570',
            borderRadius: 8, cursor: 'pointer', fontSize: 13,
          }}>Cancel</button>
          <button onClick={() => { onLog({ setData, notes }); onClose(); }} style={{
            flex: 1, padding: '10px', background: '#c8a96e',
            border: 'none', color: '#0a0a0a',
            borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}>
            Log Session
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
  const [showLog, setShowLog] = useState(false);
  const [lastLogged, setLastLogged] = useState(null);

  const activePlan = plans.find((p) => p.id === Number(selectedPlan));

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
    setSelectedPlan(String(newPlan.id));
  };

  const handleLog = ({ setData, notes }) => {
    const volume = setData.reduce((s, r) => s + r.sets * r.reps * (r.weight || 1), 0);
    setLastLogged({ plan: activePlan?.name, volume, time: new Date().toLocaleTimeString() });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 11, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Today's Workout
      </p>

      {/* Plan selector */}
      <div style={{ position: 'relative' }}>
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          style={{
            width: '100%', background: '#161616',
            border: '1px solid #2a2a2a', color: '#f0ece4',
            padding: '8px 32px 8px 12px', borderRadius: 8,
            fontSize: 13, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="">Select workout plan...</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <span style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', pointerEvents: 'none',
          color: '#c8a96e', fontSize: 10,
        }}>▼</span>
      </div>

      {/* Plan preview */}
      {activePlan && (
        <div style={{
          background: '#161616', border: '1px solid #222',
          borderRadius: 8, padding: '10px 12px', flex: 1,
          overflow: 'auto',
        }}>
          <p style={{ fontSize: 11, color: '#c8a96e', marginBottom: 8, fontWeight: 600 }}>
            {activePlan.name}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activePlan.exercises.map((ex, i) => {
              const exercise = EXERCISES.find((e) => e.id === ex.exercise_id);
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 11, color: '#f0ece4' }}>{exercise?.name}</p>
                  <p style={{ fontSize: 11, color: '#7a7570' }}>
                    {ex.sets}×{ex.reps} @ {ex.weight} lbs
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={() => setShowLog(true)}
          disabled={!activePlan}
          style={{
            padding: '10px', background: activePlan ? '#c8a96e' : '#1a1a1a',
            border: 'none', color: activePlan ? '#0a0a0a' : '#444',
            borderRadius: 8, cursor: activePlan ? 'pointer' : 'not-allowed',
            fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
          }}
        >
          Log Today's Session
        </button>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              flex: 1, padding: '8px', background: 'transparent',
              border: '1px solid #2a2a2a', color: '#7a7570',
              borderRadius: 8, cursor: 'pointer', fontSize: 12,
              transition: 'all 0.15s',
            }}
          >+ Create Plan</button>
          <button
            disabled={!activePlan}
            style={{
              flex: 1, padding: '8px', background: 'transparent',
              border: '1px solid #2a2a2a',
              color: activePlan ? '#7a7570' : '#2a2a2a',
              borderRadius: 8, cursor: activePlan ? 'pointer' : 'not-allowed',
              fontSize: 12, transition: 'all 0.15s',
            }}
          >Edit Plan</button>
        </div>
      </div>

      {/* Success toast */}
      {lastLogged && (
        <div style={{
          background: '#0d1f0d', border: '1px solid #1a3a1a',
          borderRadius: 8, padding: '8px 12px',
        }}>
          <p style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>Session Logged!</p>
          <p style={{ fontSize: 10, color: '#7a7570', marginTop: 2 }}>
            {lastLogged.plan} · {lastLogged.volume.toLocaleString()} lbs · {lastLogged.time}
          </p>
        </div>
      )}

      {showCreate && (
        <CreatePlanModal onClose={() => setShowCreate(false)} onSave={handleSavePlan} />
      )}
      {showLog && activePlan && (
        <LogSessionModal plan={activePlan} onClose={() => setShowLog(false)} onLog={handleLog} />
      )}
    </div>
  );
}
