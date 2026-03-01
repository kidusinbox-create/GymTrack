import './index.css';
import ExerciseAnalytics from './components/ExerciseAnalytics';
import TrainingCalendar from './components/TrainingCalendar';
import EfficiencyRating from './components/EfficiencyRating';
import MuscleHeatmap from './components/MuscleHeatmap';
import WorkoutInput from './components/WorkoutInput';

// Card bubble wrapper
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#111111',
      border: '1px solid #1e1e1e',
      borderRadius: 16,
      padding: 20,
      overflow: 'hidden',
      position: 'relative',
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 4,
      }}>
        <div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#f0ece4',
            letterSpacing: '-0.02em',
          }}>
            GymTrack
          </h1>
          <p style={{ fontSize: 12, color: '#444', marginTop: 1 }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>
        <div style={{
          background: '#161616',
          border: '1px solid #222',
          borderRadius: 8,
          padding: '6px 14px',
        }}>
          <p style={{ fontSize: 11, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Week 8
          </p>
        </div>
      </div>

      {/* Main 4-bubble grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'auto auto',
        gap: 12,
        flex: 1,
      }}>
        {/* Top Left — Exercise Analytics */}
        <Card style={{ minHeight: 380 }}>
          <ExerciseAnalytics />
        </Card>

        {/* Top Right — Efficiency Rating + Workout Input (stacked) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card style={{ flex: 1, minHeight: 220 }}>
            <EfficiencyRating />
          </Card>
          <Card style={{ minHeight: 260 }}>
            <WorkoutInput />
          </Card>
        </div>

        {/* Bottom Left — Training Calendar */}
        <Card style={{ minHeight: 300 }}>
          <TrainingCalendar />
        </Card>

        {/* Bottom Right — Muscle Heatmap */}
        <Card style={{ minHeight: 300 }}>
          <MuscleHeatmap />
        </Card>
      </div>
    </div>
  );
}
