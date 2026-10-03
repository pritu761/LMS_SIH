interface RadarPoint {
  domain: string;
  current: number;
  required: number;
}

interface CompetencyRadarProps {
  data: RadarPoint[];
}

const SIZE = 360;
const CENTER = 180;
const RADIUS = 108;
const MAX = 100;

function polar(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER - 8 + radius * Math.sin(rad)];
}

function polygonFor(values: number[]): string {
  return values
    .map((v, i) => {
      const [x, y] = polar((i * 360) / values.length, (Math.max(0, Math.min(MAX, v)) / MAX) * RADIUS);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/**
 * Hand-rolled SVG competency radar (SSR-safe, no chart dependency):
 * "Current Level" (blue fill) vs "Required Level" (red dashed).
 * Hover/focus any vertex dot for exact scores; every value is also listed
 * as text below the chart so no information is chart-only.
 */
export function CompetencyRadar({ data }: CompetencyRadarProps) {
  const n = data.length;
  const currentPoly = polygonFor(data.map((d) => d.current));
  const requiredPoly = polygonFor(data.map((d) => d.required));
  const summary = data.map((d) => `${d.domain} ${d.current} of ${d.required}`).join('; ');

  return (
    <div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE - 20}`}
        role="img"
        aria-label={`Competency radar chart. ${summary}`}
        className="mx-auto w-full max-w-[380px]"
      >
        <title>Competency radar: current vs required levels</title>
        <desc>{summary}</desc>
        {[25, 50, 75, 100].map((ring) => (
          <polygon
            key={ring}
            points={polygonFor(new Array(n).fill(ring))}
            fill="none"
            stroke="currentColor"
            strokeOpacity={ring === 100 ? 0.35 : 0.15}
            strokeWidth={1}
            className="text-slate-500"
          />
        ))}
        {data.map((d, i) => {
          const [x2, y2] = polar((i * 360) / n, RADIUS);
          const [lx, ly] = polar((i * 360) / n, RADIUS + 26);
          return (
            <g key={d.domain}>
              <line x1={CENTER} y1={CENTER - 8} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={0.2} className="text-slate-500" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-600 font-mono dark:fill-slate-300"
                fontSize={11}
                fontWeight={700}
              >
                {d.domain}
              </text>
            </g>
          );
        })}
        <polygon points={requiredPoly} fill="none" stroke="#dc2626" strokeWidth={2} strokeDasharray="7 5" strokeLinejoin="round" />
        <polygon points={currentPoly} fill="#2563eb" fillOpacity={0.32} stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" />
        {data.map((d, i) => {
          const [x, y] = polar((i * 360) / n, (Math.max(0, Math.min(MAX, d.current)) / MAX) * RADIUS);
          const gap = Math.round(((d.required - d.current) / d.required) * 100);
          return (
            <g key={`dot-${d.domain}`}>
              <circle cx={x} cy={y} r={9} fill="transparent">
                <title>
                  {d.domain}: current {d.current}, required {d.required}, gap {gap}%
                </title>
              </circle>
              <circle cx={x} cy={y} r={4} fill="#2563eb" stroke="#fff" strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs font-bold" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="inline-block h-2.5 w-5 rounded-sm bg-[#2563eb]/60" /> Current level
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="inline-block h-0 w-5 border-t-2 border-dashed border-[#dc2626]" /> Required level
        </span>
      </div>
    </div>
  );
}
