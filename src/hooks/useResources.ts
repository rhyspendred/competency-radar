import { useMemo } from "react";
import uxResources from "../data/ux-resources.json";

export type ResourceType = "book" | "video" | "topic" | "training" | "article" | "tool";

export interface Resource {
  type: ResourceType;
  title: string;
  author?: string;
  url?: string;
}

type ResourcePack = {
  frameworkId: string;
  resources: Record<string, Resource[]>;
};

const packs: ResourcePack[] = [uxResources as ResourcePack];

export function useResources(frameworkId: string): Map<string, Resource[]> {
  return useMemo(() => {
    const pack = packs.find((p) => p.frameworkId === frameworkId);
    if (!pack) return new Map();

    const map = new Map<string, Resource[]>();
    for (const [behaviourId, resources] of Object.entries(pack.resources)) {
      map.set(behaviourId, resources as Resource[]);
    }
    return map;
  }, [frameworkId]);
}
