import { useState, useRef, useEffect, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  animate as fmAnimate,
  useMotionValue,
} from "framer-motion";
import { useCompetencyData } from "../hooks/useCompetencyData";
import CompetencyRadar from "./CompetencyRadar";
import BehavioursView from "./BehavioursView";

const SPRING = { type: "spring" as const, stiffness: 400, damping: 25 };
const SIDE_MARGIN = 16;
const MAX_WIDTH = 500;
const CARD_GAP = 12;
const COPIES = 5;

const BLUE_SHADES = ["#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"];
const ORANGE_SHADES = [
  "#fdba74",
  "#fb923c",
  "#f97316",
  "#ea580c",
  "#c2410c",
];

const MENU_ITEMS = [
  { id: "profile", label: "Profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", hasDrawer: true },
  { id: "frameworks", label: "Frameworks", icon: "M12 2L2 7l10 5 10-5-10-5z|M2 17l10 5 10-5|M2 12l10 5 10-5", hasDrawer: false },
  { id: "export", label: "Export Data", icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M7 10l5 5 5-5|M12 15V3", hasDrawer: false },
  { id: "settings", label: "Settings", icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z|M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", hasDrawer: false },
  { id: "about", label: "About", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z|M12 16v-4|M12 8h.01", hasDrawer: false },
];

/* ── SVG icon helper ──────────────────────────────────────── */

function MenuIcon({ path }: { path: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path.split("|").map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/* ── Animated score digit ─────────────────────────────────── */

function AnimatedScore({ value }: { value: number }) {
  const prevRef = useRef(value);
  const dirRef = useRef(0);

  if (value !== prevRef.current) {
    dirRef.current = value > prevRef.current ? 1 : -1;
    prevRef.current = value;
  }

  const dir = dirRef.current;

  return (
    <span
      className="relative inline-block overflow-hidden tabular-nums text-center"
      style={{ height: "1.15em", width: "0.65em" }}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ y: dir > 0 ? "100%" : "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: dir > 0 ? "-100%" : "100%" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute inset-x-0"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── Animated label (scale name) ──────────────────────────── */

function AnimatedLabel({ text, value }: { text: string; value: number }) {
  const prevRef = useRef(value);
  const dirRef = useRef(0);

  if (value !== prevRef.current) {
    dirRef.current = value > prevRef.current ? 1 : -1;
    prevRef.current = value;
  }

  const dir = dirRef.current;

  return (
    <span
      className="relative inline-block overflow-hidden text-right"
      style={{ height: "1.3em" }}
    >
      <span className="invisible whitespace-nowrap">{text}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={text}
          initial={{ y: dir > 0 ? "100%" : "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: dir > 0 ? "-100%" : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute inset-x-0 whitespace-nowrap text-right"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── Drawer content: Profile (example) ────────────────────── */

function ProfileDrawer({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="absolute inset-0 z-50 bg-black flex flex-col"
    >
      <header className="shrink-0 h-11 flex items-center px-4 gap-3">
        <motion.button
          whileTap={{ scale: 0.95, opacity: 0.8 }}
          transition={SPRING}
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          &larr; Back
        </motion.button>
        <h2 className="text-sm font-semibold text-white">Profile</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </label>
          <div className="h-11 rounded-xl bg-[#111] border border-[#222] px-4 flex items-center text-sm text-gray-500">
            Not set
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Role
          </label>
          <div className="h-11 rounded-xl bg-[#111] border border-[#222] px-4 flex items-center text-sm text-gray-500">
            UX Designer
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Organisation
          </label>
          <div className="h-11 rounded-xl bg-[#111] border border-[#222] px-4 flex items-center text-sm text-gray-500">
            Not set
          </div>
        </div>

        <div className="pt-4 space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Framework
          </label>
          <div className="rounded-xl bg-[#111] border border-[#222] px-4 py-3 space-y-1">
            <p className="text-sm text-white">UX Competency Framework</p>
            <p className="text-xs text-gray-500">David Travis &middot; 8 competencies &middot; 5-point scale</p>
          </div>
        </div>

        <div className="pt-4 space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Last updated
          </label>
          <p className="text-sm text-gray-400 px-1">—</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Dashboard ────────────────────────────────────────────── */

export default function Dashboard() {
  const { frameworkName, data, setScore } = useCompetencyData();
  const n = data.length;
  const midStart = Math.floor(COPIES / 2) * n;

  const [selectedId, setSelectedId] = useState(data[0]?.id ?? "");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef({ id: "", score: 0 });
  const [contentWidth, setContentWidth] = useState(0);

  const repeated = useMemo(() => {
    const arr: typeof data = [];
    for (let c = 0; c < COPIES; c++) arr.push(...data);
    return arr;
  }, [data]);

  const selected = data.find((d) => d.id === selectedId) ?? data[0];
  const detailItem = detailId ? data.find((d) => d.id === detailId) : null;

  const cardW = contentWidth || 280;
  const stride = cardW + CARD_GAP;

  const [activeTriIdx, setActiveTriIdx] = useState(midStart);
  const prevTriIdx = useRef(midStart);
  const x = useMotionValue(0);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContentWidth(
        Math.min(entries[0].contentRect.width - SIDE_MARGIN * 2, MAX_WIDTH),
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const containerW = mainRef.current?.clientWidth ?? 375;
    const target = containerW / 2 - cardW / 2 - activeTriIdx * stride;
    const idxChanged = activeTriIdx !== prevTriIdx.current;
    prevTriIdx.current = activeTriIdx;
    if (idxChanged) {
      fmAnimate(x, target, { type: "spring", stiffness: 400, damping: 35 });
    } else {
      x.set(target);
    }
  }, [activeTriIdx, cardW, stride, x]);

  useEffect(() => {
    const targetDataIdx = data.findIndex((d) => d.id === selectedId);
    if (targetDataIdx < 0) return;
    setActiveTriIdx((prev) => {
      const currentDataIdx = ((prev % n) + n) % n;
      let delta = targetDataIdx - currentDataIdx;
      if (delta > n / 2) delta -= n;
      if (delta < -n / 2) delta += n;
      let next = prev + delta;
      if (next < 0 || next >= COPIES * n) {
        next = midStart + targetDataIdx;
      }
      return next;
    });
  }, [selectedId, n, data, midStart]);

  useEffect(() => {
    if (!selected) return;
    const prev = prevRef.current;
    if (prev.id === selected.id && selected.score > prev.score) {
      const el = carouselRef.current?.querySelector(
        `[data-active="true"]`,
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

  const handleMenuItemClick = (item: (typeof MENU_ITEMS)[number]) => {
    setMenuOpen(false);
    if (item.hasDrawer) {
      setDrawerId(item.id);
    }
  };

  return (
    <div
      ref={mainRef}
      className="h-full bg-black text-white flex flex-col overflow-hidden relative"
    >
      {/* App bar */}
      <header className="shrink-0 h-11 flex items-center justify-between px-4 z-20">
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
          <div className="w-10" />
        )}
        <h1 className="text-sm font-semibold tracking-tight text-white truncate px-2">
          {detailItem ? detailItem.label : frameworkName}
        </h1>
        <div className="w-10 flex justify-end">
          {!detailItem && (
            <motion.button
              whileTap={{ scale: 0.95, opacity: 0.8 }}
              transition={SPRING}
              onClick={() => setMenuOpen(true)}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 -mr-1"
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
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
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
          {/* Wrapping card carousel */}
          <div className="shrink-0 overflow-hidden py-2 relative">
            <div
              className="absolute inset-y-0 left-0 z-10 pointer-events-none"
              style={{
                width: `calc(50% - ${cardW / 2 + 8}px)`,
                background: "linear-gradient(to right, black 80%, transparent)",
              }}
            />
            <div
              className="absolute inset-y-0 right-0 z-10 pointer-events-none"
              style={{
                width: `calc(50% - ${cardW / 2 + 8}px)`,
                background: "linear-gradient(to left, black 80%, transparent)",
              }}
            />
            <motion.div
              ref={carouselRef}
              className="flex"
              style={{ x, gap: CARD_GAP }}
            >
              {repeated.map((item, triIdx) => {
                const isActive = triIdx === activeTriIdx;
                return (
                  <motion.div
                    key={`${item.id}-${Math.floor(triIdx / n)}`}
                    data-active={isActive ? "true" : undefined}
                    animate={{
                      scale: isActive ? 1 : 0.93,
                      opacity: isActive ? 1 : 0.4,
                    }}
                    transition={SPRING}
                    onClick={() => setSelectedId(item.id)}
                    className="shrink-0 rounded-2xl overflow-hidden bg-[#111] border border-[#222] cursor-pointer"
                    style={{ width: cardW }}
                  >
                    <div
                      className={`px-4 py-2.5 flex items-center justify-between gap-3 ${
                        item.isTarget ? "bg-orange-500" : "bg-blue-600"
                      }`}
                    >
                      <h2 className="text-base font-bold text-white truncate">
                        {item.label}
                      </h2>
                      {item.isTarget && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white shrink-0">
                          Target
                        </span>
                      )}
                    </div>

                    <div className="px-4 pt-3 pb-4 space-y-3">
                      <div className="flex items-center font-bold">
                        <span className="text-4xl text-white">
                          <AnimatedScore value={item.score} />
                        </span>
                        <span className="text-2xl text-gray-300 ml-auto">
                          <AnimatedLabel
                            text={item.scaleName}
                            value={item.score}
                          />
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        {Array.from({ length: item.maxScore }, (_, j) => (
                          <div
                            key={j}
                            className="h-2 flex-1 rounded-full transition-colors duration-200"
                            style={{
                              backgroundColor:
                                j < item.score
                                  ? item.isTarget
                                    ? ORANGE_SHADES[j]
                                    : BLUE_SHADES[j]
                                  : "#222",
                            }}
                          />
                        ))}
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-2 pt-1">
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
                            View Behaviours
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Chart */}
          <div className="flex-1 min-h-0 pt-3">
            <CompetencyRadar
              data={data}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onScoreChange={setScore}
            />
          </div>
        </>
      )}

      {/* ── Side menu overlay ──────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-40 bg-black/70"
            onClick={() => setMenuOpen(false)}
          >
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="absolute top-0 right-0 bottom-0 w-64 bg-[#0a0a0a] border-l border-[#222] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-11 flex items-center justify-between px-4 shrink-0">
                <span className="text-sm font-semibold text-white">Menu</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1 -mr-1"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto py-2">
                {MENU_ITEMS.map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98, opacity: 0.7 }}
                    onClick={() => handleMenuItemClick(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="text-gray-500">
                      <MenuIcon path={item.icon} />
                    </span>
                    {item.label}
                    {item.hasDrawer && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="ml-auto text-gray-600"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="shrink-0 px-4 py-3 border-t border-[#222]">
                <p className="text-[10px] text-gray-600">
                  Competency Radar v0.1
                </p>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Drawer (slides over everything) ────────────────── */}
      <AnimatePresence>
        {drawerId === "profile" && (
          <ProfileDrawer onClose={() => setDrawerId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
