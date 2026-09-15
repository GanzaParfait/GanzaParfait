export function BarChart({
  items,
}: {
  items: { label: string; value: number; color?: string }[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="chart-bars">
      {items.map((item) => (
        <div key={item.label} className="chart-bar-row">
          <div className="chart-bar-meta">
            <span>{item.label}</span>
            <strong>{item.value.toLocaleString()}</strong>
          </div>
          <div className="chart-bar-track">
            <div
              className="chart-bar-fill"
              style={{
                width: `${Math.max((item.value / max) * 100, 4)}%`,
                background: item.color || "linear-gradient(90deg, #0e52a8, #60a5fa)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({
  items,
  centerValue,
  centerLabel = "Sessions",
}: {
  items: { label: string; value: number; color: string }[];
  centerValue?: number | string;
  centerLabel?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const display = centerValue ?? Math.round(total);

  return (
    <div className="chart-donut">
      <svg width="148" height="148" viewBox="0 0 148 148" aria-hidden="true">
        <circle cx="74" cy="74" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="16" />
        {items.map((item) => {
          const length = (item.value / total) * circumference;
          const circle = (
            <circle
              key={item.label}
              cx="74"
              cy="74"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="16"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform="rotate(-90 74 74)"
            />
          );
          offset += length;
          return circle;
        })}
        <text x="74" y="70" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0b192c">
          {display}
        </text>
        <text x="74" y="90" textAnchor="middle" fontSize="10" fill="#64748b">
          {centerLabel}
        </text>
      </svg>
      <ul className="chart-donut-legend">
        {items.map((item) => (
          <li key={item.label}>
            <span style={{ background: item.color }} />
            <strong>{item.label}</strong>
            <em>{Math.round((item.value / total) * 100)}%</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({
  values,
  color = "#0e52a8",
}: {
  values: number[];
  color?: string;
}) {
  const points = values.length ? values : [0, 0];
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = Math.max(max - min, 1);
  const width = 120;
  const height = 36;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const path = points
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="chart-sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const cx = (current.x + next.x) / 2;
    d += ` C ${cx} ${current.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
  }
  return d;
}

export function LineChart({
  current,
  previous,
}: {
  current: { label: string; value: number }[];
  previous?: { label: string; value: number }[];
}) {
  const width = 640;
  const height = 220;
  const padX = 28;
  const padY = 24;
  const values = [...current.map((item) => item.value), ...(previous || []).map((item) => item.value)];
  const max = Math.max(...values, 1);
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const toPoints = (items: { label: string; value: number }[]) =>
    items.map((item, index) => ({
      x: padX + (items.length > 1 ? (index / (items.length - 1)) * plotW : plotW / 2),
      y: padY + plotH - (item.value / max) * plotH,
      value: item.value,
      label: item.label,
    }));

  const currentPoints = toPoints(current);
  const previousPoints = previous?.length ? toPoints(previous) : [];
  const currentPath = smoothPath(currentPoints);
  const previousPath = previousPoints.length ? smoothPath(previousPoints) : "";

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: padY + plotH - ratio * plotH,
    label: Math.round(max * ratio),
  }));

  const labelEvery = Math.max(1, Math.ceil(current.length / 6));

  return (
    <div className="chart-line-wrap">
      <svg className="chart-line" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sessions over time">
        {ticks.map((tick) => (
          <g key={tick.y}>
            <line x1={padX} x2={width - padX} y1={tick.y} y2={tick.y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={8} y={tick.y + 3} fontSize="10" fill="#94a3b8">
              {tick.label}
            </text>
          </g>
        ))}
        {previousPath ? (
          <path d={previousPath} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />
        ) : null}
        <path d={currentPath} fill="none" stroke="#0e52a8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        {currentPoints.map((point, index) => (
          <circle key={`${point.label}-${index}`} cx={point.x} cy={point.y} r="3.2" fill="#0e52a8" />
        ))}
        {current.map((item, index) =>
          index % labelEvery === 0 || index === current.length - 1 ? (
            <text key={`label-${item.label}-${index}`} x={currentPoints[index].x} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748b">
              {item.label}
            </text>
          ) : null
        )}
      </svg>
      <div className="chart-line-legend">
        <span>
          <i className="is-current" /> This period
        </span>
        <span>
          <i className="is-previous" /> Previous period
        </span>
      </div>
    </div>
  );
}
