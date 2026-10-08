"use client";
import { useId, useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { filterRows, resolveRef, type Column, type Component, type Dataset, type Row } from "@/shared";
import DataTable from "@/components/ui/DataTable";
import { fmtCell, fmtNumber, fmtUnit, signed } from "@/lib/format";
import { useRender } from "./context";
import TileMap from "./TileMap";

type Of<T extends Component["type"]> = Extract<Component, { type: T }>;
const HEIGHT = { sm: 200, md: 300, lg: 420 } as const;
const DASH = [undefined, "7 4", "2 3", "9 3 2 3", "1 4", "12 4"] as const;
const col = (i: number) => `rgb(var(--c${(i % 6) + 1}))`;
const AX = { fontSize: 12, fill: "rgb(var(--muted))" };

function useData(c: { id: string; dataRef: string }): { ds: Dataset; rows: Row[] } | null {
  const { result, filters, cz } = useRender();
  const ds = resolveRef(result, c.dataRef, "datasets");
  return useMemo(() => (ds ? { ds, rows: filterRows(ds, c.id, filters, cz.filters) } : null), [ds, c.id, filters, cz.filters]);
}
const colOf = (ds: Dataset, key: string) => ds.columns.find((x) => x.key === key);
const MissingData = () => <p className="text-sm text-danger">This component points at data that is not available in the analytical result.</p>;
const NoRows = () => <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">No data matches the current filters.</p>;

/* ------------------------------- shapes ------------------------------- */
function Marker({ i, cx, cy, color }: { i: number; cx?: number; cy?: number; color: string }) {
  if (cx === undefined || cy === undefined) return null;
  const s = 4.5;
  switch (i % 4) {
    case 0: return <circle cx={cx} cy={cy} r={s} fill={color} />;
    case 1: return <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} fill={color} />;
    case 2: return <polygon points={`${cx},${cy - s - 1} ${cx + s + 1},${cy + s} ${cx - s - 1},${cy + s}`} fill={color} />;
    default: return <polygon points={`${cx},${cy - s - 1} ${cx + s + 1},${cy} ${cx},${cy + s + 1} ${cx - s - 1},${cy}`} fill={color} />;
  }
}
function LegendKey({ names }: { names: string[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Legend">
      {names.map((n, i) => (
        <li key={n} className="flex items-center gap-1.5">
          <svg width="30" height="12" aria-hidden><line x1="0" y1="6" x2="30" y2="6" stroke={col(i)} strokeWidth="2" strokeDasharray={DASH[i % 6]} /><Marker i={i} cx={15} cy={6} color={col(i)} /></svg>
          {n}
        </li>
      ))}
    </ul>
  );
}
const tip = { contentStyle: { background: "rgb(var(--surface))", border: "1px solid rgb(var(--line))", borderRadius: 8, color: "rgb(var(--ink))", fontSize: 13 }, cursor: { fill: "rgb(var(--tint) / 0.5)" } } as const;

/* ------------------------------- summary ------------------------------- */
function summarize(c: Of<"bar" | "line" | "area" | "scatter">, ds: Dataset, rows: Row[]): string {
  const y = colOf(ds, c.y); const x = colOf(ds, c.x);
  const f = (v: number) => fmtCell(v, y);
  if (!rows.length) return `${c.title}: no data for the current filters.`;
  if (c.type === "bar") {
    const s = [...rows].filter((r) => typeof r[c.y] === "number").sort((a, b) => (b[c.y] as number) - (a[c.y] as number));
    const hi = s[0], lo = s[s.length - 1];
    return `Bar chart of ${y?.label} by ${x?.label}, ${rows.length} items. Highest: ${hi?.[c.x]} at ${f(hi?.[c.y] as number)}. Lowest: ${lo?.[c.x]} at ${f(lo?.[c.y] as number)}.`;
  }
  if (c.type === "scatter") return `Scatter chart of ${y?.label} against ${x?.label}, ${rows.length} points.`;
  const names = c.series ? [...new Set(rows.map((r) => String(r[c.series!])))] : [y?.label ?? "value"];
  const parts = names.slice(0, 6).map((n) => {
    const rs = c.series ? rows.filter((r) => String(r[c.series!]) === n) : rows;
    const a = rs[0], b = rs[rs.length - 1];
    return `${n}: ${f(a?.[c.y] as number)} in ${a?.[c.x]} to ${f(b?.[c.y] as number)} in ${b?.[c.x]}`;
  });
  return `${c.type === "area" ? "Area" : "Line"} chart of ${y?.label} over ${x?.label}. ${parts.join("; ")}.`;
}

/* ------------------------------- chart ------------------------------- */
export function ChartBlock({ c, expanded }: { c: Of<"bar" | "line" | "area" | "scatter">; expanded?: boolean }) {
  const d = useData(c);
  const sid = useId();
  if (!d) return <MissingData />;
  const { ds, rows } = d;
  if (!rows.length) return <NoRows />;
  const yCol = colOf(ds, c.y); const xCol = colOf(ds, c.x);
  const h = expanded ? 560 : HEIGHT[c.layout.height];
  const summary = c.a11y.summary ?? summarize(c, ds, rows);
  const unit = yCol?.unit ?? (yCol?.kind === "percent" ? "%" : "");
  const tickY = (v: number) => (unit === "%" ? `${v}%` : String(v));
  const fmtTip = (v: unknown) => (typeof v === "number" ? fmtUnit(v, unit) : String(v));

  let chart: React.ReactNode; let legend: string[] | null = null; let boxH = h;
  if (c.type === "bar") {
    let data = [...rows];
    if (c.sort !== "none") data.sort((a, b) => ((a[c.y] as number) - (b[c.y] as number)) * (c.sort === "asc" ? 1 : -1));
    if (c.limit) data = data.slice(0, c.limit);
    const horiz = c.orientation === "horizontal";
    boxH = horiz ? Math.max(h, data.length * 24 + 50) : h;
    chart = (
      <BarChart data={data} layout={horiz ? "vertical" : "horizontal"} margin={{ top: 8, right: 36, bottom: 8, left: 8 }}>
        <CartesianGrid stroke="rgb(var(--line))" horizontal={!horiz} vertical={horiz} />
        {horiz ? <XAxis type="number" tick={AX} tickFormatter={tickY} domain={[0, "auto"]} /> : <XAxis dataKey={c.x} tick={AX} interval={0} angle={-35} textAnchor="end" height={70} />}
        {horiz ? <YAxis type="category" dataKey={c.x} tick={AX} width={92} interval={0} /> : <YAxis tick={AX} tickFormatter={tickY} domain={[0, "auto"]} />}
        <Tooltip {...tip} formatter={fmtTip} />
        <Bar dataKey={c.y} name={yCol?.label} fill="rgb(var(--c1))" radius={horiz ? [0, 3, 3, 0] : [3, 3, 0, 0]} isAnimationActive={false}>
          {data.length <= 40 && <LabelList dataKey={c.y} position={horiz ? "right" : "top"} formatter={fmtTip} style={{ fontSize: 11, fill: "rgb(var(--ink))" }} />}
        </Bar>
      </BarChart>
    );
  } else if (c.type === "scatter") {
    chart = (
      <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
        <CartesianGrid stroke="rgb(var(--line))" />
        <XAxis type="number" dataKey={c.x} name={xCol?.label} tick={AX} label={{ value: xCol?.label, position: "insideBottom", offset: -12, fill: "rgb(var(--muted))", fontSize: 12 }} />
        <YAxis type="number" dataKey={c.y} name={yCol?.label} tick={AX} tickFormatter={tickY} />
        <ZAxis range={[60, 60]} />
        <Tooltip {...tip} cursor={{ strokeDasharray: "3 3" }} formatter={fmtTip} />
        <Scatter data={rows} fill="rgb(var(--c1))" isAnimationActive={false} />
      </ScatterChart>
    );
  } else {
    const names = c.series ? [...new Set(rows.map((r) => String(r[c.series!])))] : [yCol?.label ?? "value"];
    const key = (n: string) => (c.series ? n : c.y);
    const byX = new Map<string, Record<string, string | number>>();
    for (const r of rows) {
      const xv = String(r[c.x]); const o = byX.get(xv) ?? { [c.x]: xv };
      o[c.series ? String(r[c.series]) : c.y] = r[c.y] as number; byX.set(xv, o);
    }
    const data = [...byX.values()];
    legend = names.length > 1 ? names : null;
    const common = { data, margin: { top: 8, right: 20, bottom: 8, left: 0 } };
    const axes = (<>
      <CartesianGrid stroke="rgb(var(--line))" vertical={false} />
      <XAxis dataKey={c.x} tick={AX} />
      <YAxis tick={AX} tickFormatter={tickY} domain={["auto", "auto"]} width={48} />
      <Tooltip {...tip} formatter={fmtTip} />
    </>);
    chart = c.type === "line" ? (
      <LineChart {...common}>{axes}{names.map((n, i) => <Line key={n} type="monotone" dataKey={key(n)} name={n} stroke={col(i)} strokeWidth={2.25} strokeDasharray={DASH[i % 6]} isAnimationActive={false} dot={(p: { cx?: number; cy?: number; index?: number }) => <Marker key={`${n}-${p.index}`} i={i} cx={p.cx} cy={p.cy} color={col(i)} />} />)}</LineChart>
    ) : (
      <AreaChart {...common}>{axes}{names.map((n, i) => <Area key={n} type="monotone" dataKey={key(n)} name={n} stroke={col(i)} fill={col(i)} fillOpacity={0.14} strokeWidth={2.25} strokeDasharray={DASH[i % 6]} isAnimationActive={false} />)}</AreaChart>
    );
  }
  const tableCols: Column[] = [xCol, c.type !== "bar" && c.type !== "scatter" && c.series ? colOf(ds, c.series) : undefined, yCol].filter(Boolean) as Column[];

  return (
    <figure aria-describedby={sid} className="m-0">
      <div style={{ maxHeight: expanded ? "70vh" : h + 8 }} className="overflow-y-auto">
        <div style={{ height: boxH }} role="img" aria-label={`${c.title}. ${summary}`}>
          <ResponsiveContainer width="100%" height="100%">{chart as React.ReactElement}</ResponsiveContainer>
        </div>
      </div>
      {legend && <LegendKey names={legend} />}
      <figcaption id={sid} className="sr-only">{summary}</figcaption>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer py-2 font-medium text-primary">Text summary and data table</summary>
        <p className="mb-3 max-w-[68ch] text-muted">{summary}</p>
        <DataTable caption={`${c.title} data`} columns={tableCols} rows={rows} pageSize={10} />
      </details>
    </figure>
  );
}

/* ------------------------------- others ------------------------------- */
export function MetricBlock({ c }: { c: Of<"metric"> }) {
  const { result } = useRender();
  const m = resolveRef(result, c.valueRef, "metrics");
  if (!m) return <MissingData />;
  const up = (m.delta?.value ?? 0) >= 0;
  return (
    <div>
      <p className="font-display text-4xl font-semibold tabular-nums leading-none">{fmtUnit(m.value, m.unit, m.decimals)}</p>
      <p className="mt-2 text-sm text-muted">{m.label}</p>
      {m.delta && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-tint px-2 py-0.5 text-xs font-medium text-on-tint">
          {up ? <ArrowUpRight aria-hidden className="h-3.5 w-3.5" /> : <ArrowDownRight aria-hidden className="h-3.5 w-3.5" />}
          <span>{signed(m.delta.value, m.decimals)} {m.unit === "%" ? "pp" : m.unit} {m.delta.label}</span>
        </p>
      )}
    </div>
  );
}

export function TableBlock({ c }: { c: Of<"table"> }) {
  const d = useData(c);
  if (!d) return <MissingData />;
  const cols = (c.columns ? c.columns.map((k) => colOf(d.ds, k)) : d.ds.columns).filter(Boolean) as Column[];
  return <DataTable caption={c.title} columns={cols} rows={d.rows} searchable={c.searchable} sortable={c.sortable} pageSize={c.pageSize} />;
}

export function MapBlock({ c }: { c: Of<"map"> }) {
  const d = useData(c);
  if (!d) return <MissingData />;
  const values: Record<string, number> = {};
  for (const r of d.rows) if (typeof r[c.valueKey] === "number") values[String(r[c.regionKey])] = r[c.valueKey] as number;
  const nums = Object.values(values);
  if (!nums.length) return <NoRows />;
  const vc = colOf(d.ds, c.valueKey);
  const tableCols = [colOf(d.ds, c.regionKey), vc].filter(Boolean) as Column[];
  return (
    <div>
      <TileMap mode="value" values={values} unit={vc?.unit ?? (vc?.kind === "percent" ? "%" : "")} label={`${c.title}: ${vc?.label} by ${colOf(d.ds, c.regionKey)?.label}`} min={Math.min(...nums)} max={Math.max(...nums)} />
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer py-2 font-medium text-primary">Data table</summary>
        <DataTable caption={`${c.title} data`} columns={tableCols} rows={d.rows} pageSize={10} />
      </details>
    </div>
  );
}

export function TextBlock({ c }: { c: Of<"text"> }) {
  const { result } = useRender();
  const items = c.insightRefs.map((r) => resolveRef(result, r, "insights")).filter(Boolean);
  return (
    <div className="space-y-3 text-[0.95rem] leading-relaxed">
      {items.map((i, k) => <p key={k} className="max-w-[68ch]">{i!.text}</p>)}
      {c.body && <p className="max-w-[68ch] text-muted">{c.body}</p>}
      {!items.length && !c.body && <p className="text-muted">Nothing to show here.</p>}
    </div>
  );
}

export function FormulaBlock({ c }: { c: Of<"formula"> }) {
  const { result } = useRender();
  const f = resolveRef(result, c.formulaRef, "formulas");
  if (!f) return <MissingData />;
  return (
    <div className="space-y-2 text-sm">
      <p className="font-medium">{f.label}</p>
      <p className="rounded-md bg-surface2 px-3 py-2 font-mono">{f.expression}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 tabular-nums">
        {Object.entries(f.inputs).map(([k, v]) => (<div key={k} className="contents"><dt className="text-muted">{k}</dt><dd>{fmtNumber(v, f.decimals)}</dd></div>))}
        <dt className="font-semibold">Result</dt><dd className="font-semibold">{fmtUnit(f.value, f.unit, f.decimals)}</dd>
      </dl>
      <p className="max-w-[60ch] text-muted">{f.description}</p>
    </div>
  );
}

export function FilterBlock({ c }: { c: Of<"filter"> }) {
  const { result, cz, setFilter } = useRender();
  const ds = resolveRef(result, c.dataRef, "datasets");
  const id = useId();
  if (!ds) return <MissingData />;
  const options = [...new Set(ds.rows.map((r) => String(r[c.field])))].sort();
  const val = Object.hasOwn(cz.filters, c.id) ? cz.filters[c.id] : null;
  const label = colOf(ds, c.field)?.label ?? c.field;
  const matching = filterRows(ds, "", [c], cz.filters).length;

  return (
    <div className="flex flex-wrap items-end gap-4">
      {c.control === "select" && (
        <div>
          <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
          <select id={id} className="field min-w-[200px]" value={typeof val === "string" ? val : ""} onChange={(e) => setFilter(c.id, e.target.value || null)}>
            <option value="">All</option>
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      )}
      {c.control === "multiselect" && (
        <fieldset className="flex flex-wrap gap-3"><legend className="mb-1 text-sm font-medium">{label}</legend>
          {options.map((o) => { const sel = Array.isArray(val) && typeof val[0] === "string" ? (val as string[]) : []; return (
            <label key={o} className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[rgb(var(--primary))]" checked={sel.includes(o)} onChange={(e) => { const n = e.target.checked ? [...sel, o] : sel.filter((x) => x !== o); setFilter(c.id, n.length ? n : null); }} />{o}</label>); })}
        </fieldset>
      )}
      {c.control === "range" && (() => {
        const nums = ds.rows.map((r) => r[c.field]).filter((v): v is number => typeof v === "number");
        const lo = Math.min(...nums), hi = Math.max(...nums);
        const cur: [number, number] = Array.isArray(val) && typeof val[0] === "number" ? (val as [number, number]) : [lo, hi];
        return (<>
          <div><label htmlFor={`${id}a`} className="mb-1 block text-sm font-medium">{label} from</label><input id={`${id}a`} type="number" className="field w-32" value={cur[0]} min={lo} max={hi} onChange={(e) => setFilter(c.id, [Number(e.target.value), cur[1]])} /></div>
          <div><label htmlFor={`${id}b`} className="mb-1 block text-sm font-medium">to</label><input id={`${id}b`} type="number" className="field w-32" value={cur[1]} min={lo} max={hi} onChange={(e) => setFilter(c.id, [cur[0], Number(e.target.value)])} /></div>
        </>);
      })()}
      {val !== null && <button className="btn" onClick={() => setFilter(c.id, null)}>Clear filter</button>}
      <p className="pb-3 text-sm text-muted" role="status" aria-live="polite">Showing {matching} of {ds.rows.length} rows</p>
    </div>
  );
}
