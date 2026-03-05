import { useState } from "react";
import { useCompetencyData } from "../hooks/useCompetencyData";

export default function CompetencyDebugView() {
  const { data } = useCompetencyData();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 px-4 py-8 max-w-md mx-auto space-y-3">
      <h1 className="text-xl font-semibold tracking-tight text-white mb-6">
        Competency Debug View
      </h1>

      {data.map((item) => (
        <div
          key={item.id}
          className="rounded-xl bg-gray-900 border border-gray-800 p-4 space-y-3"
        >
          {/* Header row */}
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-white truncate">
              {item.label}
            </span>
            {item.isTarget && (
              <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Target
              </span>
            )}
          </div>

          {/* Level indicator */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: item.maxScore }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-6 rounded-full ${
                    i < item.score ? "bg-indigo-500" : "bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400 ml-1">
              {item.score}/{item.maxScore}
            </span>
            <span className="text-xs text-gray-500">{item.scaleName}</span>
          </div>

          {/* Expand button + behaviour list */}
          <button
            onClick={() => toggle(item.id)}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            {expanded.has(item.id) ? "Hide Behaviours" : "Expand Behaviours"}
          </button>

          {expanded.has(item.id) && (
            <ul className="space-y-1 pl-3 border-l-2 border-gray-700">
              {item.behaviours.map((b) => (
                <li key={b} className="text-sm text-gray-300">
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
