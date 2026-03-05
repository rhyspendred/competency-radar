import { useState } from "react";
import { useCompetencyData } from "../hooks/useCompetencyData";
import CompetencyRadar from "./CompetencyRadar";
import BehavioursView from "./BehavioursView";
import BottomNav from "./BottomNav";

export default function Dashboard() {
  const { frameworkName, data, setScore } = useCompetencyData();
  const [selectedId, setSelectedId] = useState(data[0]?.id ?? "");
  const [detailId, setDetailId] = useState<string | null>(null);

  const selected = data.find((d) => d.id === selectedId) ?? data[0];
  const detailItem = detailId ? data.find((d) => d.id === detailId) : null;

  return (
    <div className="h-full bg-black text-white flex flex-col overflow-hidden">
      {/* App bar */}
      <header className="shrink-0 h-11 flex items-center justify-between px-4">
        {detailItem ? (
          <button
            onClick={() => setDetailId(null)}
            className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            &larr; Back
          </button>
        ) : (
          <div className="w-16" />
        )}
        <h1 className="text-sm font-semibold tracking-tight text-white truncate px-2">
          {detailItem ? detailItem.label : frameworkName}
        </h1>
        <div className="w-16 flex justify-end">
          {!detailItem && (
            <button className="text-gray-500 hover:text-white transition-colors cursor-pointer">
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
            </button>
          )}
        </div>
      </header>

      {/* Content area */}
      {detailItem ? (
        <BehavioursView item={detailItem} />
      ) : (
        <>
          {/* Chart — fills available space, centered */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <CompetencyRadar
              data={data}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onScoreChange={setScore}
            />
          </div>

          {/* Skill card anchored at bottom */}
          {selected && (
            <div className="shrink-0 w-full max-w-sm mx-auto px-4 pb-2">
              <div className="rounded-2xl bg-[#111] border border-[#222] p-4 space-y-3">
                {/* Name row — primary element */}
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

                {/* Score row — level pips, label, and controls in one line */}
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
                  <button
                    onClick={() => setScore(selected.id, selected.score - 1)}
                    disabled={selected.score <= 0}
                    className="h-9 w-9 rounded-lg bg-[#1a1a1a] border border-[#333] text-base font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform cursor-pointer"
                  >
                    &minus;
                  </button>
                  <button
                    onClick={() => setScore(selected.id, selected.score + 1)}
                    disabled={selected.score >= selected.maxScore}
                    className="h-9 w-9 rounded-lg bg-[#1a1a1a] border border-[#333] text-base font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setDetailId(selected.id)}
                    className="flex-1 h-9 rounded-lg bg-[#1a1a1a] border border-[#333] text-xs font-medium text-gray-300 hover:text-white hover:border-[#444] transition-colors cursor-pointer"
                  >
                    See Behaviours
                  </button>
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
