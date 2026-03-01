import { getEfficiencyData } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const getRatingLabel = (score) => {
  if (score >= 90) return { label: 'Peak', color: '#c8a96e' };
  if (score >= 75) return { label: 'Strong', color: '#4ade80' };
  if (score >= 55) return { label: 'Solid', color: '#60a5fa' };
  if (score >= 35) return { label: 'Moderate', color: '#fb923c' };
  return { label: 'Light', color: '#7a7570' };
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const eff = payload[0].value;
  const { label: rLabel, color } = getRatingLabel(eff);
  return (
    <div style={{
      background: '#111', border: '1px solid #222',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#7a7570', marginBottom: 4 }}>{label}</p>
      <p style={{ color }}>
        Efficiency: <span style={{ color: '#f0ece4', fontWeight: 600 }}>{eff}%</span>
      </p>
      <p style={{ color, fontSize: 11, marginTop: 2 }}>{rLabel}</p>
    </div>
  );
};

export default function EfficiencyRating() {
  const data = getEfficiencyData();
  const latest = data[0];
  const { label: rLabel, color: rColor } = latest ? getRatingLabel(latest.efficiency) : { label: '—', color: '#7a7570' };

  // Trend: last 5 sessions
  const trend = [...data].reverse().slice(-5);
  const avg = trend.length
    ? Math.round(trend.reduce((s, d) => s + d.efficiency, 0) / trend.length)
    : 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            Effort Rating
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <p style={{ fontSize: 36, fontWeight: 800, color: rColor, lineHeight: 1 }}>
              {latest?.efficiency ?? 0}%
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, color: rColor }}>{rLabel}</p>
          </div>
          <p style={{ fontSize: 11, color: '#7a7570', marginTop: 2 }}>
            Latest session · {latest?.label ?? '—'}
          </p>
        </div>

        <div style={{
          background: '#161616', border: '1px solid #222',
          borderRadius: 8, padding: '8px 14px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 10, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.06em' }}>7-Day Avg</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#c8a96e' }}>{avg}%</p>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[...data].reverse()} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#444', fontSize: 9 }}
              axisLine={{ stroke: '#222' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#444', fontSize: 9 }}
              axisLine={{ stroke: '#222' }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <Bar dataKey="efficiency" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {[...data].reverse().map((entry, index) => {
                const { color } = getRatingLabel(entry.efficiency);
                return <Cell key={`cell-${index}`} fill={`${color}99`} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Session list */}
      <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 8 }}>
        <p style={{ fontSize: 10, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Recent Sessions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {data.slice(0, 5).map((session) => {
            const { color } = getRatingLabel(session.efficiency);
            return (
              <div key={session.date} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontSize: 11, color: '#7a7570', width: 60, flexShrink: 0 }}>{session.label}</p>
                <div style={{
                  flex: 1, height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${session.efficiency}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 2,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <p style={{ fontSize: 11, color, fontWeight: 600, width: 36, textAlign: 'right' }}>
                  {session.efficiency}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
