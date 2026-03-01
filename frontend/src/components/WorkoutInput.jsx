import { useState, useEffect } from 'react';

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

// Shared exercise-name list editor used by both Create and Edit modals
function ExerciseList({ exercises, onChange }) {
  const update = (i, val) => onChange(exercises.map((e, idx) => (idx === i ? val : e)));
  const add    = ()       => onChange([...exercises, '']);
  const remove = (i)      => onChange(exercises.filter((_, idx) => idx !== i));

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {exercises.map((ex, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              value={ex}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`Exercise ${i + 1} (e.g. Bench Press)`}
              style={{
                flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-input)',
                color: 'var(--text-primary)', padding: '7px 12px', borderRadius: 6,
                fontSize: 13, outline: 'none',
              }}
            />
            {exercises.length > 1 && (
              <button
                onClick={() => remove(i)}
                style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px' }}
              >&times;</button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={add}
        style={{
          marginTop: 8, width: '100%', padding: '7px',
          background: 'var(--bg-input)', border: '1px dashed var(--border-input)',
          color: 'var(--text-secondary)', borderRadius: 6, cursor: 'pointer', fontSize: 12,
        }}
      >+ Add Exercise</button>
    </>
  );
}

function ModalShell({ title, onClose, onSave, saveLabel = 'Save Plan', saveDisabled = false, children }) {
  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={MODAL} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>&times;</button>
        </div>
        {children}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '9px', background: 'transparent',
            border: '1px solid var(--border-input)', color: 'var(--text-secondary)',
            borderRadius: 8, cursor: 'pointer', fontSize: 13,
          }}>Cancel</button>
          <button
            onClick={onSave}
            disabled={saveDisabled}
            style={{
              flex: 1, padding: '9px', background: 'var(--accent)', border: 'none', color: '#0a0a0a',
              borderRadius: 8, cursor: saveDisabled ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700, opacity: saveDisabled ? 0.4 : 1,
            }}
          >{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

function CreatePlanModal({ onClose, onSave }) {
  const [planName,  setPlanName]  = useState('');
  const [exercises, setExercises] = useState(['']);

  const handleSave = () => {
    const cleaned = exercises.filter((e) => e.trim());
    if (!planName.trim() || !cleaned.length) return;
    onSave({ planName: planName.trim(), exerciseNames: cleaned });
    onClose();
  };

  return (
    <ModalShell title="Create Workout Plan" onClose={onClose} onSave={handleSave} saveDisabled={!planName.trim()}>
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
      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Exercises</p>
      <ExerciseList exercises={exercises} onChange={setExercises} />
    </ModalShell>
  );
}

function EditPlanModal({ plan, onClose, onSave }) {
  const [planName,  setPlanName]  = useState(plan.name);
  // API returns exercise_name directly on each plan exercise
  const [exercises, setExercises] = useState(plan.exercises.map((ex) => ex.exercise_name ?? ''));

  const handleSave = () => {
    const cleaned = exercises.filter((e) => e.trim());
    if (!planName.trim() || !cleaned.length) return;
    onSave({ planName: planName.trim(), exerciseNames: cleaned });
    onClose();
  };

  return (
    <ModalShell title={`Edit — ${plan.name}`} onClose={onClose} onSave={handleSave} saveLabel="Save Changes" saveDisabled={!planName.trim()}>
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Plan Name</p>
        <input
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          style={{
            width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-input)',
            color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 6, fontSize: 13, outline: 'none',
          }}
        />
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Exercises</p>
      <ExerciseList exercises={exercises} onChange={setExercises} />
    </ModalShell>
  );
}

export default function WorkoutInput() {
  const [plans,        setPlans]        = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showCreate,   setShowCreate]   = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [lastLogged,   setLastLogged]   = useState(null);
  const [inputRows,    setInputRows]    = useState([]);

  const activePlan = plans.find((p) => p.id === Number(selectedPlan));

  // Load plans from API on mount
  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then(setPlans)
      .catch(() => {});
  }, []);

  const handlePlanChange = (planId) => {
    setSelectedPlan(planId);
    setLastLogged(null);
    const plan = plans.find((p) => p.id === Number(planId));
    setInputRows(plan
      ? plan.exercises.map((ex) => ({ exercise_name: ex.exercise_name, sets: '', reps: '', weight: '' }))
      : []
    );
  };

  const updateInput = (i, field, val) =>
    setInputRows(inputRows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const handleLog = async () => {
    // Expand each row (sets=N → N individual set entries)
    const setsPayload = [];
    inputRows.forEach((row) => {
      const numSets = Number(row.sets) || 0;
      const reps    = Number(row.reps) || 0;
      const weight  = Number(row.weight) || 0;
      for (let s = 1; s <= numSets; s++) {
        setsPayload.push({ exercise_name: row.exercise_name, set_number: s, reps, weight_lbs: weight });
      }
    });
    if (!setsPayload.length) return;

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: activePlan?.id ?? null, sets: setsPayload }),
      });
      const session = await res.json();
      setLastLogged({ plan: activePlan?.name, volume: session.total_volume, time: new Date().toLocaleTimeString() });
    } catch {
      // silent — keep UI functional if backend is down
    }
  };

  const handleCreate = async ({ planName, exerciseNames }) => {
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: planName, exercises: exerciseNames.map((n) => ({ exercise_name: n })) }),
      });
      const newPlan = await res.json();
      setPlans((prev) => [...prev, newPlan]);
      setSelectedPlan(String(newPlan.id));
      setInputRows(newPlan.exercises.map((ex) => ({ exercise_name: ex.exercise_name, sets: '', reps: '', weight: '' })));
      setLastLogged(null);
    } catch {
      // silent
    }
  };

  const handleEdit = async ({ planName, exerciseNames }) => {
    try {
      const res = await fetch(`/api/plans/${activePlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: planName, exercises: exerciseNames.map((n) => ({ exercise_name: n })) }),
      });
      const updatedPlan = await res.json();
      setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      setInputRows(updatedPlan.exercises.map((ex) => ({ exercise_name: ex.exercise_name, sets: '', reps: '', weight: '' })));
      setLastLogged(null);
    } catch {
      // silent
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
          Today&apos;s Workout
        </p>

        {/* Plan selector */}
        <div style={{ position: 'relative', flex: 1 }}>
          <select
            value={selectedPlan}
            onChange={(e) => handlePlanChange(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-input)',
              color: 'var(--text-primary)', padding: '5px 24px 5px 10px', borderRadius: 6,
              fontSize: 12, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">Select plan...</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--accent)', fontSize: 8 }}>▼</span>
        </div>

        {/* New */}
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: 'var(--bg-input)', border: '1px solid var(--border-input)',
            color: 'var(--text-secondary)', borderRadius: 6, padding: '5px 9px',
            cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap',
          }}
        >+ New</button>

        {/* Edit — only enabled when a plan is selected */}
        <button
          onClick={() => activePlan && setShowEdit(true)}
          disabled={!activePlan}
          style={{
            background: 'var(--bg-input)', border: '1px solid var(--border-input)',
            color: activePlan ? 'var(--text-secondary)' : 'var(--text-muted)',
            borderRadius: 6, padding: '5px 9px',
            cursor: activePlan ? 'pointer' : 'not-allowed', fontSize: 11, whiteSpace: 'nowrap',
            opacity: activePlan ? 1 : 0.45,
          }}
        >Edit</button>
      </div>

      {/* ── Exercise input rows ── */}
      {activePlan && inputRows.length > 0 && (
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <div style={{ flex: 3, fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exercise</div>
            {['Sets', 'Reps', 'Lbs'].map((h) => (
              <div key={h} style={{ flex: 1, fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>{h}</div>
            ))}
          </div>
          {inputRows.map((row, i) => {
            const name = row.exercise_name || 'Exercise';
            return (
              <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <p style={{ flex: 3, fontSize: 11, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
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
                      flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-input)',
                      color: 'var(--text-primary)', padding: '4px 2px', borderRadius: 4,
                      fontSize: 12, outline: 'none', textAlign: 'center', width: 0,
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

      {/* ── Log button ── */}
      {activePlan && (
        <button
          onClick={handleLog}
          style={{
            padding: '7px', background: 'var(--accent)', border: 'none', color: '#0a0a0a',
            borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}
        >Log Today&apos;s Session</button>
      )}

      {/* ── Success toast ── */}
      {lastLogged && (
        <div style={{ background: '#0d1f0d', border: '1px solid #1a3a1a', borderRadius: 5, padding: '5px 10px', flexShrink: 0 }}>
          <p style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>
            Logged! {lastLogged.plan} &middot; {lastLogged.volume.toLocaleString()} lbs &middot; {lastLogged.time}
          </p>
        </div>
      )}

      {showCreate && <CreatePlanModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {showEdit && activePlan && <EditPlanModal plan={activePlan} onClose={() => setShowEdit(false)} onSave={handleEdit} />}
    </div>
  );
}
