import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const METRICS = [
  {
    key: 'volume',
    label: 'Training Volume',
    formula: 'TV\u202F=\u202F\u03A3\u202F(s\u202F\u00D7\u202Fr\u202F\u00D7\u202Fw)',
    unit: 'lbs',
    color: '#c8a96e',
    yLabel: 'Volume (lbs)',
  },
  {
    key: 'weight',
    label: 'Weight',
    formula: null,
    unit: 'lbs',
    color: '#60a5fa',
    yLabel: 'lbs',
  },
  {
    key: 'reps',
    label: 'Reps',
    formula: null,
    unit: '',
    color: '#4ade80',
    yLabel: 'Reps',
  },
  {
    key: 'sets',
    label: 'Sets',
    formula: null,
    unit: '',
    color: '#f87171',
    yLabel: 'Sets',
  },
];

const MiniTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  const d = new Date(label);
  const dateStr = isNaN(d) ? label : `${d.getMonth() + 1}/${d.getDate()}`;
  return (
    <div style={{
      background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)',
      borderRadius: 6, padding: '6px 10px', fontSize: 11,
    }}>
      <p style={{ color: 'var(--text-muted)' }}>{dateStr}</p>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
        {payload[0].value.toLocaleString()}{unit ? ` ${unit}` : ''}
      </p>
    </div>
  );
};

function MiniChart({ data, metric }) {
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const delta = latest && prev && prev[metric.key] !== 0
    ? ((latest[metric.key] - prev[metric.key]) / prev[metric.key] * 100).toFixed(1)
    : null;

  const tickFormatter = (d) => {
    const dt = new Date(d);
    return isNaN(dt) ? d : `${dt.getMonth() + 1}/${dt.getDate()}`;
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-card-hover)',
      borderRadius: 10,
      padding: '8px 8px 4px 8px',
      minHeight: 0,
    }}>
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1, flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {metric.label}
            </p>
            {metric.formula && (
              <p style={{ fontSize: 8, color: 'var(--accent)', letterSpacing: '0.02em' }}>
                = {metric.formula}
              </p>
            )}
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {latest ? latest[metric.key].toLocaleString() : '\u2014'}
            {metric.unit && <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 3 }}>{metric.unit}</span>}
          </p>
        </div>
        {delta !== null && (
          <span style={{
            fontSize: 9,
            color: Number(delta) >= 0 ? 'var(--green)' : 'var(--red)',
            fontWeight: 600,
          }}>
            {Number(delta) >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 6, left: 0, bottom: 16 }}>
            <defs>
              <linearGradient id={`grad-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--text-muted)', fontSize: 8 }}
              tickFormatter={tickFormatter}
              axisLine={{ stroke: 'var(--grid-line)' }}
              tickLine={false}
              interval="preserveStartEnd"
              label={{
                value: 'Date',
                position: 'insideBottom',
                offset: -4,
                style: { fontSize: 8, fill: 'var(--text-muted)' },
              }}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 8 }}
              axisLine={{ stroke: 'var(--grid-line)' }}
              tickLine={false}
              width={34}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
              label={{
                value: metric.yLabel,
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: 8, fill: 'var(--text-muted)' },
              }}
            />
            <Tooltip content={<MiniTooltip unit={metric.unit} />} />
            <Area
              type="monotone"
              dataKey={metric.key}
              stroke={metric.color}
              strokeWidth={1.5}
              fill={`url(#grad-${metric.key})`}
              dot={false}
              activeDot={{ r: 3, fill: metric.color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ExerciseAnalytics() {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [data, setData] = useState([]);

  // Load exercise list on mount
  useEffect(() => {
    fetch('/api/exercises')
      .then((r) => r.json())
      .then((exs) => {
        setExercises(exs);
        if (exs.length) setSelectedExercise(exs[0].id);
      })
      .catch(() => {});
  }, []);

  // Fetch volume history when exercise selection changes
  useEffect(() => {
    if (!selectedExercise) return;
    fetch(`/api/analytics/volume?exercise_id=${selectedExercise}&days=90`)
      .then((r) => r.json())
      .then((pts) =>
        setData(pts.map((d) => ({
          date: d.date,
          volume: d.volume,
          weight: d.weight_lbs,
          reps: d.reps,
          sets: d.sets,
        })))
      )
      .catch(() => setData([]));
  }, [selectedExercise]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Exercise Analytics
        </p>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedExercise ?? ''}
            onChange={(e) => setSelectedExercise(Number(e.target.value))}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-input)',
              color: 'var(--text-primary)',
              padding: '4px 26px 4px 10px',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {exercises.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <span style={{
            position: 'absolute', right: 8, top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
            color: 'var(--accent)', fontSize: 8,
          }}>{'\u25BC'}</span>
        </div>
      </div>

      {/* 2x2 mini chart grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 8,
        minHeight: 0,
      }}>
        {METRICS.map((m) => (
          <MiniChart key={m.key} data={data} metric={m} />
        ))}
      </div>
    </div>
  );
}
