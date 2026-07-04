import type { PieSlice } from "../../domain/analysis";
import { formatCents } from "../format";

// Categorical palette (colour-blind friendly-ish, distinct in dark theme).
const PALETTE = [
  "#5b9dff", "#38d39f", "#ffb454", "#ff6b6b", "#b58cff",
  "#4dd0e1", "#f06292", "#9ccc65", "#ffd54f", "#a1887f",
];

function polar(cx: number, cy: number, r: number, fraction: number): [number, number] {
  // 0 fraction points straight up; clockwise.
  const angle = fraction * 2 * Math.PI - Math.PI / 2;
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

/** A donut chart with an inline legend. Pure SVG, no dependency. */
export function PieChart({ title, slices }: { title: string; slices: PieSlice[] }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const inner = r * 0.58;

  let acc = 0;
  const arcs = slices.map((s, i) => {
    const start = acc;
    acc += s.fraction;
    const end = acc;
    const color = s.key === "__autres__" ? "#6b7690" : PALETTE[i % PALETTE.length];
    return { s, start, end, color };
  });

  return (
    <div className="panel">
      <h2>{title}</h2>
      {slices.length === 0 ? (
        <p className="muted small">Aucune depense.</p>
      ) : (
        <div className="row" style={{ alignItems: "center", gap: 20 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={title}>
            {arcs.length === 1 ? (
              // A single slice can't be drawn as an arc path; use a full ring.
              <circle cx={cx} cy={cy} r={(r + inner) / 2} fill="none" stroke={arcs[0].color} strokeWidth={r - inner} />
            ) : (
              arcs.map(({ s, start, end, color }) => {
                const [x1, y1] = polar(cx, cy, r, start);
                const [x2, y2] = polar(cx, cy, r, end);
                const [x3, y3] = polar(cx, cy, inner, end);
                const [x4, y4] = polar(cx, cy, inner, start);
                const large = end - start > 0.5 ? 1 : 0;
                const d = [
                  `M ${x1} ${y1}`,
                  `A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
                  `L ${x3} ${y3}`,
                  `A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4}`,
                  "Z",
                ].join(" ");
                return <path key={s.key} d={d} fill={color} stroke="var(--panel)" strokeWidth={1} />;
              })
            )}
          </svg>
          <div style={{ flex: 1, minWidth: 180 }}>
            <table>
              <tbody>
                {arcs.map(({ s, color }) => (
                  <tr key={s.key}>
                    <td style={{ width: 16 }}>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: color }} />
                    </td>
                    <td>{s.label}</td>
                    <td className="num muted small">{Math.round(s.fraction * 100)}%</td>
                    <td className="num">{formatCents(s.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
