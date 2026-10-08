"use client";
import { useMemo, useRef, useState } from "react";
import { flattenComponents, type AnalyticalResult, type Component, type Customizations, type FilterComponent, type FilterValueT, type SwitchType } from "@/shared";
import { RenderContext, type RenderCtx } from "./context";

const noop = () => {};
/** Read-only render context for previews (playground): local filter state, no arrange actions. */
export function PreviewProvider({ result, components, children }: { result: AnalyticalResult; components: Component[]; children: React.ReactNode }) {
  const [filters, setFilters] = useState<Customizations["filters"]>({});
  const gridRef = useRef<HTMLDivElement | null>(null);
  const value = useMemo<RenderCtx>(() => ({
    result, filters: flattenComponents({ components } as never).filter((c): c is FilterComponent => c.type === "filter"),
    cz: { order: [], overrides: {}, filters }, arrange: false,
    setFilter: (id: string, v: FilterValueT) => setFilters((f) => ({ ...f, [id]: v })),
    setSpan: noop, move: noop, moveTo: noop, toggleCollapse: noop, switchType: noop as (id: string, t: SwitchType | null) => void, gridRef,
  }), [result, components, filters]);
  return <RenderContext.Provider value={value}>{children}</RenderContext.Provider>;
}
