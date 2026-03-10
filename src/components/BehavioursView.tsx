import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CompetencyItem } from "../hooks/useCompetencyData";
import { useResources } from "../hooks/useResources";
import type { Resource, ResourceType } from "../hooks/useResources";

interface Props {
  item: CompetencyItem;
  frameworkId: string;
}

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  book: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  ),
  video: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  topic: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  training: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  article: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  tool: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

const TYPE_LABELS: Record<ResourceType, string> = {
  book: "books",
  video: "videos",
  topic: "topics",
  training: "training",
  article: "articles",
  tool: "tools",
};

function ResourceCounts({
  behaviourId,
  resources,
  expanded,
  onBadgeClick,
}: {
  behaviourId: string;
  resources: Resource[];
  expanded: { behaviourId: string; type: ResourceType } | null;
  onBadgeClick: (behaviourId: string, type: ResourceType) => void;
}) {
  const byType = resources.reduce(
    (acc, r) => {
      acc[r.type] = (acc[r.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<ResourceType, number>,
  ) as Partial<Record<ResourceType, number>>;

  const typeOrder: ResourceType[] = ["book", "video", "topic", "training", "article", "tool"];
  const entries = typeOrder.filter((t) => (byType[t] ?? 0) > 0);

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {entries.map((type) => {
        const count = byType[type] ?? 0;
        const isExpanded = expanded?.behaviourId === behaviourId && expanded?.type === type;
        return (
          <button
            key={type}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBadgeClick(behaviourId, type);
            }}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors cursor-pointer ${
              isExpanded
                ? "bg-[#333] border-[#444] text-white"
                : "bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-[#444]"
            }`}
          >
            <span className="text-gray-500">{RESOURCE_ICONS[type]}</span>
            {TYPE_LABELS[type]} [{count}]
          </button>
        );
      })}
    </div>
  );
}

export default function BehavioursView({ item, frameworkId }: Props) {
  const resources = useResources(frameworkId);
  const [expandedCategory, setExpandedCategory] = useState<{
    behaviourId: string;
    type: ResourceType;
  } | null>(null);

  const handleBadgeClick = (behaviourId: string, type: ResourceType) => {
    setExpandedCategory((prev) =>
      prev?.behaviourId === behaviourId && prev?.type === type
        ? null
        : { behaviourId, type },
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Level summary */}
      <div className="shrink-0 px-5 pt-3 pb-3 border-b border-[#222]">
        <div className="flex items-center gap-2">
          {item.isDevelopment && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
              AoD
            </span>
          )}
          <p className="text-sm text-gray-500">
            Level {item.score}/{item.maxScore} &middot; {item.scaleName}
          </p>
        </div>
      </div>

      {/* Scrollable behaviours list */}
      <ul className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3">
        {item.behaviours.map((b, i) => {
          const behaviourResources = resources.get(b.id) ?? [];
          const hasResources = behaviourResources.length > 0;
          const isThisExpanded =
            expandedCategory?.behaviourId === b.id;

          return (
            <li
              key={b.id}
              className="rounded-xl bg-[#111] border border-[#222] overflow-hidden"
            >
              <div className="p-4 flex items-start gap-3">
                <span className="text-xs text-gray-600 font-mono tabular-nums mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-300 leading-relaxed">{b.text}</span>
                  {hasResources && (
                    <ResourceCounts
                      behaviourId={b.id}
                      resources={behaviourResources}
                      expanded={expandedCategory}
                      onBadgeClick={handleBadgeClick}
                    />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isThisExpanded && expandedCategory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 pl-11 space-y-2">
                      {behaviourResources
                        .filter((r) => r.type === expandedCategory.type)
                        .map((r, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-[#0a0a0a] border border-[#222] p-3"
                          >
                            <span className="text-gray-500 mt-0.5 shrink-0">
                              {RESOURCE_ICONS[r.type]}
                            </span>
                            <div className="min-w-0 flex-1">
                              {r.url ? (
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  {r.title}
                                </a>
                              ) : (
                                <span className="text-sm text-gray-300">{r.title}</span>
                              )}
                              {r.author && (
                                <span className="text-xs text-gray-500 block mt-0.5">
                                  {r.author}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
