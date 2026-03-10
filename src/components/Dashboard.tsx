import { useState, useRef, useEffect, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  animate as fmAnimate,
  useMotionValue,
} from "framer-motion";
import { useCompetencyData } from "../hooks/useCompetencyData";
import CompetencyRadar from "./CompetencyRadar";
import BehavioursView from "./BehavioursView";
import BottomNav from "./BottomNav";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };
const SIDE_MARGIN = 16;
const MAX_WIDTH = 500;
const CARD_GAP = 12;
const COPIES = 5;

const BLUE_SHADES = ["#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"];
const ORANGE_SHADES = [
  "#fdba74",
  "#fb923c",
  "#f97316",
  "#ea580c",
  "#c2410c",
];

/* ── Animated score digit ─────────────────────────────────── */

function AnimatedScore({ value }: { value: number }) {
  const prevRef = useRef(value);
  const dirRef = useRef(0);

  if (value !== prevRef.current) {
    dirRef.current = value > prevRef.current ? 1 : -1;
    prevRef.current = value;
  }

  const dir = dirRef.current;

  return (
    <span
      className="relative inline-block overflow-hidden tabular-nums text-center"
      style={{ height: "1.15em", width: "0.65em" }}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ y: dir > 0 ? "100%" : "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: dir > 0 ? "-100%" : "100%" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute inset-x-0"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── Animated label (scale name) ──────────────────────────── */

function AnimatedLabel({ text, value }: { text: string; value: number }) {
  const prevRef = useRef(value);
  const dirRef = useRef(0);

  if (value !== prevRef.current) {
    dirRef.current = value > prevRef.current ? 1 : -1;
    prevRef.current = value;
  }

  const dir = dirRef.current;

  return (
    <span
      className="relative inline-block overflow-hidden text-right"
      style={{ height: "1.3em" }}
    >
      {/* Invisible sizer keeps width stable */}
      <span className="invisible whitespace-nowrap">{text}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={text}
          initial={{ y: dir > 0 ? "100%" : "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: dir > 0 ? "-100%" : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute inset-x-0 whitespace-nowrap text-right"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── Dashboard ────────────────────────────────────────────── */

export default function Dashboard() {
  const { frameworkName, data, setScore } = useCompetencyData();
  const n = data.length;
  const midStart = Math.floor(COPIES / 2) * n;

  const [selectedId, setSelectedId] = useState(data[0]?.id ?? "");
  const [detailId, setDetailId] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef({ id: "", score: 0 });
  const [contentWidth, setContentWidth] = useState(0);

  const repeated = useMemo(() => {
    const arr: typeof data = [];
    for (let c = 0; c < COPIES; c++) arr.push(...data);
    return arr;
  }, [data]);

  const selected = data.find((d) => d.id === selectedId) ?? data[0];
  const detailItem = detailId ? data.find((d) => d.id === detailId) : null;

  const cardW = contentWidth || 280;
  const stride = cardW + CARD_GAP;

  /* Carousel position state */
  const [activeTriIdx, setActiveTriIdx] = useState(midStart);
  const prevTriIdx = useRef(midStart);
  const x = useMotionValue(0);

  /* Measure container width */
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContentWidth(
        Math.min(entries[0].contentRect.width - SIDE_MARGIN * 2, MAX_WIDTH),
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Animate carousel x when activeTriIdx or sizing changes */
  useEffect(() => {
    const containerW = mainRef.current?.clientWidth ?? 375;
    const target = containerW / 2 - cardW / 2 - activeTriIdx * stride;

    const idxChanged = activeTriIdx !== prevTriIdx.current;
    prevTriIdx.current = activeTriIdx;

    if (idxChanged) {
      fmAnimate(x, target, { type: "spring", stiffness: 400, damping: 35 });
    } else {
      x.set(target);
    }
  }, [activeTriIdx, cardW, stride, x]);

  /* Shortest-path wrap when selection changes */
  useEffect(() => {
    const targetDataIdx = data.findIndex((d) => d.id === selectedId);
    if (targetDataIdx < 0) return;

    setActiveTriIdx((prev) => {
      const currentDataIdx = ((prev % n) + n) % n;
      let delta = targetDataIdx - currentDataIdx;
      if (delta > n / 2) delta -= n;
      if (delta < -n / 2) delta += n;

      let next = prev + delta;
      if (next < 0 || next >= COPIES * n) {
        next = midStart + targetDataIdx;
      }
      return next;
    });
  }, [selectedId, n, data, midStart]);

  /* Glow on score increase */
  useEffect(() => {
    if (!selected) return;
    const prev = prevRef.current;
    if (prev.id === selected.id && selected.score > prev.score) {
      const el = carouselRef.current?.querySelector(
        `[data-active="true"]`,
      ) as HTMLElement | null;
      if (el) {
        fmAnimate(
          el,
          {
            boxShadow: [
              "0 0 0px 0px rgba(249,115,22,0)",
              "0 0 20px 4px rgba(249,115,22,0.3)",
              "0 0 0px 0px rgba(249,115,22,0)",
            ],
          },
          { duration: 0.6, ease: "easeOut" },
        );
      }
    }
    prevRef.current = { id: selected.id, score: selected.score };
  }, [selected]);

  return (
    <div
      ref={mainRef}
      className="h-full bg-black text-white flex flex-col overflow-hidden"
    >
      {/* App bar */}
      <header className="shrink-0 h-11 flex items-center justify-between px-4">
        {detailItem ? (
          <motion.button
            whileTap={{ scale: 0.95, opacity: 0.8 }}
            transition={SPRING}
            onClick={() => setDetailId(null)}
            className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            &larr; Back
          </motion.button>
        ) : (
          <div className="w-16" />
        )}
        <h1 className="text-sm font-semibold tracking-tight text-white truncate px-2">
          {detailItem ? detailItem.label : frameworkName}
        </h1>
        <div className="w-16 flex justify-end">
          {!detailItem && (
            <motion.button
              whileTap={{ scale: 0.95, opacity: 0.8 }}
              transition={SPRING}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </motion.button>
          )}
        </div>
      </header>

      {/* Content area */}
      {detailItem ? (
        <BehavioursView item={detailItem} />
      ) : (
        <>
          {/* Wrapping card carousel */}
          <div className="shrink-0 overflow-hidden py-2 relative">
            {/* Edge masks — cover everything outside the active card */}
            <div
              className="absolute inset-y-0 left-0 z-10 pointer-events-none"
              style={{
                width: `calc(50% - ${cardW / 2 + 8}px)`,
                background: "linear-gradient(to right, black 80%, transparent)",
              }}
            />
            <div
              className="absolute inset-y-0 right-0 z-10 pointer-events-none"
              style={{
                width: `calc(50% - ${cardW / 2 + 8}px)`,
                background: "linear-gradient(to left, black 80%, transparent)",
              }}
            />
            <motion.div
              ref={carouselRef}
              className="flex"
              style={{ x, gap: CARD_GAP }}
            >
              {repeated.map((item, triIdx) => {
                const isActive = triIdx === activeTriIdx;
                return (
                  <motion.div
                    key={`${item.id}-${Math.floor(triIdx / n)}`}
                    data-active={isActive ? "true" : undefined}
                    animate={{
                      scale: isActive ? 1 : 0.93,
                      opacity: isActive ? 1 : 0.4,
                    }}
                    transition={SPRING}
                    onClick={() => setSelectedId(item.id)}
                    className="shrink-0 rounded-2xl overflow-hidden bg-[#111] border border-[#222] cursor-pointer"
                    style={{ width: cardW }}
                  >
                    {/* Colour header */}
                    <div
                      className={`px-4 py-2.5 flex items-center justify-between gap-3 ${
                        item.isTarget ? "bg-orange-500" : "bg-blue-600"
                      }`}
                    >
                      <h2 className="text-base font-bold text-white truncate">
                        {item.label}
                      </h2>
                      {item.isTarget && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white shrink-0">
                          Target
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="px-4 pt-3 pb-4 space-y-3">
                      {/* Score row */}
                      <div className="flex items-center font-bold">
                        <span className="text-4xl text-white">
                          <AnimatedScore value={item.score} />
                        </span>
                        <span className="text-2xl text-gray-300 ml-auto">
                          <AnimatedLabel
                            text={item.scaleName}
                            value={item.score}
                          />
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="flex gap-1.5">
                        {Array.from({ length: item.maxScore }, (_, j) => (
                          <div
                            key={j}
                            className="h-2 flex-1 rounded-full transition-colors duration-200"
                            style={{
                              backgroundColor:
                                j < item.score
                                  ? item.isTarget
                                    ? ORANGE_SHADES[j]
                                    : BLUE_SHADES[j]
                                  : "#222",
                            }}
                          />
                        ))}
                      </div>

                      {/* Actions — active card only */}
                      {isActive && (
                        <div className="flex items-center gap-2 pt-1">
                          <motion.button
                            whileTap={{ scale: 0.95, opacity: 0.8 }}
                            transition={SPRING}
                            onClick={(e) => {
                              e.stopPropagation();
                              setScore(item.id, item.score - 1);
                            }}
                            disabled={item.score <= 0}
                            className="h-9 w-9 rounded-lg bg-[#1a1a1a] border border-[#333] text-base font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            &minus;
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95, opacity: 0.8 }}
                            transition={SPRING}
                            onClick={(e) => {
                              e.stopPropagation();
                              setScore(item.id, item.score + 1);
                            }}
                            disabled={item.score >= item.maxScore}
                            className="h-9 w-9 rounded-lg bg-[#1a1a1a] border border-[#333] text-base font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            +
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.97, opacity: 0.8 }}
                            transition={SPRING}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailId(item.id);
                            }}
                            className="flex-1 h-9 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs font-medium text-gray-300 hover:text-white hover:border-[#444] transition-colors cursor-pointer"
                          >
                            View Behaviours
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Chart — top-aligned, close to cards */}
          <div className="flex-1 min-h-0 pt-3">
            <CompetencyRadar
              data={data}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onScoreChange={setScore}
            />
          </div>
        </>
      )}

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}
