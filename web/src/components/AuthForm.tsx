"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { authClient, signIn, signUp } from "@/lib/auth-client";

type Mode = "login" | "signup" | "forgot" | "reset";
const COPY: Record<Mode, { h: string; cta: string }> = {
  login: { h: "Sign in", cta: "Sign in" }, signup: { h: "Create your account", cta: "Create account" },
  forgot: { h: "Reset your password", cta: "Send reset link" }, reset: { h: "Choose a new password", cta: "Save new password" },
};

function Form({ mode }: { mode: Mode }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/workspace";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? ""), password = String(f.get("password") ?? ""), name = String(f.get("name") ?? "");
    try {
      if (mode === "login") {
        const r = await signIn.email({ email, password });
        if (r.error) setError(r.error.status === 403 ? "Confirm your email first. We sent you a link when you signed up." : "That email and password do not match.");
        else router.push(safeNext);
      } else if (mode === "signup") {
        const r = await signUp.email({ email, password, name, callbackURL: `${location.origin}${safeNext}` });
        if (r.error) setError(r.error.message ?? "We could not create your account.");
        else setDone("Account created. Check your inbox for a link to confirm your email, then sign in.");
      } else if (mode === "forgot") {
        await authClient.requestPasswordReset({ email, redirectTo: `${location.origin}/reset-password` });
        setDone("If that address has an account, a reset link is on its way.");
      } else {
        const token = sp.get("token");
        if (!token) return setError("This reset link is missing its token. Request a new one.");
        const r = await authClient.resetPassword({ newPassword: password, token });
        if (r.error) setError("This reset link has expired. Request a new one.");
        else router.push("/login");
      }
    } catch { setError("We could not reach the server. Check your connection and try again."); }
    finally { setBusy(false); }
  }

  if (done) return <div role="status" className="card p-6"><CheckCircle2 className="h-6 w-6 text-primary" aria-hidden /><h1 className="mt-2 text-2xl font-semibold">Check your email</h1><p className="mt-2 text-muted">{done}</p><Link href="/login" className="btn mt-5">Back to sign in</Link></div>;
  const pw = (autoComplete: string) => <div><label htmlFor="password" className="mb-1 block text-sm font-medium">{mode === "reset" ? "New password" : "Password"}</label><input id="password" name="password" type="password" required minLength={10} autoComplete={autoComplete} className="field" aria-describedby={mode !== "login" ? "pw-hint" : undefined} />{mode !== "login" && <p id="pw-hint" className="mt-1 text-xs text-muted">At least 10 characters.</p>}</div>;
  return (
    <form onSubmit={submit} className="card space-y-4 p-6" noValidate={false}>
      <h1 className="text-2xl font-semibold">{COPY[mode].h}</h1>
      {error && <p role="alert" className="flex items-start gap-2 rounded-lg border border-danger p-3 text-sm text-danger"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{error}</p>}
      {mode === "signup" && <div><label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label><input id="name" name="name" required minLength={2} autoComplete="name" className="field" /></div>}
      {mode !== "reset" && <div><label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>}
      {mode === "login" && pw("current-password")}{mode === "signup" && pw("new-password")}{mode === "reset" && pw("new-password")}
      <button className="btn btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{COPY[mode].cta}</button>
      <p className="text-center text-sm text-muted">
        {mode === "login" && (<><Link className="font-medium text-primary underline underline-offset-2" href="/forgot-password">Forgot your password?</Link><br />New here? <Link className="font-medium text-primary underline underline-offset-2" href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link></>)}
        {mode === "signup" && <>Already registered? <Link className="font-medium text-primary underline underline-offset-2" href="/login">Sign in</Link></>}
        {(mode === "forgot" || mode === "reset") && <Link className="font-medium text-primary underline underline-offset-2" href="/login">Back to sign in</Link>}
      </p>
    </form>
  );
}
export default function AuthForm({ mode }: { mode: Mode }) { return <Suspense fallback={null}><Form mode={mode} /></Suspense>; }
