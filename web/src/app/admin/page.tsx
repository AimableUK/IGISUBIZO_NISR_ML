"use client";

import { useState } from "react";
import Link from "next/link";
import { useDocumentTitle, useT } from "@/i18n";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Action = "generate" | "evaluate";
type Status = "idle" | "running" | "success" | "error";

const STATUS_STYLE: Record<Status, string> = {
  idle: "bg-slate-100 text-slate-600 ring-slate-200",
  running: "bg-amber-50 text-amber-700 ring-amber-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  error: "bg-red-50 text-red-700 ring-red-200",
};

const DOT_STYLE: Record<Status, string> = {
  idle: "bg-slate-400",
  running: "bg-amber-500 animate-pulse",
  success: "bg-emerald-500",
  error: "bg-red-500",
};

export default function AdminPage() {
  const t = useT();
  const a = t.admin;
  useDocumentTitle(a.title);

  const [log, setLog] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [active, setActive] = useState<Action | null>(null);
  const [meta, setMeta] = useState<{
    action: Action;
    secs: string;
    at: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const busy = active !== null;

  async function run(action: Action) {
    const started = Date.now();
    setActive(action);
    setStatus("running");
    setLog(a.running);
    setMeta(null);
    try {
      const res = await fetch(`${API}/api/admin/train`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        setLog(a.denied);
        setStatus("error");
        return;
      }
      const parts = [
        data.stdout,
        data.stderr ? `--- ${a.stderr} ---\n${data.stderr}` : "",
      ].filter(Boolean);
      setLog(parts.join("\n\n") || JSON.stringify(data, null, 2));
      setStatus(res.ok && !data.error ? "success" : "error");
    } catch (e) {
      setLog(String(e));
      setStatus("error");
    } finally {
      setMeta({
        action,
        secs: ((Date.now() - started) / 1000).toFixed(1),
        at: new Date().toLocaleTimeString(),
      });
      setActive(null);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(log);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function clear() {
    setLog("");
    setMeta(null);
    setStatus("idle");
  }

  const actions: Action[] = ["generate", "evaluate"];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {a.title}
              </h1>
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white">
                {a.badge}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              {a.intro}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            ← {a.home}
          </Link>
        </div>

        {/* Action cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {actions.map((key) => {
            const s = a.steps[key];
            const isActive = active === key;
            const primary =
              key === "generate"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-emerald-600 hover:bg-emerald-700";
            return (
              <section
                key={key}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {s.step}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {s.title}
                </h2>
                <p className="mt-1 min-h-[2.5rem] text-sm text-slate-600">
                  {s.desc}
                </p>
                <button
                  onClick={() => run(key)}
                  disabled={busy}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${primary}`}
                >
                  {isActive && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {isActive ? s.busy : s.cta}
                </button>
              </section>
            );
          })}
        </div>

        {/* Console */}
        <section className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-xs font-medium text-slate-300">
                {a.console}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${STATUS_STYLE[status]}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${DOT_STYLE[status]}`}
                />
                {a.status[status]}
              </span>
              {meta && (
                <span className="text-[11px] text-slate-400">
                  {a.steps[meta.action].title} · {meta.secs}s · {meta.at}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copy}
                disabled={!log}
                className="rounded border border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
              >
                {copied ? a.copied : a.copy}
              </button>
              <button
                onClick={clear}
                disabled={!log || busy}
                className="rounded border border-slate-700 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
              >
                {a.clear}
              </button>
            </div>
          </div>
          <pre className="max-h-[55vh] min-h-[16rem] overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-slate-100">
            {log || <span className="text-slate-500">{a.empty}</span>}
          </pre>
        </section>

        <p className="mt-4 text-xs text-slate-500">{a.tip}</p>
      </div>
    </main>
  );
}
