"use client";
import type { ArtifactPayload } from "@/shared";
import { fmtDate } from "@/lib/format";

export default function ProvenancePanel({ p }: { p: ArtifactPayload }) {
  const r = p.result;
  return (
    <section aria-labelledby="prov-h" className="card mt-8 p-5">
      <h2 id="prov-h" className="text-lg font-semibold">Sources, method and caveats</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold">Sources</h3>
          <ul className="space-y-2 text-sm">
            {Object.entries(r.sources).map(([k, s]) => (
              <li key={k}><span className="font-medium">{s.title}</span> — {s.publisher}, {s.period}{s.isSample && <span className="badge ml-2">Sample</span>}{s.licence && <span className="block text-muted">{s.licence}</span>}</li>
            ))}
          </ul>
          <h3 className="mb-2 mt-5 text-sm font-semibold">Caveats</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">{r.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">How the numbers were produced</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm">{r.operations.map((o) => <li key={o.id}>{o.description}</li>)}</ol>
          <h3 className="mb-2 mt-5 text-sm font-semibold">Versions</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted">Artifact version</dt><dd>{p.version.version}</dd>
            <dt className="text-muted">Analysis engine</dt><dd>{r.meta.analysisVersion}</dd>
            <dt className="text-muted">Presentation planner</dt><dd>{p.version.plannerVersion}</dd>
            <dt className="text-muted">Computed</dt><dd>{fmtDate(r.meta.computedAt)}</dd>
            <dt className="text-muted">Saved</dt><dd>{fmtDate(p.version.createdAt)}</dd>
            {Object.entries(r.meta.datasetVersions).map(([k, v]) => (<div key={k} className="contents"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>))}
          </dl>
        </div>
      </div>
    </section>
  );
}
