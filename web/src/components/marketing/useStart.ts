"use client";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

/**
 * Same sign-in behaviour as the original landing page: signed-in users go straight to the
 * workspace, everyone else goes to /login and is sent on afterwards.
 */
export function useStart() {
  const router = useRouter();
  const { data: session } = useSession();
  const href = (q?: string) => {
    const target = q ? `/workspace?q=${encodeURIComponent(q)}&run=1` : "/workspace";
    return session ? target : `/login?next=${encodeURIComponent(target)}`;
  };
  return { href, go: (q?: string) => router.push(href(q)) };
}
