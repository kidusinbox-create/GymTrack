import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { EXERCISES, getExerciseHistory } from '../data/mockData';

const METRICS = [
  { key: 'volume', label: 'Training Volume', unit: 'lbs', color: '#c8a96e' },
  { key: 'weight', label: 'Weight', unit: 'lbs', color: '#60a5fa' },
  { key: 'reps', label: 'Reps', unit: '', color: '#4ade80' },
  { key: 'sets', label: 'Sets', unit: '', color: '#f87171' },
];

const MiniTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)',
      borderRadius: 6, padding: '6px 10px', fontSize: 11,
    }}>
      <p style={{ color: 'var(--text-muted)' }}>{label}</p>
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

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-card-hover)',
      borderRadius: 10,
      padding: '8px 10px 4px',
      minHeight: 0,
    }}>
      {/* Label + value */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
        <div>
          <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {metric.label}
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {latest ? latest[metric.key].toLocaleString() : '—'}
            {metric.unit && <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 3 }}>{metric.unit}</span>}
          </p>
        </div>
        {delta !== null && (
          <span style={{
            fontSize: 10,
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
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
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
  const [selectedExercise, setSelectedExercise] = useState(1);
  const data = getExerciseHistory(Number(selectedExercise));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Exercise Analytics
        </p>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
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
            {EXERCISES.map((e) => (
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
