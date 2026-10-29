"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useWorkspace } from "@/store/workspace";
import { useHistory } from "@/components/shell/HistoryProvider";
import MboniEye from "@/components/mboni/MboniEye";
import { useAppTheme } from "@/components/mboni/useAppTheme";
import WorkspaceView from "@/components/workspace/WorkspaceView";

type Versions = {
  version: number;
  note: string | null;
  createdAt: string;
  plannerVersion: string;
}[];

function Loader() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const { refresh } = useHistory();
  const theme = useAppTheme();
  const v = sp.get("version") ? Number(sp.get("version")) : undefined;
  const load = useWorkspace((s) => s.load);
  const clear = useWorkspace((s) => s.clear);
  const loaded = useWorkspace((s) => s.payload?.artifact.id === id);
  const [versions, setVersions] = useState<Versions>([]);
  const [err, setErr] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  const fetchIt = useCallback(async () => {
    setErr(null);
    try {
      const [p, vs] = await Promise.all([api.get(id, v), api.versions(id)]);
      load(p);
      setVersions(vs);
    } catch (e) {
      setErr(e instanceof ApiError ? e : new ApiError("", 0));
    }
  }, [id, v, load]);
  useEffect(() => {
    void fetchIt();
  }, [fetchIt, tick]);
  useEffect(() => () => clear(), [clear]);

  if (err) {
    const notFound = err.status === 404;
    return (
      <div role="alert" className="mx-auto max-w-xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-danger" aria-hidden />
        <h1 className="mt-3 text-2xl font-semibold">
          {notFound ? t("an.notFound") : t("an.loadFail")}
        </h1>
        <p className="mt-2 text-muted">
          {notFound ? t("an.notFoundBody") : t("an.loadFailBody")}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          {!notFound && (
            <button className="btn" onClick={() => setTick((n) => n + 1)}>
              {t("ws.tryAgain")}
            </button>
          )}
          <Link href="/history" className="btn btn-primary">
            {t("an.goHistory")}
          </Link>
        </div>
      </div>
    );
  }

  if (!loaded)
    return (
      <div
        role="status"
        aria-busy="true"
        className="flex min-h-full items-center justify-center px-6"
      >
        <div aria-hidden>
          <MboniEye state="scanning" width={120} theme={theme} />
        </div>
      </div>
    );

  return (
    <WorkspaceView
      versions={versions}
      onSaved={(n) => {
        router.replace(`/workspace/${id}?version=${n}`);
        setTick((k) => k + 1);
        refresh();
      }}
    />
  );
}
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Loader />
    </Suspense>
  );
}
