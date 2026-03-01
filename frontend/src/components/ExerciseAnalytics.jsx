import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { EXERCISES, getExerciseHistory } from '../data/mockData';

const METRICS = [
  { key: 'volume', label: 'Volume (lbs)', color: '#c8a96e' },
  { key: 'weight', label: 'Weight (lbs)', color: '#60a5fa' },
  { key: 'reps', label: 'Reps', color: '#4ade80' },
  { key: 'sets', label: 'Sets', color: '#f87171' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#111', border: '1px solid #222',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#7a7570', marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span style={{ color: '#f0ece4', fontWeight: 600 }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// Styled select dropdown
const Select = ({ value, onChange, options, placeholder }) => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: '#161616',
        border: '1px solid #333',
        color: '#f0ece4',
        padding: '6px 32px 6px 12px',
        borderRadius: 6,
        fontSize: 13,
        cursor: 'pointer',
        outline: 'none',
        minWidth: 160,
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <span style={{
      position: 'absolute', right: 10, top: '50%',
      transform: 'translateY(-50%)', pointerEvents: 'none',
      color: '#c8a96e', fontSize: 10,
    }}>▼</span>
  </div>
);

export default function ExerciseAnalytics() {
  const [selectedExercise, setSelectedExercise] = useState(1);
  const [activeMetric, setActiveMetric] = useState('volume');

  const data = getExerciseHistory(Number(selectedExercise));
  const metric = METRICS.find((m) => m.key === activeMetric);

  // Summary stats
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const volumeDelta = latest && prev
    ? ((latest.volume - prev.volume) / prev.volume * 100).toFixed(1)
    : null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <p style={{ fontSize: 11, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            Exercise Analytics
          </p>
          <Select
            value={selectedExercise}
            onChange={setSelectedExercise}
            options={EXERCISES.map((e) => ({ value: e.id, label: e.name }))}
          />
        </div>

        {latest && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#f0ece4' }}>
              {latest.volume.toLocaleString()}
              <span style={{ fontSize: 12, color: '#7a7570', marginLeft: 4 }}>lbs vol</span>
            </p>
            {volumeDelta !== null && (
              <p style={{
                fontSize: 12,
                color: Number(volumeDelta) >= 0 ? '#4ade80' : '#f87171',
              }}>
                {Number(volumeDelta) >= 0 ? '▲' : '▼'} {Math.abs(volumeDelta)}% vs last session
              </p>
            )}
          </div>
        )}
      </div>

      {/* Metric tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              border: `1px solid ${activeMetric === m.key ? m.color : '#2a2a2a'}`,
              background: activeMetric === m.key ? `${m.color}18` : 'transparent',
              color: activeMetric === m.key ? m.color : '#7a7570',
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#444', fontSize: 10 }}
              tickFormatter={(d) => {
                const dt = new Date(d);
                return `${dt.getMonth() + 1}/${dt.getDate()}`;
              }}
              axisLine={{ stroke: '#222' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#444', fontSize: 10 }}
              axisLine={{ stroke: '#222' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={activeMetric}
              name={metric.label}
              stroke={metric.color}
              strokeWidth={2}
              dot={{ fill: metric.color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mini stat row */}
      {latest && (
        <div style={{ display: 'flex', gap: 16, paddingTop: 8, borderTop: '1px solid #1a1a1a' }}>
          {[
            { label: 'Last Weight', value: `${latest.weight} lbs` },
            { label: 'Last Reps', value: latest.reps },
            { label: 'Last Sets', value: latest.sets },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: 10, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#f0ece4' }}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
