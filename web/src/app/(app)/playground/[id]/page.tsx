"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, RotateCcw, Save, Undo2, Redo2 } from "lucide-react";
import { flattenComponents, parseSpecJson, validateSpecAgainstResult, type ArtifactPayload, type Component, type PresentationSpec, type SpecIssue } from "@/shared";
import { api, ApiError } from "@/lib/api";
import { useToasts } from "@/store/toasts";
import Renderer from "@/components/renderer/Renderer";
import { PreviewProvider } from "@/components/renderer/RenderProvider";

const pretty = (o: unknown) => JSON.stringify(o, null, 2);

function Editor({ p }: { p: ArtifactPayload }) {
  const router = useRouter();
  const push = useToasts((t) => t.push);
  const initial = useMemo(() => pretty(p.spec), [p.spec]);
  const [text, setText] = useState(initial);
  const [hist, setHist] = useState<string[]>([initial]);
  const [at, setAt] = useState(0);
  const skip = useRef(false);
  const [sel, setSel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const lastValid = useRef<PresentationSpec>(p.spec);

  // Idle-debounced history so undo steps are meaningful.
  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    const t = setTimeout(() => { setHist((h) => (h[at] === text ? h : [...h.slice(0, at + 1), text])); setAt((a) => (hist[a] === text ? a : a + 1)); }, 700);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const check = useMemo(() => {
    const v = parseSpecJson(text);
    if (!v.ok) return { spec: null as PresentationSpec | null, issues: v.issues };
    const issues: SpecIssue[] = validateSpecAgainstResult(v.spec, p.result);
    return { spec: issues.length ? null : v.spec, issues };
  }, [text, p.result]);
  if (check.spec) lastValid.current = check.spec;
  const preview = check.spec ?? lastValid.current;
  const comps = useMemo(() => flattenComponents(preview), [preview]);
  const selected = comps.find((c) => c.id === sel) ?? null;

  const jump = (i: number) => { skip.current = true; setAt(i); setText(hist[i]!); };
  const edit = (fn: (c: Record<string, any>) => void) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      const o = JSON.parse(text); const walk = (list: any[]) => { for (const c of list) { if (c.id === sel) fn(c); if (Array.isArray(c.children)) walk(c.children); } }; // eslint-disable-line @typescript-eslint/no-explicit-any
      walk(o.components); setText(pretty(o));
    } catch { /* editor is invalid JSON: inspector is disabled */ }
  };

  const save = async () => {
    if (!check.spec) return;
    setSaving(true);
    try { const { version } = await api.saveVersion(p.artifact.id, { spec: check.spec, customizations: p.customizations, note: note.trim() || "Edited in playground" }); push(`Saved as version ${version}.`, "success"); router.push(`/workspace/${p.artifact.id}?version=${version}`); }
    catch (e) { push(e instanceof ApiError ? e.message : "Could not save.", "error"); setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
      <Link href={`/workspace/${p.artifact.id}`} className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-primary"><ArrowLeft className="h-4 w-4" aria-hidden />Back to workspace</Link>
      <h1 className="text-2xl font-semibold">Playground</h1>
      <p className="mt-1 max-w-[70ch] text-sm text-muted">Edit the presentation specification. Only supported component types render, nothing here can run code, and the analytical result stays fixed.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(380px,1fr)_1.4fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Editor tools">
            <button className="btn" disabled={at === 0} onClick={() => jump(at - 1)}><Undo2 className="h-4 w-4" aria-hidden />Undo</button>
            <button className="btn" disabled={at >= hist.length - 1} onClick={() => jump(at + 1)}><Redo2 className="h-4 w-4" aria-hidden />Redo</button>
            <button className="btn" onClick={() => { setText(initial); push("Reverted to the saved specification."); }}><RotateCcw className="h-4 w-4" aria-hidden />Revert to saved</button>
          </div>
          <div>
            <label htmlFor="spec" className="mb-1 block text-sm font-medium">Presentation specification (JSON)</label>
            <textarea id="spec" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-invalid={!check.spec} aria-describedby="spec-status" className="field h-[420px] resize-y font-mono text-[13px] leading-5" />
          </div>
          <div id="spec-status" role="status" aria-live="polite" className={`card p-3 text-sm ${check.issues.length ? "border-danger" : "border-primary"}`}>
            {check.issues.length === 0 ? <p className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />Valid specification</p> : (
              <><p className="flex items-center gap-2 font-medium text-danger"><AlertCircle className="h-4 w-4" aria-hidden />{check.issues.length} problem{check.issues.length > 1 ? "s" : ""} to fix. The preview shows the last valid version.</p>
                <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-5">{check.issues.slice(0, 20).map((i, k) => <li key={k}><code className="rounded bg-surface2 px-1">{i.path}</code> {i.message}</li>)}</ul></>
            )}
          </div>
          <section aria-labelledby="insp-h" className="card p-4">
            <h2 id="insp-h" className="font-semibold">Component inspector</h2>
            <label htmlFor="pick" className="mt-3 block text-sm font-medium">Component</label>
            <select id="pick" className="field" value={sel ?? ""} onChange={(e) => setSel(e.target.value || null)}>
              <option value="">Select a component</option>
              {comps.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
            </select>
            {selected && <Inspector c={selected} disabled={!check.spec} edit={edit} />}
          </section>
          <section className="card p-4"><h2 className="font-semibold">Save</h2>
            <label htmlFor="note" className="mt-2 block text-sm font-medium">Note (optional)</label><input id="note" className="field" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn btn-primary mt-3" disabled={!check.spec || saving || text === initial} onClick={save}>{saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}Save as new version</button>
            {text === initial && <p className="mt-2 text-xs text-muted">Make a change to enable saving.</p>}
          </section>
        </div>

        <section aria-labelledby="prev-h" className="min-w-0">
          <h2 id="prev-h" className="mb-3 text-lg font-semibold">Live preview</h2>
          <div className="rounded-card border border-dashed border-line p-4" data-palette={preview.palette}>
            <PreviewProvider result={p.result} components={preview.components}><Renderer components={preview.components as Component[]} /></PreviewProvider>
          </div>
        </section>
      </div>
    </div>
  );
}

function Inspector({ c, disabled, edit }: { c: Component; disabled: boolean; edit: (fn: (c: Record<string, any>) => void) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <div className="mt-4 space-y-3">
      <div><label htmlFor="i-title" className="block text-sm font-medium">Title</label><input id="i-title" className="field" disabled={disabled} defaultValue={c.title} key={c.id} onBlur={(e) => e.target.value !== c.title && edit((x) => { x.title = e.target.value; })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label htmlFor="i-span" className="block text-sm font-medium">Width (3–12)</label><input id="i-span" type="number" min={3} max={12} className="field" disabled={disabled} defaultValue={c.layout.span} key={`${c.id}s`} onBlur={(e) => edit((x) => { x.layout = { ...x.layout, span: Math.min(12, Math.max(3, Number(e.target.value) || 6)) }; })} /></div>
        <div><label htmlFor="i-h" className="block text-sm font-medium">Height</label><select id="i-h" className="field" disabled={disabled} value={c.layout.height} onChange={(e) => edit((x) => { x.layout = { ...x.layout, height: e.target.value }; })}><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option></select></div>
      </div>
      <details className="text-sm"><summary className="cursor-pointer font-medium text-primary">All properties (read-only)</summary><pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-surface2 p-3 text-xs">{JSON.stringify(c, null, 2)}</pre></details>
    </div>
  );
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<ArtifactPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { api.get(id).then(setP).catch((e) => setErr(e instanceof ApiError ? e.message : "Could not load.")); }, [id]);
  if (err) return <div role="alert" className="mx-auto max-w-xl p-16 text-center"><p>{err}</p><Link href="/history" className="btn mt-4">Back to history</Link></div>;
  if (!p) return <div role="status" className="flex items-center justify-center gap-2 p-24 text-muted"><Loader2 className="h-5 w-5 animate-spin" aria-hidden />Loading playground…</div>;
  return <Editor p={p} />;
}
