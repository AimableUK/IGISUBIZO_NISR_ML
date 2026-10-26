"use client";

import { useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AdminPage() {
  const [log, setLog] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);

  async function run(action: "generate" | "evaluate") {
    setLoading(action);
    setLog("Running...");
    try {
      const res = await fetch(`${API}/api/admin/train`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      const out = [data.stdout, data.stderr].filter(Boolean).join("\n\n--- STDERR ---\n\n");
      setLog(out || JSON.stringify(data, null, 2));
    } catch (e) {
      setLog(String(e));
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Model Training (Admin)</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">Home</Link>
      </div>
      <p className="mb-6 text-sm text-slate-600">
        Regenerate NISR-structure data and run training/evaluation. Requires admin access (first user).
      </p>
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => run("generate")}
          disabled={loading !== null}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading === "generate" ? "Generating..." : "Regenerate Data"}
        </button>
        <button
          onClick={() => run("evaluate")}
          disabled={loading !== null}
          className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading === "evaluate" ? "Evaluating..." : "Train & Evaluate"}
        </button>
      </div>
      <pre className="overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-100 max-h-[60vh] whitespace-pre-wrap">
        {log || "No output yet."}
      </pre>
    </main>
  );
}
