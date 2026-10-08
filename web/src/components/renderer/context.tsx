"use client";
import { createContext, useContext } from "react";
import type { AnalyticalResult, Customizations, FilterComponent, FilterValueT, SwitchType } from "@/shared";

export interface RenderCtx {
  result: AnalyticalResult;
  filters: FilterComponent[];
  cz: Customizations;
  arrange: boolean;
  setFilter: (id: string, v: FilterValueT) => void;
  setSpan: (id: string, span: number) => void;
  move: (id: string, dir: -1 | 1) => void;
  moveTo: (id: string, targetId: string) => void;
  toggleCollapse: (id: string) => void;
  switchType: (id: string, t: SwitchType | null) => void;
  gridRef: React.RefObject<HTMLDivElement | null>;
}
export const RenderContext = createContext<RenderCtx | null>(null);
export function useRender() {
  const c = useContext(RenderContext);
  if (!c) throw new Error("RenderContext missing");
  return c;
}
