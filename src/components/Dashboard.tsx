import { useState, useRef, useEffect } from "react";
import { motion, animate as fmAnimate } from "framer-motion";
import { useCompetencyData } from "../hooks/useCompetencyData";
import CompetencyRadar from "./CompetencyRadar";
import BehavioursView from "./BehavioursView";
import BottomNav from "./BottomNav";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };
const CARD_W = 280;

export default function Dashboard() {
  const { frameworkName, data, setScore } = useCompetencyData();
  const [selectedId, setSelectedId] = useState(data[0]?.id ?? "");
  const [detailId, setDetailId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef({ id: "", score: 0 });

  const selected = data.find((d) => d.id === selectedId) ?? data[0];
  const detailItem = detailId ? data.find((d) => d.id === detailId) : null;

  useEffect(() => {
    const card = scrollRef.current?.querySelector(
      `[data-id="${selectedId}"]`,
    ) as HTMLElement | null;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
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

  return (
    <div className="h-full bg-black text-white flex flex-col overflow-hidden">
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
            style={{ paddingInline: `calc(50% - ${CARD_W / 2}px)` }}
          >
            {data.map((item) => {
              const sel = item.id === selectedId;
              return (
                <motion.div
                  key={item.id}
                  data-id={item.id}
                  animate={{ scale: sel ? 1 : 0.93, opacity: sel ? 1 : 0.4 }}
                  transition={SPRING}
                  onClick={() => setSelectedId(item.id)}
                  className="snap-center shrink-0 rounded-2xl bg-[#111] border border-[#222] p-4 space-y-3 cursor-pointer"
                  style={{ width: CARD_W }}
                >
                  {/* Name row */}
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold leading-tight truncate">
                      {item.label}
                    </h2>
                    {item.isTarget && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25 shrink-0">
                        Target
                      </span>
                    )}
                  </div>

                  {/* Score row */}
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 flex-1">
                      {Array.from({ length: item.maxScore }, (_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                            i < item.score
                              ? item.isTarget
                                ? "bg-orange-500"
                                : "bg-blue-500"
                              : "bg-[#222]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums shrink-0">
                      {item.score}/{item.maxScore}
                    </span>
                    <span className="text-xs text-gray-600 shrink-0">
                      {item.scaleName}
                    </span>
                  </div>

                  {/* Actions row — only interactive on the selected card */}
                  {sel && (
                    <div className="flex items-center gap-2">
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
                </motion.div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="flex-1 flex items-start justify-center min-h-0">
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
