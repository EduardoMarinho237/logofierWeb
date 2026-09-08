"use client";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

const PALETTE = [
  "#0e525b",
  "#2b9aa8",
  "#4ecdc4",
  "#e8a838",
  "#8c5bbf",
  "#d96a4f",
  "#5f8ce0",
  "#7a9e6a",
];

interface SegmentedSlice extends DonutSlice {
  pct: number;
  offset: number;
}

function buildSegments(slices: DonutSlice[], total: number): SegmentedSlice[] {
  let offset = 0;
  const segments: SegmentedSlice[] = [];
  slices.forEach((s, i) => {
    const pct = total > 0 ? (s.value / total) * 100 : 0;
    segments.push({
      ...s,
      pct,
      offset,
      color: s.color || PALETTE[i % PALETTE.length],
    });
    offset += pct;
  });
  return segments.filter((s) => s.pct > 0);
}

export function DonutChart({
  slices,
  centerValue,
  centerLabel,
  size = 180,
  strokeWidth = 24,
}: {
  slices: DonutSlice[];
  centerValue: string;
  centerLabel: string;
  size?: number;
  strokeWidth?: number;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const segments = buildSegments(slices, total);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e4e4eb"
          strokeWidth={strokeWidth}
          pathLength={100}
        />
        {segments.map((s) => (
          <circle
            key={s.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            pathLength={100}
            strokeDasharray={`${s.pct} ${100 - s.pct}`}
            strokeDashoffset={-s.offset}
          />
        ))}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-[#0e525b]">{centerValue}</span>
        <span className="max-w-28 text-center text-xs text-[#0e525b]/50">{centerLabel}</span>
      </div>
    </div>
  );
}