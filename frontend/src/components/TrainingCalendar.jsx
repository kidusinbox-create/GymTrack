import { useState, useEffect } from 'react';

const DAYS      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const NUM_WEEKS = 8;
const NUM_WINDOWS = 3; // 3 × 8 = 24 weeks total

// Same sigmoid as EfficiencyRating — keeps the scales in sync
function sigmoidRating(volume) {
  if (!volume) return 0;
  return 1 / (1 + Math.exp(-0.0006 * (volume - 5000)));
}

function ratingColor(r) {
  if (r === 0) return 'var(--bg-card-hover)';
  const stops = [
    [245, 238, 220],
    [230, 200, 140],
    [200, 160, 70],
    [160, 110, 30],
    [115, 65,  12],
  ];
  const idx = r * (stops.length - 1);
  const lo  = Math.floor(idx);
  const hi  = Math.min(lo + 1, stops.length - 1);
  const t   = idx - lo;
  const lerp = (a, b) => Math.round(a + t * (b - a));
  return `rgb(${lerp(stops[lo][0], stops[hi][0])},${lerp(stops[lo][1], stops[hi][1])},${lerp(stops[lo][2], stops[hi][2])})`;
}

// Build all windows (index 0 = most recent)
function buildWindows() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Anchor to the end-of-week Saturday that contains today
  const endSat = new Date(today);
  endSat.setDate(today.getDate() + (6 - today.getDay()));

  return Array.from({ length: NUM_WINDOWS }, (_, wi) => {
    // wi=0 is most recent, wi=1 is 8 weeks ago, etc.
    const windowEndSat = new Date(endSat);
    windowEndSat.setDate(endSat.getDate() - wi * NUM_WEEKS * 7);

    const weeks = Array.from({ length: NUM_WEEKS }, (__, wk) =>
      Array.from({ length: 7 }, (___, d) => {
        const date = new Date(windowEndSat);
        date.setDate(windowEndSat.getDate() - (NUM_WEEKS - 1 - wk) * 7 - (6 - d));
        return new Date(date);
      })
    );

    const start = weeks[0][0];
    const end   = weeks[NUM_WEEKS - 1][6];
    const fmt   = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const startWeekNum = wi * NUM_WEEKS + 1;
    const endWeekNum   = (wi + 1) * NUM_WEEKS;
    return {
      label: wi === 0
        ? `Weeks 1–${NUM_WEEKS} (Current)`
        : `Weeks ${startWeekNum}–${endWeekNum}`,
      shortLabel: `Wk ${startWeekNum}–${endWeekNum}`,
      range: `${fmt(start)} → ${fmt(end)}`,
      weeks,
    };
  });
}

// Vertical color-scale bar (0 → 1)
function ScaleBar() {
  const ticks = [1.0, 0.75, 0.5, 0.25, 0.0];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: 36, flexShrink: 0 }}>
      {ticks.map((v, i) => (
        <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', flex: i < ticks.length - 1 ? 1 : 0 }}>
          <div style={{
            flex: 1,
            height: i < ticks.length - 1 ? '100%' : 2,
            background: i < ticks.length - 1
              ? `linear-gradient(to bottom, ${ratingColor(ticks[i])}, ${ratingColor(ticks[i + 1])})`
              : ratingColor(0),
            borderRadius: i === 0 ? '3px 3px 0 0' : i === ticks.length - 2 ? '0 0 3px 3px' : 0,
            minHeight: 4,
          }} />
          <span style={{ fontSize: 8, color: 'var(--text-muted)', width: 22, textAlign: 'right', lineHeight: 1 }}>
            {v.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TrainingCalendar() {
  const [calendarData, setCalendarData] = useState({});
  const windows = buildWindows();

  useEffect(() => {
    // 24 weeks = 168 days
    fetch('/api/analytics/efficiency?days=168')
      .then((r) => r.json())
      .then((pts) => {
        const dict = {};
        pts.forEach((p) => { dict[p.date] = p.volume; });
        setCalendarData(dict);
      })
      .catch(() => {});
  }, []);
  const [winIdx, setWinIdx] = useState(0);
  const { weeks, range }   = windows[winIdx];

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Stats for selected window
  const windowVol = weeks.flat().reduce((sum, d) => {
    const ds = d.toISOString().split('T')[0];
    return sum + (calendarData[ds] || 0);
  }, 0);
  const windowSessions = weeks.flat().filter((d) => {
    const ds = d.toISOString().split('T')[0];
    return !!calendarData[ds];
  }).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>
            Training Calendar
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {range} &nbsp;&middot;&nbsp; Rating 0–1
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {[
            { label: 'Sessions', value: windowSessions },
            { label: 'Vol (K)',   value: Math.round(windowVol / 1000) },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Day-of-week headers (offset for week-label column) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <div style={{ width: 52, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {DAYS.map((d) => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 9,
              color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase',
            }}>{d}</div>
          ))}
        </div>
        <div style={{ width: 36, flexShrink: 0 }} />
      </div>

      {/* ── Week rows ── */}
      <div style={{ flex: 1, display: 'flex', gap: 4, minHeight: 0 }}>
        {/* Rows */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {weeks.map((week, wi) => {
            const weekStart = week[0];
            const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <div key={wi} style={{ flex: 1, display: 'flex', alignItems: 'stretch', gap: 4 }}>
                {/* Week date label */}
                <div style={{
                  width: 52, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: 6,
                }}>
                  <p style={{ fontSize: 8, color: 'var(--text-muted)', lineHeight: 1, textAlign: 'right' }}>{weekLabel}</p>
                </div>

                {/* Day cells — large rectangles that fill available space */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {week.map((date, di) => {
                    const ds      = date.toISOString().split('T')[0];
                    const volume  = calendarData[ds] || 0;
                    const rating  = sigmoidRating(volume);
                    const isFuture  = date > today;
                    const isToday   = ds === todayStr;
                    const bg = isFuture ? 'transparent' : (volume ? ratingColor(rating) : 'var(--bg-card-hover)');

                    return (
                      <div
                        key={di}
                        title={volume ? `${ds}\n${volume.toLocaleString()} lbs · ${rating.toFixed(2)}` : ds}
                        style={{
                          borderRadius: 4,
                          background: bg,
                          border: isToday
                            ? '1.5px solid var(--accent)'
                            : isFuture
                              ? '1px dashed var(--border)'
                              : '1px solid transparent',
                          cursor: volume ? 'pointer' : 'default',
                          minHeight: 0,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Scale bar ── */}
        <ScaleBar />
      </div>

      {/* ── Dropdown navigator ── */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 4, borderTop: '1px solid var(--grid-line)' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            value={winIdx}
            onChange={(e) => setWinIdx(Number(e.target.value))}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-input)',
              color: 'var(--text-primary)',
              padding: '5px 28px 5px 12px',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              outline: 'none',
              fontWeight: 600,
            }}
          >
            {windows.map((w, i) => (
              <option key={i} value={i}>{w.label}</option>
            ))}
          </select>
          <span style={{
            position: 'absolute', right: 10, top: '50%',
            transform: 'translateY(-50%)', pointerEvents: 'none',
            color: 'var(--accent)', fontSize: 9,
          }}>{'\u25BC'}</span>
        </div>
      </div>
    </div>
  );
}
