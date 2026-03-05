import type { CompetencyItem } from "../hooks/useCompetencyData";

interface Props {
  item: CompetencyItem;
}

export default function BehavioursView({ item }: Props) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Level summary */}
      <div className="shrink-0 px-5 pt-3 pb-3 border-b border-[#222]">
        <div className="flex items-center gap-2">
          {item.isTarget && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
              Target
            </span>
          )}
          <p className="text-sm text-gray-500">
            Level {item.score}/{item.maxScore} &middot; {item.scaleName}
          </p>
        </div>
      </div>

      {/* Scrollable behaviours list */}
      <ul className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3">
        {item.behaviours.map((b, i) => (
          <li
            key={b}
            className="flex items-start gap-3 rounded-xl bg-[#111] border border-[#222] p-4"
          >
            <span className="text-xs text-gray-600 font-mono tabular-nums mt-0.5 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm text-gray-300 leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
