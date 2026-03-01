import { useState } from 'react';
import { getCalendarData } from '../data/mockData';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function volumeToColor(volume, maxVolume) {
  if (!volume) return '#1a1a1a';
  const intensity = volume / maxVolume;
  if (intensity > 0.8) return '#c8a96e';
  if (intensity > 0.6) return '#a07840';
  if (intensity > 0.4) return '#6b5030';
  if (intensity > 0.2) return '#3d3020';
  return '#241e14';
}

export default function TrainingCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const calendarData = getCalendarData();
  const maxVolume = Math.max(...Object.values(calendarData), 1);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const todayStr = today.toISOString().split('T')[0];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            Training Calendar
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#f0ece4' }}>
            {MONTHS[month]} {year}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={prevMonth}
            style={{
              background: '#161616', border: '1px solid #2a2a2a',
              color: '#7a7570', borderRadius: 6, padding: '4px 10px',
              cursor: 'pointer', fontSize: 14, lineHeight: 1,
            }}
          >‹</button>
          <button
            onClick={nextMonth}
            style={{
              background: '#161616', border: '1px solid #2a2a2a',
              color: '#7a7570', borderRadius: 6, padding: '4px 10px',
              cursor: 'pointer', fontSize: 14, lineHeight: 1,
            }}
          >›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {DAYS.map((d) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10,
            color: '#444', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, flex: 1 }}>
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const volume = calendarData[dateStr] || 0;
          const isToday = dateStr === todayStr;
          const isFuture = new Date(dateStr) > today;

          return (
            <div
              key={dateStr}
              title={volume ? `${dateStr}: ${volume.toLocaleString()} lbs` : dateStr}
              style={{
                aspectRatio: '1',
                borderRadius: 4,
                background: isFuture ? 'transparent' : volumeToColor(volume, maxVolume),
                border: isToday ? '1px solid #c8a96e' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: volume > 0 ? '#f0ece4' : isFuture ? '#2a2a2a' : '#444',
                fontWeight: isToday ? 700 : 400,
                cursor: volume ? 'pointer' : 'default',
                transition: 'opacity 0.1s',
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 8, borderTop: '1px solid #1a1a1a' }}>
        <span style={{ fontSize: 10, color: '#444' }}>Low</span>
        {['#241e14', '#3d3020', '#6b5030', '#a07840', '#c8a96e'].map((c) => (
          <div key={c} style={{
            width: 14, height: 14, borderRadius: 3, background: c,
          }} />
        ))}
        <span style={{ fontSize: 10, color: '#444' }}>High</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          {[
            {
              label: 'Sessions',
              value: Object.keys(calendarData).filter((d) => {
                const dt = new Date(d);
                return dt.getMonth() === month && dt.getFullYear() === year;
              }).length,
            },
            {
              label: 'Vol (K)',
              value: Math.round(
                Object.entries(calendarData)
                  .filter(([d]) => {
                    const dt = new Date(d);
                    return dt.getMonth() === month && dt.getFullYear() === year;
                  })
                  .reduce((sum, [, v]) => sum + v, 0) / 1000
              ),
            },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 10, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#c8a96e' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
