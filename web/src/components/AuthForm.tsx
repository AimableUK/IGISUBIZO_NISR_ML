"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Sprout,
  Store,
} from "lucide-react";
import { authClient, signIn, signUp } from "@/lib/auth-client";
import { BambooGrove } from "@/components/marketing/Bamboo";
import HeroScene from "@/components/marketing/HeroScene";
import LanguageSwitcher from "@/components/marketing/LanguageSwitcher";
import { useT } from "@/i18n";

type Mode = "login" | "signup" | "forgot" | "reset";
const LINK = "font-medium text-primary underline underline-offset-2";
const POINT_ICONS = [GraduationCap, Store, Sprout];

/** Left side: green hills, volcanoes and bamboo. A slim banner on phones, a full panel from md up. */
function BrandPanel() {
  const t = useT();
  const p = t.auth.panel;
  return (
    <aside className="relative isolate flex min-h-[148px] flex-col justify-between overflow-hidden bg-[#253D2C] p-6 text-white md:min-h-[640px] md:p-10">
      <div className="absolute inset-0 -z-20">
        <HeroScene label={p.sceneLabel} />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#253D2C]/85 via-[#253D2C]/35 to-transparent"
      />
      <BambooGrove
        mirror
        className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[78%] w-auto opacity-90 md:h-[62%]"
      />
      <BambooGrove className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden h-[30%] w-auto md:block" />

      <Link
        href="/"
        className="font-display text-xl font-semibold text-[#CFFFDC] underline-offset-4 hover:underline"
      >
        {t.common.brand}
      </Link>

      <div className="hidden max-w-[30ch] md:block">
        <h2 className="text-3xl font-semibold leading-tight">{p.title}</h2>
        <p className="mt-3 text-[#CFFFDC]/90">{p.body}</p>
        <ul className="mt-6 space-y-3">
          {p.points.map((x, i) => {
            const Icon = POINT_ICONS[i];
            return (
              <li key={x} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#CFFFDC]/15 text-[#CFFFDC]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {x}
              </li>
            );
          })}
        </ul>
      </div>
      <span className="hidden md:block" aria-hidden />
    </aside>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    // The width is set against the viewport, not the parent: the auth layout wraps children in a
    // narrow column (the old single card fit it), so w-full / max-w would stay ~28rem wide.
    <div className="relative left-1/2 my-6 w-[min(1040px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-card border border-line bg-surface md:grid md:grid-cols-[0.9fr_1.1fr]">
      <BrandPanel />
      <div className="flex flex-col p-6 sm:p-10">
        <div className="my-auto">{children}</div>
      </div>
    </div>
  );
}

function Form({ mode }: { mode: Mode }) {
  const t = useT();
  const a = t.auth;
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/workspace";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? ""),
      password = String(f.get("password") ?? ""),
      name = String(f.get("name") ?? "");
    try {
      if (mode === "login") {
        const r = await signIn.email({ email, password });
        if (r.error)
          setError(
            r.error.status === 403
              ? a.messages.confirmEmailFirst
              : a.messages.badCredentials,
          );
        else router.push(safeNext);
      } else if (mode === "signup") {
        const r = await signUp.email({
          email,
          password,
          name,
          callbackURL: `${location.origin}${safeNext}`,
        });
        // Server messages are shown as returned; the fallback is translated.
        if (r.error) setError(r.error.message ?? a.messages.createFailed);
        else setDone(a.messages.signupDone);
      } else if (mode === "forgot") {
        await authClient.requestPasswordReset({
          email,
          redirectTo: `${location.origin}/reset-password`,
        });
        setDone(a.messages.forgotDone);
      } else {
        const token = sp.get("token");
        if (!token) return setError(a.messages.missingToken);
        const r = await authClient.resetPassword({
          newPassword: password,
          token,
        });
        if (r.error) setError(a.messages.resetExpired);
        else router.push("/login");
      }
    } catch {
      setError(a.messages.network);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Shell>
        <div role="status">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tint text-on-tint">
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-3xl font-semibold">{a.done.title}</h1>
          <p className="mt-2 max-w-[44ch] text-muted">{done}</p>
          <Link href="/login" className="btn mt-6">
            {a.done.back}
          </Link>
        </div>
      </Shell>
    );
  }

  const m = a.modes[mode];
  const pw = (autoComplete: string) => (
    <div>
      <label htmlFor="password" className="mb-1 block text-sm font-medium">
        {mode === "reset" ? a.fields.newPassword : a.fields.password}
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          required
          minLength={10}
          autoComplete={autoComplete}
          placeholder={
            mode === "login" ? a.fields.phPassword : a.fields.phNewPassword
          }
          className="field pr-12"
          aria-describedby={mode !== "login" ? "pw-hint" : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-pressed={show}
          aria-label={show ? a.fields.hide : a.fields.show}
          className="btn-icon absolute right-0 top-0"
        >
          {show ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      {mode !== "login" && (
        <p id="pw-hint" className="mt-1 text-xs text-muted">
          {a.fields.pwHint}
        </p>
      )}
    </div>
  );

  return (
    <Shell>
      <form onSubmit={submit} className="space-y-4" noValidate={false}>
        <div>
          <h1 className="text-3xl font-semibold">{m.h}</h1>
          <p className="mt-2 max-w-[44ch] text-muted">{m.sub}</p>
        </div>
        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger p-3 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              {a.fields.name}
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              autoComplete="name"
              placeholder={a.fields.phName}
              className="field"
            />
          </div>
        )}
        {mode !== "reset" && (
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              {a.fields.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={a.fields.phEmail}
              className="field"
            />
          </div>
        )}
        {mode === "login" && pw("current-password")}
        {mode === "signup" && pw("new-password")}
        {mode === "reset" && pw("new-password")}
        <button
          className="btn btn-primary w-full !min-h-[48px]"
          disabled={busy}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {m.cta}
        </button>
        <div className="flex flex-col items-center gap-3 text-center text-sm text-muted">
          {mode === "login" && (
            <>
              <Link className={LINK} href="/forgot-password">
                {a.links.forgot}
              </Link>
              <span>
                {a.links.newHere}{" "}
                <Link
                  className={LINK}
                  href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                >
                  {a.links.create}
                </Link>
              </span>
            </>
          )}
          {mode === "signup" && (
            <span>
              {a.links.already}{" "}
              <Link className={LINK} href="/login">
                {a.links.signIn}
              </Link>
            </span>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <Link className={LINK} href="/login">
              {a.links.back}
            </Link>
          )}
        </div>
      </form>
    </Shell>
  );
}

export default function AuthForm({ mode }: { mode: Mode }) {
  return (
    <Suspense fallback={null}>
      <Form mode={mode} />
    </Suspense>
  );
}
