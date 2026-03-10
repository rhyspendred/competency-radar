import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CompetencyItem } from "../hooks/useCompetencyData";
import { useResources } from "../hooks/useResources";
import type { Resource, ResourceType } from "../hooks/useResources";

interface Props {
  item: CompetencyItem;
  frameworkId: string;
  behavioursMet: Set<string>;
  onToggleBehaviour: (behaviourId: string) => void;
}

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  book: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  ),
  video: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  topic: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  training: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  article: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  tool: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

const TYPE_LABELS: Record<ResourceType, string> = {
  book: "Books",
  video: "Videos",
  topic: "Topics",
  training: "Training",
  article: "Articles",
  tool: "Tools",
};

/* ── Bottom drawer for resource list ───────────────────────────────────── */

function ResourceDrawer({
  behaviourText,
  type,
  resources,
  onClose,
}: {
  behaviourText: string;
  type: ResourceType;
  resources: Resource[];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden
      />

      {/* Drawer panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="relative bg-[#111] border-t border-[#222] rounded-t-2xl max-h-[70vh] flex flex-col shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#333]" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 flex items-center justify-between shrink-0">
          <div className="min-w-0 flex-1 pr-4">
            <h3 className="text-sm font-semibold text-white">{TYPE_LABELS[type]}</h3>
            <p className="text-xs text-gray-500 truncate mt-0.5">{behaviourText}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#222] text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Resource list */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-4 pb-4 [-webkit-overflow-scrolling:touch]">
          <ul className="space-y-2">
            {resources.map((r, i) => (
              <li key={i}>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl bg-[#1a1a1a] border border-[#222] p-4 text-left hover:border-[#333] transition-colors"
                  >
                    <span className="text-gray-500 mt-0.5 shrink-0">{RESOURCE_ICONS[r.type]}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-blue-400 block">{r.title}</span>
                      {r.author && (
                        <span className="text-xs text-gray-500 block mt-0.5">{r.author}</span>
                      )}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-gray-500 mt-0.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ) : (
                  <div className="flex items-start gap-3 rounded-xl bg-[#1a1a1a] border border-[#222] p-4">
                    <span className="text-gray-500 mt-0.5 shrink-0">{RESOURCE_ICONS[r.type]}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-gray-300 block">{r.title}</span>
                      {r.author && (
                        <span className="text-xs text-gray-500 block mt-0.5">{r.author}</span>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Resource pills (solid, large touch target) ────────────────────────── */

function ResourcePills({
  behaviourId,
  behaviourText,
  resources,
  onPillClick,
}: {
  behaviourId: string;
  behaviourText: string;
  resources: Resource[];
  onPillClick: (behaviourId: string, behaviourText: string, type: ResourceType, resources: Resource[]) => void;
}) {
  const byType = resources.reduce(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type].push(r);
      return acc;
    },
    {} as Record<ResourceType, Resource[]>,
  );

  const typeOrder: ResourceType[] = ["book", "video", "topic", "training", "article", "tool"];
  const entries = typeOrder.filter((t) => (byType[t]?.length ?? 0) > 0);

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {entries.map((type) => {
        const items = byType[type] ?? [];
        const count = items.length;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onPillClick(behaviourId, behaviourText, type, items)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#2a2a2a] text-sm text-gray-200 hover:bg-[#333] active:bg-[#333] transition-colors cursor-pointer touch-manipulation"
          >
            <span className="text-gray-500">{RESOURCE_ICONS[type]}</span>
            <span>{TYPE_LABELS[type]}</span>
            {count > 1 && <span className="text-gray-500">({count})</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function BehavioursView({ item, frameworkId, behavioursMet, onToggleBehaviour }: Props) {
  const resources = useResources(frameworkId);
  const [drawer, setDrawer] = useState<{
    behaviourText: string;
    type: ResourceType;
    resources: Resource[];
  } | null>(null);

  const handlePillClick = (
    _behaviourId: string,
    behaviourText: string,
    type: ResourceType,
    typeResources: Resource[],
  ) => {
    setDrawer({ behaviourText, type, resources: typeResources });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Level summary */}
      <div className="shrink-0 pt-3 pb-3 border-b border-[#222]">
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

      {/* Behaviours list */}
      <ul
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-4 space-y-4 [-webkit-overflow-scrolling:touch]"
      >
        {item.behaviours.map((b) => {
          const behaviourResources = resources.get(b.id) ?? [];
          const isMet = behavioursMet.has(b.id);
          return (
            <li key={b.id} className="border-b border-[#222] pb-4 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onToggleBehaviour(b.id)}
                  className={`shrink-0 w-6 h-6 mt-0.5 rounded border-2 flex items-center justify-center cursor-pointer touch-manipulation transition-colors ${
                    isMet
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-[#444] bg-[#1a1a1a] hover:border-[#555]"
                  }`}
                  aria-label={isMet ? `Unmark "${b.text.slice(0, 30)}..." as achieved` : `Mark "${b.text.slice(0, 30)}..." as achieved`}
                  aria-pressed={isMet}
                >
                  {isMet && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 leading-relaxed">{b.text}</p>
                  <ResourcePills
                    behaviourId={b.id}
                    behaviourText={b.text}
                    resources={behaviourResources}
                    onPillClick={handlePillClick}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Resource drawer */}
      <AnimatePresence>
        {drawer && (
          <ResourceDrawer
            key="resource-drawer"
            behaviourText={drawer.behaviourText}
            type={drawer.type}
            resources={drawer.resources}
            onClose={() => setDrawer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
