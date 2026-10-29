"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import MboniEye from "@/components/mboni/MboniEye";
import { useAppTheme } from "@/components/mboni/useAppTheme";
import { useSession } from "@/lib/auth-client";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isPending } = useSession();
  const router = useRouter();
  const path = usePathname();
  const theme = useAppTheme();

  useEffect(() => {
    if (!isPending && !data)
      router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [data, isPending, router, path]);

  if (isPending || !data) {
    return (
      // Pinned to the screen itself, so it is centred on any device no matter what wraps it.
      <div
        role="status"
        className="fixed inset-0 z-50 flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6"
      >
        <div aria-hidden>
          {/* Wakes up once, then rests on the still eye. */}
          <MboniEye state="activate" width={160} theme={theme} />
        </div>
        <span className="font-display text-xl font-semibold tracking-tight">
          Mboni
        </span>
      </div>
    );
  }
  return <>{children}</>;
}
