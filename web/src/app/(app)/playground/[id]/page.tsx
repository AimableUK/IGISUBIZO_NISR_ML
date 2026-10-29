"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, RotateCcw, Save, Undo2, Redo2 } from "lucide-react";
import { flattenComponents, parseSpecJson, validateSpecAgainstResult, type ArtifactPayload, type Component, type PresentationSpec, type SpecIssue } from "@/shared";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useHistory } from "@/components/shell/HistoryProvider";
import { useToasts } from "@/store/toasts";
import Renderer from "@/components/renderer/Renderer";
import { PreviewProvider } from "@/components/renderer/RenderProvider";

const pretty = (o: unknown) => JSON.stringify(o, null, 2);

function Editor({ p }: { p: ArtifactPayload }) {
  const router = useRouter();
  const { t } = useI18n();
  const { refresh } = useHistory();
  const push = useToasts((s) => s.push);
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
    const timer = setTimeout(() => { setHist((h) => (h[at] === text ? h : [...h.slice(0, at + 1), text])); setAt((a) => (hist[a] === text ? a : a + 1)); }, 700);
    return () => clearTimeout(timer);
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
    try { const { version } = await api.saveVersion(p.artifact.id, { spec: check.spec, customizations: p.customizations, note: note.trim() || t("pg.defaultNote") }); push(t("pg.savedAs", { n: version }), "success"); refresh(); router.push(`/workspace/${p.artifact.id}?version=${version}`); }
    catch { push(t("pg.saveFail"), "error"); setSaving(false); }
  };

  const n = check.issues.length;
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
      <Link href={`/workspace/${p.artifact.id}`} className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-primary"><ArrowLeft className="h-4 w-4" aria-hidden />{t("pg.back")}</Link>
      <h1 className="text-2xl font-semibold">{t("pg.title")}</h1>
      <p className="mt-1 max-w-[70ch] text-sm text-muted">{t("pg.intro")}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(380px,1fr)_1.4fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2" role="toolbar" aria-label={t("pg.tools")}>
            <button className="btn" disabled={at === 0} onClick={() => jump(at - 1)}><Undo2 className="h-4 w-4" aria-hidden />{t("pg.undo")}</button>
            <button className="btn" disabled={at >= hist.length - 1} onClick={() => jump(at + 1)}><Redo2 className="h-4 w-4" aria-hidden />{t("pg.redo")}</button>
            <button className="btn" onClick={() => { setText(initial); push(t("pg.reverted")); }}><RotateCcw className="h-4 w-4" aria-hidden />{t("pg.revert")}</button>
          </div>
          <div>
            <label htmlFor="spec" className="mb-1 block text-sm font-medium">{t("pg.specLabel")}</label>
            <textarea id="spec" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-invalid={!check.spec} aria-describedby="spec-status" className="field h-[420px] resize-y font-mono text-[13px] leading-5" />
          </div>
          <div id="spec-status" role="status" aria-live="polite" className={`card p-3 text-sm ${n ? "border-danger" : "border-primary"}`}>
            {n === 0 ? <p className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />{t("pg.valid")}</p> : (
              <><p className="flex items-center gap-2 font-medium text-danger"><AlertCircle className="h-4 w-4" aria-hidden />{t(n > 1 ? "pg.problemsMany" : "pg.problemsOne", { n })}</p>
                <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-5">{check.issues.slice(0, 20).map((i, k) => <li key={k}><code className="rounded bg-surface2 px-1">{i.path}</code> {i.message}</li>)}</ul></>
            )}
          </div>
          <section aria-labelledby="insp-h" className="card p-4">
            <h2 id="insp-h" className="font-semibold">{t("pg.inspector")}</h2>
            <label htmlFor="pick" className="mt-3 block text-sm font-medium">{t("pg.component")}</label>
            <select id="pick" className="field" value={sel ?? ""} onChange={(e) => setSel(e.target.value || null)}>
              <option value="">{t("pg.selectComponent")}</option>
              {comps.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
            </select>
            {selected && <Inspector c={selected} disabled={!check.spec} edit={edit} />}
          </section>
          <section className="card p-4"><h2 className="font-semibold">{t("pg.save")}</h2>
            <label htmlFor="note" className="mt-2 block text-sm font-medium">{t("pg.note")}</label><input id="note" className="field" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn btn-primary mt-3" disabled={!check.spec || saving || text === initial} onClick={save}>{saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}{t("pg.saveVersion")}</button>
            {text === initial && <p className="mt-2 text-xs text-muted">{t("pg.changeFirst")}</p>}
          </section>
        </div>

        <section aria-labelledby="prev-h" className="min-w-0">
          <h2 id="prev-h" className="mb-3 text-lg font-semibold">{t("pg.preview")}</h2>
          <div className="rounded-card border border-dashed border-line p-4" data-palette={preview.palette}>
            <PreviewProvider result={p.result} components={preview.components}><Renderer components={preview.components as Component[]} /></PreviewProvider>
          </div>
        </section>
      </div>
    </div>
  );
}

function Inspector({ c, disabled, edit }: { c: Component; disabled: boolean; edit: (fn: (c: Record<string, any>) => void) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { t } = useI18n();
  return (
    <div className="mt-4 space-y-3">
      <div><label htmlFor="i-title" className="block text-sm font-medium">{t("pg.compTitle")}</label><input id="i-title" className="field" disabled={disabled} defaultValue={c.title} key={c.id} onBlur={(e) => e.target.value !== c.title && edit((x) => { x.title = e.target.value; })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label htmlFor="i-span" className="block text-sm font-medium">{t("pg.width")}</label><input id="i-span" type="number" min={3} max={12} className="field" disabled={disabled} defaultValue={c.layout.span} key={`${c.id}s`} onBlur={(e) => edit((x) => { x.layout = { ...x.layout, span: Math.min(12, Math.max(3, Number(e.target.value) || 6)) }; })} /></div>
        <div><label htmlFor="i-h" className="block text-sm font-medium">{t("pg.height")}</label><select id="i-h" className="field" disabled={disabled} value={c.layout.height} onChange={(e) => edit((x) => { x.layout = { ...x.layout, height: e.target.value }; })}><option value="sm">{t("pg.small")}</option><option value="md">{t("pg.medium")}</option><option value="lg">{t("pg.large")}</option></select></div>
      </div>
      <details className="text-sm"><summary className="cursor-pointer font-medium text-primary">{t("pg.allProps")}</summary><pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-surface2 p-3 text-xs">{JSON.stringify(c, null, 2)}</pre></details>
    </div>
  );
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [p, setP] = useState<ArtifactPayload | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { api.get(id).then(setP).catch(() => setErr(true)); }, [id]);
  if (err) return <div role="alert" className="mx-auto max-w-xl p-16 text-center"><p>{t("pg.loadFail")}</p><Link href="/history" className="btn mt-4">{t("pg.backHistory")}</Link></div>;
  if (!p) return <div role="status" className="flex items-center justify-center gap-2 p-24 text-muted"><Loader2 className="h-5 w-5 animate-spin" aria-hidden />{t("pg.loading")}</div>;
  return <Editor p={p} />;
}
