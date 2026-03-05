import { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { animate as fmAnimate } from "framer-motion";
import type { CompetencyItem } from "../hooks/useCompetencyData";

const CHART = 340;
const CX = CHART / 2;
const CY = CHART / 2;
const INNER = 24;
const OUTER = 160;
const LEVELS = 5;
const BAND = (OUTER - INNER) / LEVELS;

const SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };

const BLUE_SHADES = ["#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"];
const ORANGE_SHADES = ["#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c"];

interface Props {
  data: CompetencyItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onScoreChange: (id: string, score: number) => void;
}

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

export default function CompetencyRadar({
  data,
  selectedId,
  onSelect,
  onScoreChange,
}: Props) {
  const [anim, setAnim] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    segIndex: number;
    startDist: number;
    dragging: boolean;
    lastLevel: number;
  } | null>(null);

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

  const pulsePress = () => {
    if (!chartRef.current) return;
    fmAnimate(chartRef.current, { scale: 0.99, opacity: 0.95 }, SPRING);
  };

  const pulseRelease = () => {
    if (!chartRef.current) return;
    fmAnimate(chartRef.current, { scale: 1, opacity: 1 }, SPRING);
  };

  const pulseTick = () => {
    if (!chartRef.current) return;
    fmAnimate(chartRef.current, { scale: [0.99, 1] }, SPRING);
  };

  const hitTest = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left - CX;
    const y = clientY - rect.top - CY;
    const dist = Math.sqrt(x * x + y * y);
    const angleDeg = Math.atan2(-y, x) * (180 / Math.PI);
    const cw = ((90 - angleDeg) % 360 + 360) % 360;
    const segIndex = Math.floor(cw / (360 / data.length)) % data.length;
    const zone = (OUTER - INNER) / LEVELS;
    const level = Math.max(0, Math.min(LEVELS, Math.round((dist - INNER) / zone)));
    return { segIndex, level, dist };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit || hit.dist > OUTER + 20) return;
    dragRef.current = {
      segIndex: hit.segIndex,
      startDist: hit.dist,
      dragging: false,
      lastLevel: hit.level,
    };
    containerRef.current?.setPointerCapture(e.pointerId);
    pulsePress();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit) return;
    if (!drag.dragging && Math.abs(hit.dist - drag.startDist) > 8) {
      drag.dragging = true;
      pulseRelease();
    }
    if (drag.dragging) {
      onSelect(data[drag.segIndex].id);
      onScoreChange(data[drag.segIndex].id, hit.level);
      if (hit.level !== drag.lastLevel) {
        drag.lastLevel = hit.level;
        pulseTick();
      }
    }
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    if (drag && !drag.dragging) {
      const id = data[drag.segIndex].id;
      onSelect(id);
      if (drag.startDist >= INNER * 0.5) {
        const zone = (OUTER - INNER) / LEVELS;
        const level = Math.max(0, Math.min(LEVELS, Math.round((drag.startDist - INNER) / zone)));
        onScoreChange(id, level);
      }
    }
    pulseRelease();
    dragRef.current = null;
  };

  const pieData = data.map(() => ({ v: 1 }));

  const guideRadii = [1, 2, 3, 4].map((l) => (INNER + l * BAND) * anim);

  return (
    <div
      ref={containerRef}
      className="mx-auto touch-none outline-none select-none [-webkit-tap-highlight-color:transparent]"
      style={{ width: CHART, height: CHART }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div ref={chartRef} className="relative" style={{ width: CHART, height: CHART }}>
        {/* Background scale circles */}
        <svg
          width={CHART}
          height={CHART}
          className="absolute inset-0 pointer-events-none"
        >
          {guideRadii.map((r, i) => (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={0.5}
            />
          ))}
        </svg>

        {/* Data rings */}
        <div className="absolute inset-0">
          <PieChart width={CHART} height={CHART}>
            {Array.from({ length: LEVELS }, (_, li) => {
              const level = li + 1;
              const ir = (INNER + li * BAND) * anim;
              const or = (INNER + level * BAND) * anim;

              return (
                <Pie
                  key={level}
                  data={pieData}
                  cx={CX}
                  cy={CY}
                  innerRadius={ir}
                  outerRadius={or}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="v"
                  paddingAngle={0}
                  isAnimationActive={false}
                >
                  {data.map((item) => {
                    const filled = item.score >= level;
                    const sel = item.id === selectedId;
                    return (
                      <Cell
                        key={item.id}
                        fill={
                          filled
                            ? item.isTarget
                              ? ORANGE_SHADES[li]
                              : BLUE_SHADES[li]
                            : "rgba(255,255,255,0.03)"
                        }
                        fillOpacity={filled ? (sel ? 1 : 0.75) : 1}
                        stroke="#000"
                        strokeWidth={2}
                        strokeLinejoin="round"
                      />
                    );
                  })}
                </Pie>
              );
            })}
          </PieChart>
        </div>
      </div>
    </div>
  );
}
