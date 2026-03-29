import React from 'react';

// ─── Equipment detection ─────────────────────────────────────────────────────

type EquipmentType = 'barbell' | 'dumbbell' | 'cable' | 'kettlebell' | null;

function detectEquipment(name: string): EquipmentType {
  const n = name.toLowerCase();

  // Explicit mentions first
  if (n.includes('dumbbell') || n.includes('dumbell') || n.match(/\bdb\b/)) return 'dumbbell';
  if (n.includes('kettlebell') || n.includes('kettle bell') || n.match(/\bkb\b/)) return 'kettlebell';
  if (
    n.includes('cable') || n.includes('rope') ||
    n.includes('pulldown') || n.includes('push-down') || n.includes('pushdown') ||
    n.includes('face pull') || n.includes('lat pull') ||
    n.includes('tricep push') || n.includes('tricep pull')
  ) return 'cable';

  // Inferred barbell exercises
  if (
    n.includes('barbell') ||
    n.includes('bench press') || n.includes('incline press') || n.includes('decline press') ||
    n.includes('squat') && !n.includes('goblet') ||
    n.includes('deadlift') ||
    n.includes('overhead press') || n.includes(' ohp') ||
    n.includes('bent over row') || n.includes('barbell row') ||
    n.includes('romanian') || n.includes('rdl') ||
    n.includes('hip thrust') ||
    n.includes('good morning') ||
    n.includes('snatch') || n.includes('clean and') ||
    n.includes('front squat') || n.includes('back squat')
  ) return 'barbell';

  return null;
}

// ─── Plate helpers ────────────────────────────────────────────────────────────

const PLATE_SPECS = [
  { weight: 25,   color: '#ef4444', h: 54, w: 13 },
  { weight: 20,   color: '#3b82f6', h: 48, w: 12 },
  { weight: 15,   color: '#facc15', h: 42, w: 10 },
  { weight: 10,   color: '#22c55e', h: 36, w:  9 },
  { weight: 5,    color: '#e5e7eb', h: 28, w:  7 },
  { weight: 2.5,  color: '#f97316', h: 22, w:  5 },
  { weight: 1.25, color: '#9ca3af', h: 16, w:  4 },
];
const BAR_KG = 20;

function platesPerSide(total: number) {
  let rem = Math.max(0, Math.round(((total - BAR_KG) / 2) * 100) / 100);
  const out: typeof PLATE_SPECS[0][] = [];
  for (const spec of PLATE_SPECS) {
    while (rem >= spec.weight - 0.001) {
      out.push(spec);
      rem = Math.round((rem - spec.weight) * 100) / 100;
      if (out.length >= 5) return out; // cap at 5 plates per side
    }
  }
  return out;
}

// ─── Barbell ─────────────────────────────────────────────────────────────────

function BarbellVisual({ weight }: { weight: number }) {
  const W = 320, H = 72, cy = H / 2;
  const barH = 9;

  // Fixed geometry
  const gripL = 108, gripR = 212;           // knurled grip zone
  const collarLx = gripL - 12, collarRx = gripR + 5; // collar start x
  const collarW = 7, collarH = 30;
  const endCapW = 10, endCapH = 18;

  const plates = platesPerSide(weight);

  // Stack plates outward from collar
  let lx = collarLx;
  const leftPlates = plates.map(p => { lx -= p.w + 1; return { ...p, x: lx }; });

  let rx = collarRx + collarW;
  const rightPlates = plates.map(p => { const x = rx + 1; rx += p.w + 1; return { ...p, x }; });

  const barLeft  = Math.max(6, lx - endCapW - 2);
  const barRight = Math.min(W - 6, rx + endCapW + 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" style={{ maxWidth: 420 }}>
      {/* Main bar */}
      <rect x={barLeft} y={cy - barH / 2} width={barRight - barLeft} height={barH} rx={4} fill="#6b7280" />

      {/* Grip knurling */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={gripL + i * 7.5} y={cy - barH / 2 - 1} width={4} height={barH + 2} rx={1} fill="#374151" />
      ))}

      {/* Left end-cap */}
      <rect x={barLeft} y={cy - endCapH / 2} width={endCapW} height={endCapH} rx={3} fill="#9ca3af" />
      {/* Right end-cap */}
      <rect x={barRight - endCapW} y={cy - endCapH / 2} width={endCapW} height={endCapH} rx={3} fill="#9ca3af" />

      {/* Collars */}
      <rect x={collarLx} y={cy - collarH / 2} width={collarW} height={collarH} rx={2} fill="#d1d5db" />
      <rect x={collarRx} y={cy - collarH / 2} width={collarW} height={collarH} rx={2} fill="#d1d5db" />

      {/* Left plates */}
      {leftPlates.map((p, i) => (
        <g key={`l${i}`}>
          <rect x={p.x} y={cy - p.h / 2} width={p.w} height={p.h} rx={2} fill={p.color} />
          <rect x={p.x} y={cy - 2} width={p.w} height={4} rx={1} fill="rgba(0,0,0,0.3)" />
        </g>
      ))}

      {/* Right plates */}
      {rightPlates.map((p, i) => (
        <g key={`r${i}`}>
          <rect x={p.x} y={cy - p.h / 2} width={p.w} height={p.h} rx={2} fill={p.color} />
          <rect x={p.x} y={cy - 2} width={p.w} height={4} rx={1} fill="rgba(0,0,0,0.3)" />
        </g>
      ))}

      {/* Weight label */}
      <text x={W / 2} y={cy + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="sans-serif">
        {weight > 0 ? `${weight} kg` : `bar ${BAR_KG} kg`}
      </text>
    </svg>
  );
}

// ─── Dumbbell ─────────────────────────────────────────────────────────────────

function DumbbellVisual({ weight }: { weight: number }) {
  // Scale the dumbbell size with weight
  const scale = weight <= 5 ? 0.6 : weight <= 10 ? 0.72 : weight <= 20 ? 0.85 : weight <= 35 ? 1.0 : 1.15;
  const plateR  = Math.round(22 * scale);
  const plateW  = Math.round(10 * scale);
  const innerR  = Math.round(14 * scale);
  const handleL = Math.round(44 * scale);

  // Color by weight range
  const color =
    weight <= 8  ? '#3b82f6' :
    weight <= 16 ? '#22c55e' :
    weight <= 28 ? '#f97316' : '#ef4444';

  const W = 140, H = 70, cy = H / 2, cx = W / 2;
  const hs = cx - handleL / 2, he = cx + handleL / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-20" style={{ width: 180 }}>
      {/* Handle */}
      <rect x={hs} y={cy - 3.5} width={handleL} height={7} rx={3.5} fill="#9ca3af" />

      {/* Left outer plate */}
      <rect x={hs - plateW - 2} y={cy - plateR} width={plateW} height={plateR * 2} rx={3} fill={color} opacity={0.7} />
      {/* Left inner plate */}
      <rect x={hs - innerR / 2 - 1} y={cy - innerR} width={innerR / 2} height={innerR * 2} rx={2} fill={color} />

      {/* Right inner plate */}
      <rect x={he + 1} y={cy - innerR} width={innerR / 2} height={innerR * 2} rx={2} fill={color} />
      {/* Right outer plate */}
      <rect x={he + 2} y={cy - plateR} width={plateW} height={plateR * 2} rx={3} fill={color} opacity={0.7} />

      {/* Weight label */}
      {weight > 0 && (
        <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="sans-serif">
          {weight} kg
        </text>
      )}
    </svg>
  );
}

// ─── Cable / Rope ─────────────────────────────────────────────────────────────

function CableVisual({ weight }: { weight: number }) {
  const ropeW  = weight <= 10 ? 2 : weight <= 25 ? 3 : weight <= 50 ? 4.5 : 6;
  const ropeColor = weight <= 10 ? '#9ca3af' : weight <= 30 ? '#6b7280' : '#374151';
  const stackH = Math.min(72, Math.max(12, weight * 0.9));

  const W = 110, H = 130;
  const cx = 42; // cable x-center

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-36" style={{ width: 140 }}>
      {/* Mounting bracket */}
      <rect x={cx - 12} y={4} width={24} height={8} rx={3} fill="#4b5563" />

      {/* Pulley wheel */}
      <circle cx={cx} cy={18} r={9} fill="none" stroke="#9ca3af" strokeWidth={2.5} />
      <circle cx={cx} cy={18} r={3} fill="#6b7280" />

      {/* Cable */}
      <line x1={cx} y1={27} x2={cx} y2={105} stroke={ropeColor} strokeWidth={ropeW} strokeLinecap="round" />

      {/* Weight stack */}
      <rect x={62} y={18} width={30} height={stackH} rx={3} fill="#374151" stroke="#4b5563" strokeWidth={1} />
      {/* Stack plates (horizontal lines) */}
      {Array.from({ length: Math.floor(stackH / 10) }).map((_, i) => (
        <line key={i} x1={63} y1={18 + i * 10 + 8} x2={91} y2={18 + i * 10 + 8} stroke="#4b5563" strokeWidth={1} />
      ))}
      {/* Selector pin */}
      <line x1={60} y1={18 + stackH * 0.55} x2={62} y2={18 + stackH * 0.55} stroke="#facc15" strokeWidth={2} />
      <circle cx={60} cy={18 + stackH * 0.55} r={2.5} fill="#facc15" />
      {/* Weight on stack */}
      {weight > 0 && (
        <text x={77} y={18 + stackH / 2 + 4} textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="sans-serif">
          {weight}kg
        </text>
      )}

      {/* Handle at bottom */}
      <rect x={cx - 11} y={103} width={22} height={8} rx={4} fill="#9ca3af" />
      <rect x={cx - 3} y={99} width={6} height={6} rx={1} fill="#6b7280" />
    </svg>
  );
}

// ─── Kettlebell ───────────────────────────────────────────────────────────────

function KettlebellVisual({ weight }: { weight: number }) {
  const scale = weight <= 8 ? 0.7 : weight <= 16 ? 0.85 : weight <= 24 ? 1.0 : weight <= 32 ? 1.15 : 1.3;
  const r     = Math.round(20 * scale);
  const color =
    weight <= 12 ? '#3b82f6' :
    weight <= 24 ? '#22c55e' :
    weight <= 36 ? '#f97316' : '#ef4444';

  const W = 90, H = 100, cx = W / 2, bcy = 68;
  const handleW = r * 1.1, handleH = r * 0.35;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-32" style={{ width: 120 }}>
      {/* Handle arc */}
      <path
        d={`M ${cx - handleW} ${bcy - r * 0.72}
            A ${handleW} ${r * 1.05} 0 0 1 ${cx + handleW} ${bcy - r * 0.72}`}
        fill="none"
        stroke={color}
        strokeWidth={Math.round(handleH)}
        strokeLinecap="round"
      />
      {/* Body */}
      <circle cx={cx} cy={bcy} r={r} fill={color} />
      {/* Highlight */}
      <circle cx={cx - r * 0.3} cy={bcy - r * 0.3} r={r * 0.22} fill="rgba(255,255,255,0.18)" />
      {/* Weight */}
      {weight > 0 && (
        <text x={cx} y={bcy + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="sans-serif">
          {weight}kg
        </text>
      )}
    </svg>
  );
}

// ─── Legend strip for barbell ─────────────────────────────────────────────────

function PlateLegend({ weight }: { weight: number }) {
  const plates = platesPerSide(weight);
  const unique = [...new Map(plates.map(p => [p.weight, p])).values()];
  if (unique.length === 0) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap mt-1 justify-center">
      {unique.map(p => (
        <span key={p.weight} className="flex items-center gap-1 text-[10px] text-gray-400">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
          {p.weight}kg
        </span>
      ))}
      <span className="text-[10px] text-gray-500">× 2 sides</span>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface ExerciseVisualizerProps {
  name: string;
  weight: number; // kg
}

export function ExerciseVisualizer({ name, weight }: ExerciseVisualizerProps) {
  const type = detectEquipment(name);
  if (!type) return null;

  return (
    <div className="flex flex-col items-center py-3 px-4 my-3 bg-lb-darker/60 rounded-xl border border-white/5">
      {type === 'barbell'    && <BarbellVisual    weight={weight} />}
      {type === 'dumbbell'   && <DumbbellVisual   weight={weight} />}
      {type === 'cable'      && <CableVisual      weight={weight} />}
      {type === 'kettlebell' && <KettlebellVisual weight={weight} />}
      {type === 'barbell'    && <PlateLegend      weight={weight} />}
    </div>
  );
}
