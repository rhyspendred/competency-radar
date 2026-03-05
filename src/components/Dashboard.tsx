import { useState } from "react";
import { useCompetencyData } from "../hooks/useCompetencyData";
import CompetencyRadar from "./CompetencyRadar";
import BehavioursView from "./BehavioursView";

export default function Dashboard() {
  const { data, setScore } = useCompetencyData();
  const [selectedId, setSelectedId] = useState(data[0]?.id ?? "");
  const [detailId, setDetailId] = useState<string | null>(null);

  const selected = data.find((d) => d.id === selectedId) ?? data[0];
  const detailItem = detailId ? data.find((d) => d.id === detailId) : null;

  if (detailItem) {
    return <BehavioursView item={detailItem} onBack={() => setDetailId(null)} />;
  }

  return (
    <div className="h-full bg-black text-white flex flex-col items-center overflow-hidden">
      {/* Radar chart */}
      <div className="pt-8 pb-4">
        <CompetencyRadar
          data={data}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onScoreChange={setScore}
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

            {/* See behaviours */}
            <button
              onClick={() => setDetailId(selected.id)}
              className="w-full py-3 rounded-xl bg-[#1a1a1a] border border-[#333] text-sm font-medium text-gray-300 hover:text-white hover:border-[#444] transition-colors cursor-pointer"
            >
              See Behaviours
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
