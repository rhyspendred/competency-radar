import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, animate as fmAnimate } from "framer-motion";
import { useCompetencyData } from "../hooks/useCompetencyData";
import CompetencyRadar from "./CompetencyRadar";
import BehavioursView from "./BehavioursView";
import BottomNav from "./BottomNav";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };
const SIDE_MARGIN = 16;
const MAX_WIDTH = 500;

/* ── Animated score digit ─────────────────────────────────── */

function AnimatedScore({ value }: { value: number }) {
  const prev = useRef(value);
  const dir = value > prev.current ? 1 : value < prev.current ? -1 : 0;
  useEffect(() => {
    prev.current = value;
  }, [value]);

  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden font-bold text-3xl tabular-nums"
      style={{ height: "1.3em", minWidth: "0.65em" }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: dir * 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -dir * 28, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── Dashboard ────────────────────────────────────────────── */

export default function Dashboard() {
  const { frameworkName, data, setScore } = useCompetencyData();
  const [selectedId, setSelectedId] = useState(data[0]?.id ?? "");
  const [detailId, setDetailId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef({ id: "", score: 0 });
  const [contentWidth, setContentWidth] = useState(0);

  const selected = data.find((d) => d.id === selectedId) ?? data[0];
  const detailItem = detailId ? data.find((d) => d.id === detailId) : null;

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

  useEffect(() => {
    const card = scrollRef.current?.querySelector(
      `[data-id="${selectedId}"]`,
    ) as HTMLElement | null;
    card?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedId]);

  useEffect(() => {
    if (!selected) return;
    const prev = prevRef.current;
    if (prev.id === selected.id && selected.score > prev.score) {
      const el = scrollRef.current?.querySelector(
        `[data-id="${selected.id}"]`,
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

  const cardW = contentWidth || 280;

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
          {/* Horizontal card carousel */}
          <div
            ref={scrollRef}
            className="shrink-0 flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar py-2"
            style={{ paddingInline: `calc(50% - ${cardW / 2}px)` }}
          >
            {data.map((item) => {
              const sel = item.id === selectedId;
              const accent = item.isTarget ? "bg-orange-500" : "bg-blue-600";
              return (
                <motion.div
                  key={item.id}
                  data-id={item.id}
                  animate={{
                    scale: sel ? 1 : 0.93,
                    opacity: sel ? 1 : 0.4,
                  }}
                  transition={SPRING}
                  onClick={() => setSelectedId(item.id)}
                  className="snap-center shrink-0 rounded-2xl overflow-hidden bg-[#111] border border-[#222] cursor-pointer"
                  style={{ width: cardW }}
                >
                  {/* Colour header */}
                  <div
                    className={`px-4 py-2.5 flex items-center justify-between gap-3 ${accent}`}
                  >
                    <h2 className="text-sm font-bold text-white truncate">
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
                    <div className="flex items-baseline gap-1">
                      <AnimatedScore value={item.score} />
                      <span className="text-base text-gray-500 font-medium">
                        / {item.maxScore}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {item.scaleName}
                      </span>
                    </div>

                    {/* Progress bar — own line */}
                    <div className="flex gap-1.5">
                      {Array.from({ length: item.maxScore }, (_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-colors duration-200 ${
                            i < item.score
                              ? item.isTarget
                                ? "bg-orange-500"
                                : "bg-blue-500"
                              : "bg-[#222]"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Actions — selected card only */}
                    {sel && (
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
                          See Behaviours
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Chart — fills remaining vertical space */}
          <div className="flex-1 min-h-0">
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
