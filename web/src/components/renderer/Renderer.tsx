"use client";
import type { ComponentType } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Component, Leaf } from "@/shared";
import { useRender } from "./context";
import Frame, { spanMd } from "./Frame";
import { ChartBlock, FilterBlock, FormulaBlock, MapBlock, MetricBlock, TableBlock, TextBlock } from "./blocks";

type Props = { c: never; expanded?: boolean };
/** The only things that can render. Anything else falls through to <Unsupported/>. */
const REGISTRY: Record<string, ComponentType<Props>> = {
  metric: MetricBlock as ComponentType<Props>, bar: ChartBlock as ComponentType<Props>, line: ChartBlock as ComponentType<Props>,
  area: ChartBlock as ComponentType<Props>, scatter: ChartBlock as ComponentType<Props>, table: TableBlock as ComponentType<Props>,
  map: MapBlock as ComponentType<Props>, text: TextBlock as ComponentType<Props>, formula: FormulaBlock as ComponentType<Props>, filter: FilterBlock as ComponentType<Props>,
};

function Unsupported({ type }: { type: string }) {
  return <p role="alert" className="text-sm text-danger">Component type “{type}” is not supported and was not rendered.</p>;
}

function Leafy({ c, nested }: { c: Leaf; nested?: boolean }) {
  const Block = Object.hasOwn(REGISTRY, c.type) ? REGISTRY[c.type] : undefined;
  return (
    <Frame c={c} nested={nested}>
      {(expanded) => (Block ? <Block c={c as never} expanded={expanded} /> : <Unsupported type={c.type} />)}
    </Frame>
  );
}

function Section({ c }: { c: Extract<Component, { type: "section" }> }) {
  const r = useRender();
  const collapsed = !!r.cz.overrides[c.id]?.collapsed;
  return (
    <section aria-labelledby={`t-${c.id}`} className="cell" style={{ ["--span" as string]: c.layout.span, ["--span-md" as string]: spanMd(c.layout.span) }}>
      <div className="mb-3 flex items-center justify-between">
        <h2 id={`t-${c.id}`} className="text-lg font-semibold">{c.title}</h2>
        <button className="btn-icon h-9 w-9" aria-expanded={!collapsed} aria-label={`${collapsed ? "Expand" : "Collapse"} section ${c.title}`} onClick={() => r.toggleCollapse(c.id)}>
          {collapsed ? <ChevronDown className="h-4 w-4" aria-hidden /> : <ChevronUp className="h-4 w-4" aria-hidden />}
        </button>
      </div>
      {!collapsed && <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">{c.children.map((ch) => <Leafy key={ch.id} c={ch} nested />)}</div>}
    </section>
  );
}

export default function Renderer({ components }: { components: Component[] }) {
  const r = useRender();
  return (
    <div ref={r.gridRef} className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
      {components.map((c) => (c.type === "section" ? <Section key={c.id} c={c} /> : <Leafy key={c.id} c={c} />))}
    </div>
  );
}
