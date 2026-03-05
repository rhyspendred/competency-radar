import { useState, useMemo } from "react";
import framework from "../data/ux-framework.json";
import userData from "../data/user-data.json";

export interface CompetencyItem {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  scaleName: string;
  isTarget: boolean;
  behaviours: string[];
}

const scale = framework.scale as Record<string, string>;
const maxScore = Math.max(...Object.keys(scale).map(Number));

export function useCompetencyData() {
  const [scores, setScores] = useState<Record<string, number>>(
    () => ({ ...(userData.scores as Record<string, number>) }),
  );

  const targets = useMemo(() => new Set<string>(userData.targets), []);

  const data: CompetencyItem[] = useMemo(
    () =>
      framework.categories.map((cat) => {
        const score = scores[cat.id] ?? 0;
        return {
          id: cat.id,
          label: cat.label,
          score,
          maxScore,
          scaleName: scale[String(score)] ?? "Unrated",
          isTarget: targets.has(cat.id),
          behaviours: cat.behaviours,
        };
      }),
    [scores, targets],
  );

  const setScore = (id: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(maxScore, value)),
    }));
  };

  return { frameworkName: framework.name, data, setScore };
}
