import { useState, useRef, useEffect } from "react";
import { motion, animate as fmAnimate } from "framer-motion";
import { useCompetencyData } from "../hooks/useCompetencyData";
import CompetencyRadar from "./CompetencyRadar";
import BehavioursView from "./BehavioursView";
import BottomNav from "./BottomNav";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };

export default function Dashboard() {
  const { frameworkName, data, setScore } = useCompetencyData();
  const [selectedId, setSelectedId] = useState(data[0]?.id ?? "");
  const [detailId, setDetailId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef({ id: "", score: 0 });

  const selected = data.find((d) => d.id === selectedId) ?? data[0];
  const detailItem = detailId ? data.find((d) => d.id === detailId) : null;

  useEffect(() => {
    if (!selected) return;
    const prev = prevRef.current;
    if (prev.id === selected.id && selected.score > prev.score && cardRef.current) {
      fmAnimate(cardRef.current, {
        boxShadow: [
          "0 0 0px 0px rgba(249,115,22,0)",
          "0 0 20px 4px rgba(249,115,22,0.3)",
          "0 0 0px 0px rgba(249,115,22,0)",
        ],
      }, { duration: 0.6, ease: "easeOut" });
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
          {/* Chart — top-aligned below app bar */}
          <div className="shrink-0 flex justify-center">
            <CompetencyRadar
              data={data}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onScoreChange={setScore}
            />
          </div>

          {/* Spacer pushes card to bottom */}
          <div className="flex-1 min-h-0" />

          {/* Skill card anchored at bottom */}
          {selected && (
            <div className="shrink-0 w-full max-w-sm mx-auto px-4 pb-2">
              <div
                ref={cardRef}
                className="rounded-2xl bg-[#111] border border-[#222] p-4 space-y-3"
              >
                {/* Name row */}
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold leading-tight">
                    {selected.label}
                  </h2>
                  {selected.isTarget && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25 shrink-0 mt-0.5">
                      Target
                    </span>
                  )}
                </div>

                {/* Score row */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1 flex-1">
                    {Array.from({ length: selected.maxScore }, (_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                          i < selected.score
                            ? selected.isTarget
                              ? "bg-orange-500"
                              : "bg-blue-500"
                            : "bg-[#222]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 tabular-nums shrink-0">
                    {selected.score}/{selected.maxScore}
                  </span>
                  <span className="text-xs text-gray-600 shrink-0">
                    {selected.scaleName}
                  </span>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95, opacity: 0.8 }}
                    transition={SPRING}
                    onClick={() => setScore(selected.id, selected.score - 1)}
                    disabled={selected.score <= 0}
                    className="h-9 w-9 rounded-lg bg-[#1a1a1a] border border-[#333] text-base font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    &minus;
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95, opacity: 0.8 }}
                    transition={SPRING}
                    onClick={() => setScore(selected.id, selected.score + 1)}
                    disabled={selected.score >= selected.maxScore}
                    className="h-9 w-9 rounded-lg bg-[#1a1a1a] border border-[#333] text-base font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    +
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97, opacity: 0.8 }}
                    transition={SPRING}
                    onClick={() => setDetailId(selected.id)}
                    className="flex-1 h-9 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs font-medium text-gray-300 hover:text-white hover:border-[#444] transition-colors cursor-pointer"
                  >
                    See Behaviours
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}
