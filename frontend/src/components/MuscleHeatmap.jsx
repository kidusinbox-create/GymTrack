import { getMuscleData } from '../data/mockData';

// Map muscle keys to SVG path IDs and display names
const MUSCLE_MAP = {
  chest:       { label: 'Chest',       side: 'front' },
  front_delts: { label: 'Front Delts', side: 'front' },
  side_delts:  { label: 'Side Delts',  side: 'front' },
  rear_delts:  { label: 'Rear Delts',  side: 'back'  },
  biceps:      { label: 'Biceps',      side: 'front' },
  triceps:     { label: 'Triceps',     side: 'back'  },
  lats:        { label: 'Lats',        side: 'back'  },
  traps:       { label: 'Traps',       side: 'back'  },
  quads:       { label: 'Quads',       side: 'front' },
  hamstrings:  { label: 'Hamstrings',  side: 'back'  },
  glutes:      { label: 'Glutes',      side: 'back'  },
  lower_back:  { label: 'Lower Back',  side: 'back'  },
  abs:         { label: 'Abs',         side: 'front' },
  calves:      { label: 'Calves',      side: 'back'  },
};

function muscleColor(intensity) {
  if (!intensity || intensity === 0) return '#1e1e1e';
  // warm gradient: dark → gold
  const r = Math.round(30 + intensity * (200 - 30));
  const g = Math.round(30 + intensity * (169 - 30));
  const b = Math.round(30 + intensity * (30 - 30));
  return `rgb(${r},${g},${b})`;
}

function BodyFront({ muscleData }) {
  const c = (key) => muscleColor(muscleData[key] || 0);
  const s = (key) => ({ fill: c(key), transition: 'fill 0.5s ease' });

  return (
    <svg viewBox="0 0 120 260" style={{ width: '100%', height: '100%' }}>
      {/* Head */}
      <ellipse cx="60" cy="18" rx="14" ry="16" fill="#2a2a2a" stroke="#333" strokeWidth="0.5" />

      {/* Neck */}
      <rect x="54" y="32" width="12" height="10" rx="3" fill="#2a2a2a" />

      {/* Torso outline */}
      <path d="M35 42 Q25 50 22 80 L22 130 Q22 135 28 135 L92 135 Q98 135 98 130 L98 80 Q95 50 85 42 Z"
        fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Chest */}
      <path d="M35 44 Q42 42 55 48 L55 75 Q48 78 38 72 Q30 60 35 44 Z" style={s('chest')} />
      <path d="M85 44 Q78 42 65 48 L65 75 Q72 78 82 72 Q90 60 85 44 Z" style={s('chest')} />

      {/* Abs */}
      <rect x="48" y="78" width="10" height="10" rx="2" style={s('abs')} />
      <rect x="62" y="78" width="10" height="10" rx="2" style={s('abs')} />
      <rect x="48" y="92" width="10" height="10" rx="2" style={s('abs')} />
      <rect x="62" y="92" width="10" height="10" rx="2" style={s('abs')} />
      <rect x="48" y="106" width="10" height="10" rx="2" style={s('abs')} />
      <rect x="62" y="106" width="10" height="10" rx="2" style={s('abs')} />

      {/* Front delts */}
      <ellipse cx="28" cy="52" rx="8" ry="10" style={s('front_delts')} />
      <ellipse cx="92" cy="52" rx="8" ry="10" style={s('front_delts')} />

      {/* Side delts */}
      <ellipse cx="20" cy="62" rx="6" ry="8" style={s('side_delts')} />
      <ellipse cx="100" cy="62" rx="6" ry="8" style={s('side_delts')} />

      {/* Biceps */}
      <path d="M15 72 Q10 80 11 95 Q14 100 18 98 Q22 88 20 74 Z" style={s('biceps')} />
      <path d="M105 72 Q110 80 109 95 Q106 100 102 98 Q98 88 100 74 Z" style={s('biceps')} />

      {/* Forearms */}
      <path d="M12 100 Q9 115 11 128 L17 128 Q18 115 18 100 Z" fill="#222" stroke="#333" strokeWidth="0.5" />
      <path d="M108 100 Q111 115 109 128 L103 128 Q102 115 102 100 Z" fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Hands */}
      <ellipse cx="13" cy="132" rx="6" ry="8" fill="#222" stroke="#333" strokeWidth="0.5" />
      <ellipse cx="107" cy="132" rx="6" ry="8" fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Hip/pelvis */}
      <path d="M28 135 L92 135 L96 158 L24 158 Z" fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Quads */}
      <path d="M26 160 Q24 185 28 205 Q34 210 42 208 Q48 185 46 158 Z" style={s('quads')} />
      <path d="M94 160 Q96 185 92 205 Q86 210 78 208 Q72 185 74 158 Z" style={s('quads')} />

      {/* Knees */}
      <ellipse cx="35" cy="212" rx="10" ry="8" fill="#222" stroke="#333" strokeWidth="0.5" />
      <ellipse cx="85" cy="212" rx="10" ry="8" fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Shins */}
      <path d="M26 220 Q25 238 27 250 L43 250 Q45 238 44 220 Z" fill="#222" stroke="#333" strokeWidth="0.5" />
      <path d="M76 220 Q75 238 77 250 L93 250 Q95 238 94 220 Z" fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Feet */}
      <ellipse cx="35" cy="253" rx="10" ry="5" fill="#222" stroke="#333" strokeWidth="0.5" />
      <ellipse cx="85" cy="253" rx="10" ry="5" fill="#222" stroke="#333" strokeWidth="0.5" />
    </svg>
  );
}

function BodyBack({ muscleData }) {
  const s = (key) => ({ fill: muscleColor(muscleData[key] || 0), transition: 'fill 0.5s ease' });

  return (
    <svg viewBox="0 0 120 260" style={{ width: '100%', height: '100%' }}>
      {/* Head */}
      <ellipse cx="60" cy="18" rx="14" ry="16" fill="#2a2a2a" stroke="#333" strokeWidth="0.5" />

      {/* Neck */}
      <rect x="54" y="32" width="12" height="10" rx="3" fill="#2a2a2a" />

      {/* Torso outline */}
      <path d="M35 42 Q25 50 22 80 L22 130 Q22 135 28 135 L92 135 Q98 135 98 130 L98 80 Q95 50 85 42 Z"
        fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Traps */}
      <path d="M54 34 Q40 40 35 50 Q45 48 54 50 Z" style={s('traps')} />
      <path d="M66 34 Q80 40 85 50 Q75 48 66 50 Z" style={s('traps')} />

      {/* Rear delts */}
      <ellipse cx="28" cy="52" rx="8" ry="10" style={s('rear_delts')} />
      <ellipse cx="92" cy="52" rx="8" ry="10" style={s('rear_delts')} />

      {/* Lats */}
      <path d="M22 65 Q20 90 24 118 Q30 122 38 115 Q40 90 35 60 Z" style={s('lats')} />
      <path d="M98 65 Q100 90 96 118 Q90 122 82 115 Q80 90 85 60 Z" style={s('lats')} />

      {/* Lower back */}
      <path d="M40 110 Q48 108 60 108 Q72 108 80 110 L80 132 Q72 135 60 135 Q48 135 40 132 Z"
        style={s('lower_back')} />

      {/* Triceps */}
      <path d="M14 72 Q9 82 10 97 Q13 102 17 100 Q21 88 19 74 Z" style={s('triceps')} />
      <path d="M106 72 Q111 82 110 97 Q107 102 103 100 Q99 88 101 74 Z" style={s('triceps')} />

      {/* Forearms */}
      <path d="M11 102 Q9 116 11 128 L17 128 Q18 116 17 102 Z" fill="#222" stroke="#333" strokeWidth="0.5" />
      <path d="M109 102 Q111 116 109 128 L103 128 Q102 116 103 102 Z" fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Hands */}
      <ellipse cx="13" cy="132" rx="6" ry="8" fill="#222" stroke="#333" strokeWidth="0.5" />
      <ellipse cx="107" cy="132" rx="6" ry="8" fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Hip/pelvis */}
      <path d="M28 135 L92 135 L96 158 L24 158 Z" fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Glutes */}
      <path d="M28 138 Q36 136 48 140 Q50 155 46 160 Q36 162 28 156 Z" style={s('glutes')} />
      <path d="M92 138 Q84 136 72 140 Q70 155 74 160 Q84 162 92 156 Z" style={s('glutes')} />

      {/* Hamstrings */}
      <path d="M27 162 Q25 185 29 205 Q35 210 43 208 Q47 185 46 162 Z" style={s('hamstrings')} />
      <path d="M93 162 Q95 185 91 205 Q85 210 77 208 Q73 185 74 162 Z" style={s('hamstrings')} />

      {/* Knees */}
      <ellipse cx="35" cy="212" rx="10" ry="8" fill="#222" stroke="#333" strokeWidth="0.5" />
      <ellipse cx="85" cy="212" rx="10" ry="8" fill="#222" stroke="#333" strokeWidth="0.5" />

      {/* Calves */}
      <path d="M27 222 Q26 238 28 250 L42 250 Q44 235 43 222 Z" style={s('calves')} />
      <path d="M77 222 Q76 238 78 250 L92 250 Q94 235 93 222 Z" style={s('calves')} />

      {/* Feet */}
      <ellipse cx="35" cy="253" rx="10" ry="5" fill="#222" stroke="#333" strokeWidth="0.5" />
      <ellipse cx="85" cy="253" rx="10" ry="5" fill="#222" stroke="#333" strokeWidth="0.5" />
    </svg>
  );
}

export default function MuscleHeatmap() {
  const muscleData = getMuscleData();

  const activeMusclePairs = Object.entries(muscleData)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
          Muscle Activation
        </p>
        <p style={{ fontSize: 13, color: '#444' }}>Last 7 days · hover for details</p>
      </div>

      {/* Body figures */}
      <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 9, color: '#444', textAlign: 'center', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Front</p>
          <div style={{ height: 'calc(100% - 18px)' }}>
            <BodyFront muscleData={muscleData} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 9, color: '#444', textAlign: 'center', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Back</p>
          <div style={{ height: 'calc(100% - 18px)' }}>
            <BodyBack muscleData={muscleData} />
          </div>
        </div>
      </div>

      {/* Top activated muscles */}
      {activeMusclePairs.length > 0 && (
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 8 }}>
          <p style={{ fontSize: 10, color: '#7a7570', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Most Worked
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {activeMusclePairs.map(([muscle, intensity]) => {
              const info = MUSCLE_MAP[muscle];
              return (
                <div key={muscle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: 11, color: '#7a7570', width: 80, flexShrink: 0 }}>
                    {info?.label ?? muscle}
                  </p>
                  <div style={{
                    flex: 1, height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.round(intensity * 100)}%`,
                      height: '100%',
                      background: muscleColor(intensity),
                      borderRadius: 2,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <p style={{ fontSize: 10, color: '#7a7570', width: 30, textAlign: 'right' }}>
                    {Math.round(intensity * 100)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Color scale */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 9, color: '#444' }}>Rest</span>
        <div style={{
          flex: 1, height: 6, borderRadius: 3,
          background: 'linear-gradient(to right, #1e1e1e, #3d2010, #6b3010, #a07840, #c8a96e)',
        }} />
        <span style={{ fontSize: 9, color: '#444' }}>Peak</span>
      </div>
    </div>
  );
}
