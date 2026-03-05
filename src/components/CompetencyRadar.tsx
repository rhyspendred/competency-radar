import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import type { CompetencyItem } from "../hooks/useCompetencyData";

const BLUE = "#3b82f6";
const ORANGE = "#f97316";
const CHART = 280;
const CX = CHART / 2;
const CY = CHART / 2;
const MAX_R = 95;
const MIN_R = 15;
const LABEL_R = 118;
const GAP = 1.5;

interface Props {
  data: CompetencyItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

export default function CompetencyRadar({ data, selectedId, onSelect }: Props) {
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 900, 1);
      setAnim(easeOut(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const n = data.length;
  const slice = 360 / n;

  return (
    <div
      className="relative mx-auto"
      style={{ width: CHART, height: CHART, overflow: "visible" }}
    >
      <PieChart width={CHART} height={CHART}>
        {data.map((item, i) => {
          const sa = 90 - i * slice + GAP / 2;
          const ea = 90 - (i + 1) * slice - GAP / 2;
          const frac = item.score / item.maxScore;
          const r = (MIN_R + frac * (MAX_R - MIN_R)) * anim;
          const sel = item.id === selectedId;

          return (
            <Pie
              key={item.id}
              data={[{ v: 1 }]}
              cx={CX}
              cy={CY}
              innerRadius={0}
              outerRadius={sel ? r + 6 : r}
              startAngle={sa}
              endAngle={ea}
              dataKey="v"
              isAnimationActive={false}
              onClick={() => onSelect(item.id)}
              stroke={sel ? "#fff" : "rgba(255,255,255,0.08)"}
              strokeWidth={sel ? 1.5 : 0.5}
            >
              <Cell
                fill={item.isTarget ? ORANGE : BLUE}
                fillOpacity={sel ? 1 : 0.55}
              />
            </Pie>
          );
        })}
      </PieChart>

      {data.map((item, i) => {
        const midDeg = 90 - (i + 0.5) * slice;
        const midRad = (midDeg * Math.PI) / 180;
        const x = CX + LABEL_R * Math.cos(midRad);
        const y = CY - LABEL_R * Math.sin(midRad);
        const cos = Math.cos(midRad);
        const sel = item.id === selectedId;
        const align: "left" | "right" | "center" =
          cos > 0.3 ? "left" : cos < -0.3 ? "right" : "center";
        const tx = cos > 0.3 ? "0%" : cos < -0.3 ? "-100%" : "-50%";

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`absolute text-[10px] leading-tight font-medium transition-colors duration-150 cursor-pointer ${
              sel ? "text-white" : "text-gray-500 hover:text-gray-400"
            }`}
            style={{
              left: x,
              top: y,
              transform: `translate(${tx}, -50%)`,
              textAlign: align,
              maxWidth: 75,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
