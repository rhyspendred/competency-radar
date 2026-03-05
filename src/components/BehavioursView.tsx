import type { CompetencyItem } from "../hooks/useCompetencyData";

interface Props {
  item: CompetencyItem;
  onBack: () => void;
}

export default function BehavioursView({ item, onBack }: Props) {
  return (
    <div className="h-full bg-black text-white flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-5 pt-6 pb-4 border-b border-[#222]">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer mb-3"
        >
          &larr; Back to chart
        </button>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">{item.label}</h1>
          {item.isTarget && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25 shrink-0">
              Target
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Level {item.score}/{item.maxScore} &middot; {item.scaleName}
        </p>
      </div>

      {/* Scrollable behaviours list */}
      <ul className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-4">
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
