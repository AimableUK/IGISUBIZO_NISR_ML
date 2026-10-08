"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useWorkspace } from "@/store/workspace";
import WorkspaceView from "@/components/workspace/WorkspaceView";

type Versions = { version: number; note: string | null; createdAt: string; plannerVersion: string }[];

function Loader() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const v = sp.get("version") ? Number(sp.get("version")) : undefined;
  const load = useWorkspace((s) => s.load);
  const clear = useWorkspace((s) => s.clear);
  const loaded = useWorkspace((s) => s.payload?.artifact.id === id);
  const [versions, setVersions] = useState<Versions>([]);
  const [err, setErr] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  const fetchIt = useCallback(async () => {
    setErr(null);
    try { const [p, vs] = await Promise.all([api.get(id, v), api.versions(id)]); load(p); setVersions(vs); }
    catch (e) { setErr(e instanceof ApiError ? e : new ApiError("Unexpected error.", 0)); }
  }, [id, v, load]);
  useEffect(() => { void fetchIt(); }, [fetchIt, tick]);
  useEffect(() => () => clear(), [clear]);

  if (err) return (
    <div role="alert" className="mx-auto max-w-xl px-4 py-24 text-center"><AlertCircle className="mx-auto h-8 w-8 text-danger" aria-hidden />
      <h1 className="mt-3 text-2xl font-semibold">{err.status === 404 ? "We could not find this analysis" : "This analysis could not be loaded"}</h1><p className="mt-2 text-muted">{err.message}</p>
      <div className="mt-6 flex justify-center gap-2">{err.status !== 404 && <button className="btn" onClick={() => setTick((t) => t + 1)}>Try again</button>}<Link href="/history" className="btn btn-primary">Go to history</Link></div></div>
  );
  if (!loaded) return <div role="status" className="flex items-center justify-center gap-2 p-24 text-muted"><Loader2 className="h-5 w-5 animate-spin" aria-hidden />Opening saved analysis…</div>;
  return <WorkspaceView versions={versions} onSaved={(n) => { router.replace(`/workspace/${id}?version=${n}`); setTick((t) => t + 1); }} />;
}
export default function Page() { return <Suspense fallback={null}><Loader /></Suspense>; }
