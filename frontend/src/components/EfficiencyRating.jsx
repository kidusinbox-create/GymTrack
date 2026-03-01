import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getEfficiencyData } from '../data/mockData';

/**
 * QB-style sigmoid rating: 1 / (1 + e^(-k*(volume - midpoint)))
 * midpoint = 5000 lbs, k = 0.0006
 * No Xmax/Xmin needed — any volume maps naturally to (0, 1)
 */
function computeRating(volume) {
  const k = 0.0006;
  const midpoint = 5000;
  return 1 / (1 + Math.exp(-k * (volume - midpoint)));
}

const getRatingLabel = (r) => {
  if (r >= 0.90) return { label: 'Elite',    color: 'var(--accent)' };
  if (r >= 0.75) return { label: 'Strong',   color: 'var(--green)' };
  if (r >= 0.50) return { label: 'Solid',    color: 'var(--blue)' };
  if (r >= 0.30) return { label: 'Moderate', color: '#fb923c' };
  return               { label: 'Light',    color: 'var(--text-secondary)' };
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const r = payload[0].value;
  const { label: rLabel, color } = getRatingLabel(r);
  return (
    <div style={{
      background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)',
      borderRadius: 6, padding: '6px 10px', fontSize: 11,
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ color, fontWeight: 700 }}>{r.toFixed(3)} &mdash; {rLabel}</p>
    </div>
  );
};

export default function EfficiencyRating() {
  const data = getEfficiencyData();

  // Build chart data with rating
  const chartData = [...data]
    .reverse()
    .map((d) => ({
      label: d.label,
      rating: parseFloat(computeRating(d.volume).toFixed(4)),
    }));

  const latest = data[0];
  const latestRating = latest ? computeRating(latest.volume) : 0;
  const { label: rLabel, color: rColor } = getRatingLabel(latestRating);

  // 7-day average
  const recent7 = data.slice(0, 7);
  const avg7 = recent7.length
    ? recent7.reduce((s, d) => s + computeRating(d.volume), 0) / recent7.length
    : 0;
  const { color: avgColor } = getRatingLabel(avg7);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Score row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            Effort Rating
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <p style={{ fontSize: 40, fontWeight: 800, color: rColor, lineHeight: 1 }}>
              {latestRating.toFixed(2)}
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: rColor }}>{rLabel}</p>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
            {latest?.label ?? '\u2014'} &middot; {latest?.volume?.toLocaleString() ?? 0} lbs
          </p>
        </div>

        {/* 7-day avg badge */}
        <div style={{
          background: 'var(--bg-card-hover)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '8px 16px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>7-Day Avg</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: avgColor, lineHeight: 1.1 }}>{avg7.toFixed(2)}</p>
          <p style={{ fontSize: 9, color: avgColor }}>{getRatingLabel(avg7).label}</p>
        </div>
      </div>

      {/* Line chart — 7-day average trend */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          Rating Trend
        </p>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 14 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
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
              domain={[0, 1]}
              tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
              axisLine={{ stroke: 'var(--grid-line)' }}
              tickLine={false}
              ticks={[0, 0.25, 0.5, 0.75, 1.0]}
              tickFormatter={(v) => v.toFixed(2)}
              width={36}
              label={{
                value: 'Rating',
                angle: -90,
                position: 'insideLeft',
                offset: 14,
                style: { fontSize: 8, fill: 'var(--text-muted)' },
              }}
            />
            <Tooltip content={<ChartTooltip />} />
            {/* Reference bands */}
            <ReferenceLine y={0.75} stroke="var(--green)" strokeDasharray="4 2" strokeOpacity={0.4} />
            <ReferenceLine y={0.50} stroke="var(--blue)"  strokeDasharray="4 2" strokeOpacity={0.3} />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
