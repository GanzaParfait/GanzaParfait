export function BarChart({
  items,
}: {
  items: { label: string; value: number; color?: string }[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {items.map((item) => (
        <div key={item.label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", fontSize: "0.8rem" }}>
            <span style={{ fontWeight: 700, color: "#0b192c" }}>{item.label}</span>
            <span style={{ color: "#64748b", fontWeight: 700 }}>{item.value.toLocaleString()}</span>
          </div>
          <div style={{ height: "0.55rem", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.max((item.value / max) * 100, 4)}%`,
                height: "100%",
                borderRadius: "999px",
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
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
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
          {Math.round(total)}
        </text>
        <text x="74" y="90" textAnchor="middle" fontSize="10" fill="#64748b">
          mix
        </text>
      </svg>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.55rem", margin: 0, padding: 0 }}>
        {items.map((item) => (
          <li key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem" }}>
            <span style={{ width: "0.65rem", height: "0.65rem", borderRadius: "999px", background: item.color }} />
            <strong style={{ color: "#0b192c" }}>{item.label}</strong>
            <span style={{ color: "#64748b" }}>{Math.round((item.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ColumnChart({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.85rem", height: "11rem", paddingTop: "0.5rem" }}>
      {items.map((item) => (
        <div key={item.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: "0.45rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0b192c" }}>{item.value.toLocaleString()}</span>
          <div
            style={{
              width: "100%",
              maxWidth: "3rem",
              height: `${Math.max((item.value / max) * 100, 8)}%`,
              borderRadius: "0.65rem 0.65rem 0.2rem 0.2rem",
              background: "linear-gradient(180deg, #60a5fa, #0e52a8)",
            }}
          />
          <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, textAlign: "center" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
