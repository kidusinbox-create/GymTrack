import { getMuscleData } from '../data/mockData';

const MUSCLE_MAP = {
  chest:       'Chest',
  front_delts: 'Front Delts',
  side_delts:  'Side Delts',
  rear_delts:  'Rear Delts',
  biceps:      'Biceps',
  triceps:     'Triceps',
  lats:        'Lats',
  traps:       'Traps',
  quads:       'Quads',
  hamstrings:  'Hamstrings',
  glutes:      'Glutes',
  lower_back:  'Lower Back',
  abs:         'Abs',
  calves:      'Calves',
};

// Compute 3-stop radial gradient colours for a muscle given its 0-1 activation.
// Inactive → steel-blue-gray; Activated → warm amber-gold.
function muscleGrad(activation) {
  const inactive = [42, 46, 55];
  const active   = [205, 152, 45];
  const t = Math.min(activation * 1.4, 1);
  const base  = inactive.map((v, i) => Math.round(v + t * (active[i] - v)));
  const light = base.map((v) => Math.min(v + 62, 255));
  const dark  = base.map((v) => Math.max(v - 38, 0));
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  return { light: rgb(light), base: rgb(base), dark: rgb(dark) };
}

// Inert body-part colour (head, forearms, joints, etc.)
const BODY = {
  light: 'rgb(72,76,88)',
  base:  'rgb(42,46,55)',
  dark:  'rgb(22,24,30)',
};

// ── Gradient definitions ─────────────────────────────────────────────────────
// Each muscle and body part gets its own radialGradient.
// cx/cy at 30%/25% simulates a consistent upper-left light source.

function Defs({ muscleData, prefix }) {
  const keys = Object.keys(MUSCLE_MAP);
  return (
    <defs>
      <filter id={`${prefix}-shadow`} x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
      </filter>
      {/* Body base */}
      <radialGradient id={`${prefix}-body`} cx="30%" cy="25%" r="75%">
        <stop offset="0%"   stopColor={BODY.light} />
        <stop offset="48%"  stopColor={BODY.base}  />
        <stop offset="100%" stopColor={BODY.dark}  />
      </radialGradient>
      {/* Per-muscle */}
      {keys.map((k) => {
        const { light, base, dark } = muscleGrad(muscleData[k] || 0);
        return (
          <radialGradient key={k} id={`${prefix}-${k}`} cx="32%" cy="26%" r="72%">
            <stop offset="0%"   stopColor={light} />
            <stop offset="46%"  stopColor={base}  />
            <stop offset="100%" stopColor={dark}  />
          </radialGradient>
        );
      })}
      {/* Edge-highlight overlay that goes on TOP of every shape */}
      <radialGradient id={`${prefix}-hi`} cx="28%" cy="22%" r="68%">
        <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
        <stop offset="55%"  stopColor="white" stopOpacity="0"    />
        <stop offset="100%" stopColor="black" stopOpacity="0.28" />
      </radialGradient>
    </defs>
  );
}

// Shorthand helpers used inside the SVG components
const fill  = (prefix, key) => `url(#${prefix}-${key})`;
const bodyF = (prefix)      => `url(#${prefix}-body)`;
const hiF   = (prefix)      => `url(#${prefix}-hi)`;

// Applies the highlight overlay over any shape with the same path
function Hi({ prefix, d, cx, cy, rx, ry, r, shape = 'path', ...rest }) {
  const f = hiF(prefix);
  if (shape === 'ellipse') return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={f} {...rest} />;
  if (shape === 'circle')  return <circle  cx={cx} cy={cy} r={r}           fill={f} {...rest} />;
  return <path d={d} fill={f} {...rest} />;
}

// ── FRONT view ───────────────────────────────────────────────────────────────
function BodyFront({ muscleData, p = 'f' }) {
  const m  = (k) => fill(p, k);
  const b  = bodyF(p);
  const hi = hiF(p);

  return (
    <svg viewBox="0 0 120 268" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <Defs muscleData={muscleData} prefix={p} />

      {/* ── Overall silhouette shadow ── */}
      <g filter={`url(#${p}-shadow)`}>

        {/* Head */}
        <ellipse cx="60" cy="16" rx="13" ry="15" fill={b} />
        <ellipse cx="60" cy="16" rx="13" ry="15" fill={hi} />

        {/* Neck */}
        <rect x="55" y="29" width="10" height="10" rx="4" fill={b} />
        <rect x="55" y="29" width="10" height="10" rx="4" fill={hi} />

        {/* ── Torso background ── */}
        <path d="M35,39 Q22,48 20,82 L20,128 Q20,134 27,134 L93,134 Q100,134 100,128 L100,82 Q98,48 85,39 Z"
          fill={b} />
        <path d="M35,39 Q22,48 20,82 L20,128 Q20,134 27,134 L93,134 Q100,134 100,128 L100,82 Q98,48 85,39 Z"
          fill={hi} />

        {/* ── Front Deltoids ── */}
        <ellipse cx="26" cy="50" rx="9"  ry="11" fill={m('front_delts')} />
        <ellipse cx="26" cy="50" rx="9"  ry="11" fill={hi} />
        <ellipse cx="94" cy="50" rx="9"  ry="11" fill={m('front_delts')} />
        <ellipse cx="94" cy="50" rx="9"  ry="11" fill={hi} />

        {/* ── Side Deltoids ── */}
        <ellipse cx="16" cy="60" rx="7"  ry="9"  fill={m('side_delts')} />
        <ellipse cx="16" cy="60" rx="7"  ry="9"  fill={hi} />
        <ellipse cx="104" cy="60" rx="7" ry="9"  fill={m('side_delts')} />
        <ellipse cx="104" cy="60" rx="7" ry="9"  fill={hi} />

        {/* ── Chest (Pectorals) ── */}
        <path d="M35,40 Q28,40 24,52 Q21,62 26,70 Q32,76 50,74 L55,60 L55,40 Z"
          fill={m('chest')} />
        <path d="M35,40 Q28,40 24,52 Q21,62 26,70 Q32,76 50,74 L55,60 L55,40 Z"
          fill={hi} />
        <path d="M85,40 Q92,40 96,52 Q99,62 94,70 Q88,76 70,74 L65,60 L65,40 Z"
          fill={m('chest')} />
        <path d="M85,40 Q92,40 96,52 Q99,62 94,70 Q88,76 70,74 L65,60 L65,40 Z"
          fill={hi} />

        {/* ── Abs (6 bricks) ── */}
        {[[49,78],[62,78],[49,91],[62,91],[49,104],[62,104]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width="10" height="10" rx="2.5" fill={m('abs')} />
            <rect x={x} y={y} width="10" height="10" rx="2.5" fill={hi} />
          </g>
        ))}

        {/* ── Biceps ── */}
        <path d="M14,67 Q8,78 9,94 Q12,100 17,98 Q22,88 20,68 Z"  fill={m('biceps')} />
        <path d="M14,67 Q8,78 9,94 Q12,100 17,98 Q22,88 20,68 Z"  fill={hi} />
        <path d="M106,67 Q112,78 111,94 Q108,100 103,98 Q98,88 100,68 Z" fill={m('biceps')} />
        <path d="M106,67 Q112,78 111,94 Q108,100 103,98 Q98,88 100,68 Z" fill={hi} />

        {/* ── Forearms ── */}
        <path d="M10,100 Q7,116 9,130 L16,130 Q18,116 18,100 Z" fill={b} />
        <path d="M10,100 Q7,116 9,130 L16,130 Q18,116 18,100 Z" fill={hi} />
        <path d="M110,100 Q113,116 111,130 L104,130 Q102,116 102,100 Z" fill={b} />
        <path d="M110,100 Q113,116 111,130 L104,130 Q102,116 102,100 Z" fill={hi} />

        {/* Hands */}
        <ellipse cx="12"  cy="135" rx="6" ry="8" fill={b} />
        <ellipse cx="108" cy="135" rx="6" ry="8" fill={b} />

        {/* Hip / pelvis */}
        <path d="M27,134 L93,134 L97,158 L23,158 Z" fill={b} />
        <path d="M27,134 L93,134 L97,158 L23,158 Z" fill={hi} />

        {/* ── Quads ── */}
        <path d="M26,158 Q23,185 27,208 Q33,215 43,212 Q50,196 48,158 Z" fill={m('quads')} />
        <path d="M26,158 Q23,185 27,208 Q33,215 43,212 Q50,196 48,158 Z" fill={hi} />
        <path d="M94,158 Q97,185 93,208 Q87,215 77,212 Q70,196 72,158 Z" fill={m('quads')} />
        <path d="M94,158 Q97,185 93,208 Q87,215 77,212 Q70,196 72,158 Z" fill={hi} />

        {/* Knees */}
        <ellipse cx="36"  cy="216" rx="11" ry="9" fill={b} />
        <ellipse cx="84"  cy="216" rx="11" ry="9" fill={b} />

        {/* Shins */}
        <path d="M26,224 Q25,242 27,254 L44,254 Q46,242 45,224 Z" fill={b} />
        <path d="M76,224 Q75,242 77,254 L94,254 Q96,242 95,224 Z" fill={b} />

        {/* Feet */}
        <ellipse cx="36"  cy="258" rx="11" ry="6" fill={b} />
        <ellipse cx="84"  cy="258" rx="11" ry="6" fill={b} />
      </g>
    </svg>
  );
}

// ── BACK view ────────────────────────────────────────────────────────────────
function BodyBack({ muscleData, p = 'bk' }) {
  const m  = (k) => fill(p, k);
  const b  = bodyF(p);
  const hi = hiF(p);

  return (
    <svg viewBox="0 0 120 268" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <Defs muscleData={muscleData} prefix={p} />

      <g filter={`url(#${p}-shadow)`}>

        {/* Head */}
        <ellipse cx="60" cy="16" rx="13" ry="15" fill={b} />
        <ellipse cx="60" cy="16" rx="13" ry="15" fill={hi} />

        {/* Neck */}
        <rect x="55" y="29" width="10" height="10" rx="4" fill={b} />
        <rect x="55" y="29" width="10" height="10" rx="4" fill={hi} />

        {/* Torso background */}
        <path d="M35,39 Q22,48 20,82 L20,128 Q20,134 27,134 L93,134 Q100,134 100,128 L100,82 Q98,48 85,39 Z"
          fill={b} />
        <path d="M35,39 Q22,48 20,82 L20,128 Q20,134 27,134 L93,134 Q100,134 100,128 L100,82 Q98,48 85,39 Z"
          fill={hi} />

        {/* ── Traps ── */}
        <path d="M53,31 Q38,36 33,46 Q43,43 53,45 Z" fill={m('traps')} />
        <path d="M53,31 Q38,36 33,46 Q43,43 53,45 Z" fill={hi} />
        <path d="M67,31 Q82,36 87,46 Q77,43 67,45 Z" fill={m('traps')} />
        <path d="M67,31 Q82,36 87,46 Q77,43 67,45 Z" fill={hi} />

        {/* ── Rear Deltoids ── */}
        <ellipse cx="26" cy="50" rx="9"  ry="11" fill={m('rear_delts')} />
        <ellipse cx="26" cy="50" rx="9"  ry="11" fill={hi} />
        <ellipse cx="94" cy="50" rx="9"  ry="11" fill={m('rear_delts')} />
        <ellipse cx="94" cy="50" rx="9"  ry="11" fill={hi} />

        {/* ── Lats ── */}
        <path d="M21,62 Q19,92 23,118 Q30,124 40,118 Q42,90 36,58 Z" fill={m('lats')} />
        <path d="M21,62 Q19,92 23,118 Q30,124 40,118 Q42,90 36,58 Z" fill={hi} />
        <path d="M99,62 Q101,92 97,118 Q90,124 80,118 Q78,90 84,58 Z" fill={m('lats')} />
        <path d="M99,62 Q101,92 97,118 Q90,124 80,118 Q78,90 84,58 Z" fill={hi} />

        {/* ── Lower Back ── */}
        <path d="M40,112 Q50,108 60,108 Q70,108 80,112 L80,132 Q70,135 60,135 Q50,135 40,132 Z"
          fill={m('lower_back')} />
        <path d="M40,112 Q50,108 60,108 Q70,108 80,112 L80,132 Q70,135 60,135 Q50,135 40,132 Z"
          fill={hi} />

        {/* ── Triceps ── */}
        <path d="M14,65 Q8,78 9,94 Q12,100 17,98 Q22,88 20,66 Z" fill={m('triceps')} />
        <path d="M14,65 Q8,78 9,94 Q12,100 17,98 Q22,88 20,66 Z" fill={hi} />
        <path d="M106,65 Q112,78 111,94 Q108,100 103,98 Q98,88 100,66 Z" fill={m('triceps')} />
        <path d="M106,65 Q112,78 111,94 Q108,100 103,98 Q98,88 100,66 Z" fill={hi} />

        {/* Forearms */}
        <path d="M10,100 Q7,116 9,130 L16,130 Q18,116 18,100 Z" fill={b} />
        <path d="M110,100 Q113,116 111,130 L104,130 Q102,116 102,100 Z" fill={b} />

        {/* Hands */}
        <ellipse cx="12"  cy="135" rx="6" ry="8" fill={b} />
        <ellipse cx="108" cy="135" rx="6" ry="8" fill={b} />

        {/* Hip / pelvis */}
        <path d="M27,134 L93,134 L97,158 L23,158 Z" fill={b} />
        <path d="M27,134 L93,134 L97,158 L23,158 Z" fill={hi} />

        {/* ── Glutes ── */}
        <path d="M27,136 Q36,133 50,138 Q53,154 48,162 Q38,165 27,158 Z" fill={m('glutes')} />
        <path d="M27,136 Q36,133 50,138 Q53,154 48,162 Q38,165 27,158 Z" fill={hi} />
        <path d="M93,136 Q84,133 70,138 Q67,154 72,162 Q82,165 93,158 Z" fill={m('glutes')} />
        <path d="M93,136 Q84,133 70,138 Q67,154 72,162 Q82,165 93,158 Z" fill={hi} />

        {/* ── Hamstrings ── */}
        <path d="M26,162 Q23,186 27,208 Q33,215 43,212 Q50,196 48,162 Z" fill={m('hamstrings')} />
        <path d="M26,162 Q23,186 27,208 Q33,215 43,212 Q50,196 48,162 Z" fill={hi} />
        <path d="M94,162 Q97,186 93,208 Q87,215 77,212 Q70,196 72,162 Z" fill={m('hamstrings')} />
        <path d="M94,162 Q97,186 93,208 Q87,215 77,212 Q70,196 72,162 Z" fill={hi} />

        {/* Knees */}
        <ellipse cx="36"  cy="216" rx="11" ry="9" fill={b} />
        <ellipse cx="84"  cy="216" rx="11" ry="9" fill={b} />

        {/* ── Calves ── */}
        <path d="M26,224 Q24,240 28,254 L40,254 Q43,238 42,224 Z" fill={m('calves')} />
        <path d="M26,224 Q24,240 28,254 L40,254 Q43,238 42,224 Z" fill={hi} />
        <path d="M78,224 Q76,240 80,254 L92,254 Q95,238 94,224 Z" fill={m('calves')} />
        <path d="M78,224 Q76,240 80,254 L92,254 Q95,238 94,224 Z" fill={hi} />

        {/* Feet */}
        <ellipse cx="36"  cy="258" rx="11" ry="6" fill={b} />
        <ellipse cx="84"  cy="258" rx="11" ry="6" fill={b} />
      </g>
    </svg>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function MuscleHeatmap() {
  const muscleData = getMuscleData();

  const topMuscles = Object.entries(muscleData)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 1 }}>
          Muscle Activation
        </p>
        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Last 7 days &middot; 3-D heatmap</p>
      </div>

      {/* Body figures */}
      <div style={{ flex: 1, display: 'flex', gap: 4, minHeight: 0 }}>
        {[
          { label: 'Front', comp: <BodyFront muscleData={muscleData} p="front" /> },
          { label: 'Back',  comp: <BodyBack  muscleData={muscleData} p="back"  /> },
        ].map(({ label, comp }) => (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <p style={{ fontSize: 8, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, marginBottom: 2 }}>
              {label}
            </p>
            <div style={{ flex: 1, minHeight: 0 }}>{comp}</div>
          </div>
        ))}
      </div>

      {/* Top muscles bar */}
      {topMuscles.length > 0 && (
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--grid-line)', paddingTop: 5 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {topMuscles.map(([key, intensity]) => {
              const { base } = muscleGrad(intensity);
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ fontSize: 9, color: 'var(--text-secondary)', width: 68, flexShrink: 0 }}>
                    {MUSCLE_MAP[key] ?? key}
                  </p>
                  <div style={{ flex: 1, height: 4, background: 'var(--grid-line)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round(intensity * 100)}%`, height: '100%', background: base, borderRadius: 2 }} />
                  </div>
                  <p style={{ fontSize: 9, color: 'var(--text-muted)', width: 26, textAlign: 'right' }}>
                    {Math.round(intensity * 100)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
