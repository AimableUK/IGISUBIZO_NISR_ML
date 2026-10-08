"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data, isPending } = useSession();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => { if (!isPending && !data) router.replace(`/login?next=${encodeURIComponent(path)}`); }, [data, isPending, router, path]);
  if (isPending || !data) return <div role="status" className="flex items-center justify-center gap-2 p-24 text-muted"><Loader2 className="h-5 w-5 animate-spin" aria-hidden />Checking your session…</div>;
  return <>{children}</>;
}
