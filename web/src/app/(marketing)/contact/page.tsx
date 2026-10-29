"use client";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import RichTextField from "@/components/ui/RichTextField";
import { PageShell } from "@/components/marketing/PageShell";
import { api, ApiError } from "@/lib/api";
import { useDocumentTitle, useT } from "@/i18n";

export default function Contact() {
  const t = useT();
  const c = t.contact;
  useDocumentTitle(c.metaTitle);
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | { error: string }>("idle");
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("busy");
    try {
      await api.contact({ name: String(f.get("name")), email: String(f.get("email")), message: msg });
      setState("done");
    } catch (err) {
      // Server messages are shown as returned; the fallback is translated.
      setState({ error: err instanceof ApiError ? err.message : c.failed });
    }
  }

  return (
    <PageShell title={c.title} intro={c.lead}>
      <div className="max-w-2xl">
        {email && <p className="text-sm text-muted">{c.orWrite} <a className="font-medium text-primary underline underline-offset-2" href={`mailto:${email}`}>{email}</a>.</p>}
        {state === "done" ? (
          <div role="status" className="card mt-6 p-6">
            <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-2 text-xl font-semibold">{c.sentTitle}</h2>
            <p className="mt-1 text-muted">{c.sentBody}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
            {typeof state === "object" && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-danger p-3 text-sm text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{state.error}
              </p>
            )}
            <div><label htmlFor="name" className="mb-1 block text-sm font-medium">{c.name}</label><input id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" className="field" /></div>
            <div><label htmlFor="email" className="mb-1 block text-sm font-medium">{c.email}</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
            <RichTextField label={c.message} onChange={setMsg} placeholder={c.placeholder} />
            <button className="btn btn-primary" disabled={state === "busy" || msg.trim().length < 10}>
              {state === "busy" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}{c.send}
            </button>
            {msg.trim().length < 10 && <p className="text-xs text-muted">{c.minHint}</p>}
          </form>
        )}
      </div>
    </PageShell>
  );
}
