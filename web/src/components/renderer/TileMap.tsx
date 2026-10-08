"use client";
import { DISTRICT_TILES, PROVINCES, type Province } from "@/shared";
import { fmtUnit } from "@/lib/format";

type Props =
  | { mode: "value"; values: Record<string, number>; unit?: string; label: string; min: number; max: number }
  | { mode: "province"; label: string };

const PROVINCE_FILL: Record<Province, string> = {
  Kigali: "bg-primary text-on-primary",
  Northern: "bg-sage text-[rgb(37_61_44)]",
  Eastern: "bg-tint text-on-tint border-primary",
  Southern: "bg-surface2 text-ink",
  Western: "bg-surface text-ink border-primary",
};

/** Schematic district tile map (north up, not to scale). Value mode never relies on colour alone: every tile prints its value. */
export default function TileMap(p: Props) {
  return (
    <div>
      <ol role="list" aria-label={p.label} className="grid gap-1" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
        {Object.entries(DISTRICT_TILES).map(([name, t]) => {
          const v = p.mode === "value" ? p.values[name] : undefined;
          const known = v !== undefined;
          const pct = p.mode === "value" && known ? ((v - p.min) / Math.max(0.0001, p.max - p.min)) * 100 : 0;
          const style = p.mode === "value"
            ? { gridColumn: t.col + 1, gridRow: t.row + 1, background: known ? `color-mix(in srgb, rgb(var(--primary)) ${Math.round(12 + pct * 0.88)}%, rgb(var(--tint)))` : "transparent" }
            : { gridColumn: t.col + 1, gridRow: t.row + 1 };
          const dark = p.mode === "value" && pct > 52;
          return (
            <li
              key={name}
              tabIndex={p.mode === "value" ? 0 : undefined}
              aria-label={p.mode === "value" ? `${name}: ${known ? fmtUnit(v, p.unit) : "no data"}` : `${name}, ${t.province} province`}
              title={name}
              style={style}
              className={`flex aspect-square min-h-[44px] flex-col items-center justify-center overflow-hidden rounded-md border border-line px-0.5 text-center leading-tight ${p.mode === "province" ? PROVINCE_FILL[t.province] : dark ? "text-on-primary" : "text-ink"} ${p.mode === "value" && !known ? "border-dashed" : ""}`}
            >
              <span className="w-full truncate text-[10px] font-medium sm:text-[11px]">{name}</span>
              {p.mode === "value" && <span className="text-xs font-semibold sm:text-sm">{known ? fmtUnit(v, p.unit, 1) : "—"}</span>}
            </li>
          );
        })}
      </ol>
      {p.mode === "value" ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted" aria-hidden="true">
          <span>{fmtUnit(p.min, p.unit)}</span>
          <span className="h-2 flex-1 rounded-full border border-line" style={{ background: "linear-gradient(90deg, rgb(var(--tint)), rgb(var(--primary)))" }} />
          <span>{fmtUnit(p.max, p.unit)}</span>
        </div>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2 text-xs">
          {PROVINCES.map((pr) => <li key={pr} className={`rounded border border-line px-2 py-1 ${PROVINCE_FILL[pr]}`}>{pr}</li>)}
        </ul>
      )}
      <p className="mt-2 text-xs text-muted">Schematic map: one tile per district, north at the top, not to scale.</p>
    </div>
  );
}
