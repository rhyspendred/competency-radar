import { useState, useMemo } from "react";
import framework from "../data/ux-framework.json";
import userData from "../data/user-data.json";

export interface CompetencyItem {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  scaleName: string;
  isDevelopment: boolean;
  behaviours: { id: string; text: string }[];
}

const scale = framework.scale as Record<string, string>;
const maxScore = Math.max(...Object.keys(scale).map(Number));

export function useCompetencyData() {
  const [scores, setScores] = useState<Record<string, number>>(
    () => ({ ...(userData.scores as Record<string, number>) }),
  );

  const [developmentAreas, setDevelopmentAreas] = useState<Set<string>>(
    () => new Set<string>(userData["areas-of-development"]),
  );

  const [behavioursMet, setBehavioursMet] = useState<Set<string>>(
    () => new Set<string>(userData["behaviours-met"] ?? []),
  );

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
          isDevelopment: developmentAreas.has(cat.id) && score >= 1 && score < maxScore,
          behaviours: cat.behaviours,
        };
      }),
    [scores, developmentAreas],
  );

  const setScore = (id: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(maxScore, value)),
    }));
  };

  const toggleDevelopment = (id: string) => {
    setDevelopmentAreas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBehaviourMet = (behaviourId: string) => {
    setBehavioursMet((prev) => {
      const next = new Set(prev);
      if (next.has(behaviourId)) next.delete(behaviourId);
      else next.add(behaviourId);
      return next;
    });
  };

  return {
    frameworkId: framework.frameworkId,
    frameworkName: framework.name,
    data,
    setScore,
    toggleDevelopment,
    behavioursMet,
    toggleBehaviourMet,
  };
}
