import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCompetencyData } from "../hooks/useCompetencyData";
import CompetencyRadar from "./CompetencyRadar";

export default function Dashboard() {
  const { data, setScore } = useCompetencyData();
  const [selectedId, setSelectedId] = useState(data[0]?.id ?? "");
  const [showSheet, setShowSheet] = useState(false);

  const selected = data.find((d) => d.id === selectedId) ?? data[0];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      {/* Radar chart */}
      <div className="pt-10 pb-6 px-10">
        <CompetencyRadar
          data={data}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Active skill card */}
      {selected && (
        <div className="w-full max-w-sm px-4 pb-8">
          <div className="rounded-2xl bg-[#111] border border-[#222] p-5 space-y-4">
            {/* Name + target badge */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selected.label}</h2>
                <p className="text-sm text-gray-400">{selected.scaleName}</p>
              </div>
              {selected.isTarget && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
                  Target
                </span>
              )}
            </div>

            {/* Score controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setScore(selected.id, selected.score - 1)}
                disabled={selected.score <= 0}
                className="w-14 h-14 rounded-xl bg-[#1a1a1a] border border-[#333] text-2xl font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform cursor-pointer"
              >
                &minus;
              </button>
              <div className="text-center min-w-[60px]">
                <div className="text-4xl font-bold tabular-nums">
                  {selected.score}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  of {selected.maxScore}
                </div>
              </div>
              <button
                onClick={() => setScore(selected.id, selected.score + 1)}
                disabled={selected.score >= selected.maxScore}
                className="w-14 h-14 rounded-xl bg-[#1a1a1a] border border-[#333] text-2xl font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Level pips */}
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: selected.maxScore }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 max-w-8 rounded-full transition-colors duration-200 ${
                    i < selected.score
                      ? selected.isTarget
                        ? "bg-orange-500"
                        : "bg-blue-500"
                      : "bg-[#222]"
                  }`}
                />
              ))}
            </div>

            {/* View details trigger */}
            <button
              onClick={() => setShowSheet(true)}
              className="w-full py-3 rounded-xl bg-[#1a1a1a] border border-[#333] text-sm font-medium text-gray-300 hover:text-white hover:border-[#444] transition-colors cursor-pointer"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Behaviours bottom sheet */}
      <AnimatePresence>
        {showSheet && selected && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setShowSheet(false)}
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-[#111] border-t border-[#222] rounded-t-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#111] pt-3 pb-4 px-6 z-10">
                <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selected.label}</h3>
                  <button
                    onClick={() => setShowSheet(false)}
                    className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Behaviours</p>
              </div>
              <ul className="px-6 pb-10 space-y-4">
                {selected.behaviours.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <div className="mt-0.5 size-5 rounded border-2 border-gray-600 shrink-0" />
                    <span className="text-sm text-gray-300">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
