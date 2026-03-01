import { useState } from 'react';
import './index.css';
import ExerciseAnalytics from './components/ExerciseAnalytics';
import TrainingCalendar from './components/TrainingCalendar';
import EfficiencyRating from './components/EfficiencyRating';
import MuscleHeatmap from './components/MuscleHeatmap';
import WorkoutInput from './components/WorkoutInput';

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: 14,
      overflow: 'hidden',
      position: 'relative',
      ...style,
    }}>
      {children}
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{
        background: 'var(--bg-card-hover)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '5px 12px',
        cursor: 'pointer',
        fontSize: 13,
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s',
      }}
    >
      {theme === 'dark' ? '\u2600' : '\u263E'}
      <span style={{ fontSize: 11 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export default function App() {
  const [theme, setTheme] = useState('dark');

  return (
    <div
      data-theme={theme}
      style={{
        height: '100vh',
        background: 'var(--bg-dark)',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{
            fontSize: 18,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            GymTrack
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      {/* Main 4-bubble grid — fixed to viewport */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 10,
        flex: 1,
        minHeight: 0,
      }}>
        {/* Top Left — Exercise Analytics (4 mini charts) */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <ExerciseAnalytics />
        </Card>

        {/* Top Right — Efficiency + Workout Input stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          <Card style={{ flexShrink: 0 }}>
            <EfficiencyRating />
          </Card>
          <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <WorkoutInput />
          </Card>
        </div>

        {/* Bottom Left — Training Calendar */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <TrainingCalendar />
        </Card>

        {/* Bottom Right — Muscle Heatmap */}
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <MuscleHeatmap />
        </Card>
      </div>
    </div>
  );
}
