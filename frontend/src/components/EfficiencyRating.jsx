import { getEfficiencyData } from '../data/mockData';

/**
 * QB-style effort rating: maps raw training volume to 0–1
 * using a logistic sigmoid so you never need Xmax/Xmin.
 *
 * rating = 1 / (1 + e^(-k * (volume - midpoint)))
 *
 * midpoint = 5000 lbs (a solid session)
 * k        = 0.0006  (slope — spreads the curve nicely over 0–15k range)
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

export default function EfficiencyRating() {
  const data = getEfficiencyData();
  const latest = data[0];
  const rating = latest ? computeRating(latest.volume) : 0;
  const { label: rLabel, color: rColor } = getRatingLabel(rating);

  // 7-day average
  const recent = data.slice(0, 7);
  const avgRating = recent.length
    ? recent.reduce((s, d) => s + computeRating(d.volume), 0) / recent.length
    : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      {/* Big score */}
      <div>
        <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
          Effort Rating
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <p style={{ fontSize: 32, fontWeight: 800, color: rColor, lineHeight: 1 }}>
            {rating.toFixed(2)}
          </p>
          <p style={{ fontSize: 12, fontWeight: 600, color: rColor }}>{rLabel}</p>
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
          {latest?.label ?? '—'} &middot; {latest?.volume?.toLocaleString() ?? 0} lbs
        </p>
      </div>

      {/* 7-day avg badge */}
      <div style={{
        background: 'var(--bg-card-hover)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '6px 14px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>7-Day Avg</p>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{avgRating.toFixed(2)}</p>
      </div>

      {/* Mini sparkline of recent sessions */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
        {[...data].reverse().slice(-8).map((session, i) => {
          const r = computeRating(session.volume);
          const { color } = getRatingLabel(r);
          return (
            <div
              key={i}
              title={`${session.label}: ${r.toFixed(2)}`}
              style={{
                width: 6,
                height: `${Math.max(r * 100, 8)}%`,
                background: color,
                borderRadius: 2,
                opacity: 0.7,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
