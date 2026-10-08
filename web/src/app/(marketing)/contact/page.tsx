"use client";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import RichTextField from "@/components/ui/RichTextField";
import { api, ApiError } from "@/lib/api";

export default function Contact() {
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | { error: string }>("idle");
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("busy");
    try { await api.contact({ name: String(f.get("name")), email: String(f.get("email")), message: msg }); setState("done"); }
    catch (err) { setState({ error: err instanceof ApiError ? err.message : "Your message could not be sent." }); }
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-semibold">Contact us</h1>
      <p className="mt-3 text-lg text-muted">Questions, corrections, data requests or accessibility problems. We read everything.</p>
      {email && <p className="mt-2 text-sm text-muted">Or write to <a className="font-medium text-primary underline underline-offset-2" href={`mailto:${email}`}>{email}</a>.</p>}
      {state === "done" ? (
        <div role="status" className="card mt-8 p-6"><CheckCircle2 className="h-6 w-6 text-primary" aria-hidden /><h2 className="mt-2 text-xl font-semibold">Message sent</h2><p className="mt-1 text-muted">Thank you. We will reply to the address you gave.</p></div>
      ) : (
        <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
          {typeof state === "object" && <p role="alert" className="flex items-start gap-2 rounded-lg border border-danger p-3 text-sm text-danger"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{state.error}</p>}
          <div><label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label><input id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" className="field" /></div>
          <div><label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
          <RichTextField label="Message" onChange={setMsg} placeholder="How can we help?" />
          <button className="btn btn-primary" disabled={state === "busy" || msg.trim().length < 10}>{state === "busy" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}Send message</button>
          {msg.trim().length < 10 && <p className="text-xs text-muted">Write at least 10 characters to send.</p>}
        </form>
      )}
    </div>
  );
}
