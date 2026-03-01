import { getCalendarData } from '../data/mockData';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Sigmoid 0-1 same as effort rating — maps volume to a 0-1 scale
function volumeToRating(volume) {
  if (!volume) return 0;
  const k = 0.0006;
  const midpoint = 5000;
  return 1 / (1 + Math.exp(-k * (volume - midpoint)));
}

function ratingToColor(rating) {
  if (rating === 0) return 'var(--grid-line)';
  // same warm gold gradient as muscle heatmap
  const stops = [
    { r: 241, g: 242, b: 255 }, // ~0.1 — near-white blue tint (light mode friendly)
    { r: 255, g: 236, b: 195 }, // ~0.3 — pale gold
    { r: 200, g: 169, b: 110 }, // ~0.6 — gold
    { r: 160, g: 110, b: 50  }, // ~0.8 — deep gold
    { r: 120, g: 70,  b: 20  }, // 1.0  — amber
  ];
  const idx = rating * (stops.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, stops.length - 1);
  const t = idx - lo;
  const lerp = (a, b) => Math.round(a + t * (b - a));
  const c = stops[lo];
  const n = stops[hi];
  return `rgb(${lerp(c.r, n.r)},${lerp(c.g, n.g)},${lerp(c.b, n.b)})`;
}

// Build an array of 8 weeks ending today, Mon-Sun
function buildWeeks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the most recent Sunday
  const endSunday = new Date(today);
  endSunday.setDate(today.getDate() + (7 - today.getDay()) % 7);
  // Actually, let's end at the upcoming Saturday so current week is included
  const endSat = new Date(today);
  endSat.setDate(today.getDate() + (6 - today.getDay()));

  const weeks = [];
  for (let w = 7; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(endSat);
      date.setDate(endSat.getDate() - w * 7 - (6 - d));
      week.push(date);
    }
    weeks.push(week);
  }
  return weeks;
}

// Scale bar on the right: 0 → 1
function RatingScale() {
  const steps = 6;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      paddingLeft: 8,
      flexShrink: 0,
    }}>
      <p style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 2 }}>1.0</p>
      <div style={{
        width: 10,
        flex: 1,
        borderRadius: 4,
        background: 'linear-gradient(to bottom, rgb(120,70,20), rgb(160,110,50), rgb(200,169,110), rgb(255,236,195))',
        minHeight: 0,
      }} />
      <p style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>0</p>
    </div>
  );
}

export default function TrainingCalendar() {
  const calendarData = getCalendarData();
  const weeks = buildWeeks();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>
            Training Calendar
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>8 Weeks &middot; Rating 0\u20131</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {(() => {
            const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            let sessions = 0;
            let vol = 0;
            Object.entries(calendarData).forEach(([d, v]) => {
              const dt = new Date(d);
              if (dt >= thisMonthStart && dt <= today) { sessions++; vol += v; }
            });
            return [
              { label: 'Sessions', value: sessions },
              { label: 'Vol (K)', value: Math.round(vol / 1000) },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{value}</p>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Day-of-week header + scale label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <div style={{ width: 56, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {DAYS.map((d) => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 8,
              color: 'var(--text-muted)', fontWeight: 600,
              textTransform: 'uppercase',
            }}>{d}</div>
          ))}
        </div>
        <div style={{ width: 22, flexShrink: 0 }} />
      </div>

      {/* Week rows + scale */}
      <div style={{ flex: 1, display: 'flex', gap: 4, minHeight: 0 }}>
        {/* Week rows */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {weeks.map((week, wi) => {
            const weekStart = week[0];
            const label = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            return (
              <div key={wi} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                {/* Week label */}
                <div style={{ width: 52, flexShrink: 0, textAlign: 'right', paddingRight: 4 }}>
                  <p style={{ fontSize: 8, color: 'var(--text-muted)', lineHeight: 1 }}>{label}</p>
                </div>
                {/* Day cells */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                  {week.map((date, di) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const volume = calendarData[dateStr] || 0;
                    const rating = volumeToRating(volume);
                    const isFuture = date > today;
                    const isToday = date.toDateString() === today.toDateString();
                    const bg = isFuture ? 'transparent' : ratingToColor(rating);

                    return (
                      <div
                        key={di}
                        title={volume ? `${dateStr}\nVol: ${volume.toLocaleString()} lbs\nRating: ${rating.toFixed(2)}` : dateStr}
                        style={{
                          aspectRatio: '1',
                          borderRadius: 3,
                          background: bg,
                          border: isToday
                            ? '1.5px solid var(--accent)'
                            : isFuture
                              ? '1px solid var(--grid-line)'
                              : '1px solid transparent',
                          cursor: volume ? 'pointer' : 'default',
                          position: 'relative',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rating scale */}
        <RatingScale />
      </div>
    </div>
  );
}
