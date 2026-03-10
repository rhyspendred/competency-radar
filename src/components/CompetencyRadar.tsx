import { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { animate as fmAnimate } from "framer-motion";
import type { CompetencyItem } from "../hooks/useCompetencyData";

const MARGIN = 16;
const MAX_CHART = 500;

const BASE = 340;
const INNER_R = 24 / BASE;
const OUTER_R = 160 / BASE;
const LEVELS = 5;

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
  const [size, setSize] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    segIndex: number;
    startDist: number;
    dragging: boolean;
    lastLevel: number;
  } | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize(Math.min(width - MARGIN * 2, height - MARGIN * 2, MAX_CHART));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  const inner = size * INNER_R;
  const outer = size * OUTER_R;
  const band = (outer - inner) / LEVELS;
  const cx = size / 2;
  const cy = size / 2;

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
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    const dist = Math.sqrt(x * x + y * y);
    const angleDeg = Math.atan2(-y, x) * (180 / Math.PI);
    const cw = ((90 - angleDeg) % 360 + 360) % 360;
    const segIndex = Math.floor(cw / (360 / data.length)) % data.length;
    const zone = (outer - inner) / LEVELS;
    const level = Math.max(0, Math.min(LEVELS, Math.round((dist - inner) / zone)));
    return { segIndex, level, dist };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit || hit.dist > outer + 20) return;
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
      if (id !== selectedId) {
        onSelect(id);
      } else if (drag.startDist >= inner * 0.5) {
        const zone = (outer - inner) / LEVELS;
        const level = Math.max(0, Math.min(LEVELS, Math.round((drag.startDist - inner) / zone)));
        onScoreChange(id, level);
      }
    }
    pulseRelease();
    dragRef.current = null;
  };

  const pieData = data.map(() => ({ v: 1 }));

  const guideRadii = [1, 2, 3, 4].map((l) => (inner + l * band) * anim);

  const segAngle = 360 / data.length;
  const labelR = outer + 10;
  const labelFontSize = Math.max(9, Math.min(12, Math.round(size / 30)));
  const toRad = (d: number) => (d * Math.PI) / 180;

  return (
    <div ref={wrapperRef} className="w-full h-full flex items-start justify-center">
      {size > 0 && (
        <div
          ref={containerRef}
          className="touch-none outline-none select-none [-webkit-tap-highlight-color:transparent]"
          style={{ width: size, height: size }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div ref={chartRef} className="relative" style={{ width: size, height: size }}>
            {/* Background scale circles */}
            <svg
              width={size}
              height={size}
              className="absolute inset-0 pointer-events-none"
            >
              {guideRadii.map((r, i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={0.5}
                />
              ))}
            </svg>

            {/* Data rings */}
            <div className="absolute inset-0">
              <PieChart width={size} height={size} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                {Array.from({ length: LEVELS }, (_, li) => {
                  const level = li + 1;
                  const ir = (inner + li * band) * anim;
                  const or_ = (inner + level * band) * anim;

                  return (
                    <Pie
                      key={level}
                      data={pieData}
                      cx={cx}
                      cy={cy}
                      innerRadius={ir}
                      outerRadius={or_}
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
                                ? item.isDevelopment
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

            {/* Development arrows */}
            <svg
              width={size}
              height={size}
              className="absolute inset-0 pointer-events-none"
            >
              {data.map((item, idx) => {
                if (!item.isDevelopment) return null;

                const midAngle = 90 - (idx + 0.5) * segAngle;
                const midRad = toRad(midAngle);
                const ux = Math.cos(midRad);
                const uy = -Math.sin(midRad);
                const tx = -uy;
                const ty = ux;

                const startR = (inner + (item.score - 0.2) * band) * anim;
                const endR = (inner + (item.score + 0.55) * band) * anim;
                const headLen = band * anim * 0.3;
                const headW = band * anim * 0.15;
                const sw = Math.max(1.5, band * anim * 0.07);

                const sx = cx + startR * ux;
                const sy = cy + startR * uy;
                const ex = cx + endR * ux;
                const ey = cy + endR * uy;

                const t1x = ex - headLen * ux + headW * tx;
                const t1y = ey - headLen * uy + headW * ty;
                const t2x = ex - headLen * ux - headW * tx;
                const t2y = ey - headLen * uy - headW * ty;

                return (
                  <g key={item.id} opacity={0.85}>
                    <line
                      x1={sx}
                      y1={sy}
                      x2={ex - headLen * 0.3 * ux}
                      y2={ey - headLen * 0.3 * uy}
                      stroke="white"
                      strokeWidth={sw}
                      strokeLinecap="round"
                    />
                    <polygon
                      points={`${ex},${ey} ${t1x},${t1y} ${t2x},${t2y}`}
                      fill="white"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Perimeter labels (disabled for now) */}
            {false && <svg
              width={size}
              height={size}
              className="absolute inset-0 pointer-events-none"
              style={{ overflow: "visible" }}
            >
              <defs>
                {data.map((_, idx) => {
                  const midAngle = 90 - (idx + 0.5) * segAngle;
                  const isTop = Math.sin(toRad(midAngle)) >= 0;
                  const halfSpan = 50;
                  const a1 = midAngle + halfSpan;
                  const a2 = midAngle - halfSpan;
                  const startA = isTop ? a1 : a2;
                  const endA = isTop ? a2 : a1;
                  const sweep = isTop ? 1 : 0;
                  const sx = cx + labelR * Math.cos(toRad(startA));
                  const sy = cy - labelR * Math.sin(toRad(startA));
                  const ex = cx + labelR * Math.cos(toRad(endA));
                  const ey = cy - labelR * Math.sin(toRad(endA));
                  return (
                    <path
                      key={idx}
                      id={`label-arc-${idx}`}
                      d={`M${sx},${sy} A${labelR},${labelR} 0 0 ${sweep} ${ex},${ey}`}
                      fill="none"
                    />
                  );
                })}
              </defs>
              {data.map((item, idx) => {
                const sel = item.id === selectedId;
                return (
                  <text
                    key={item.id}
                    fill="white"
                    fontSize={sel ? labelFontSize + 1 : labelFontSize}
                    fontWeight={sel ? 600 : 400}
                    textAnchor="middle"
                    dominantBaseline="central"
                    opacity={anim * (sel ? 1 : 0.3)}
                    style={{ transition: "opacity 0.2s ease" }}
                  >
                    <textPath href={`#label-arc-${idx}`} startOffset="50%">
                      {item.label}
                    </textPath>
                  </text>
                );
              })}
            </svg>}
          </div>
        </div>
      )}
    </div>
  );
}
