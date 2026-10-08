"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import RichTextField from "@/components/ui/RichTextField";

export default function SaveVersionDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (note: string) => Promise<void> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="sv-h" className="m-auto w-[min(520px,94vw)] rounded-card border border-line bg-surface p-0 text-ink">
      {open && (
        <form className="space-y-4 p-5" onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await onSave(note.trim()); setNote(""); } finally { setBusy(false); } }}>
          <div className="flex items-start justify-between"><h2 id="sv-h" className="text-lg font-semibold">Save as new version</h2><button type="button" className="btn-icon -mr-2 -mt-2" aria-label="Close" onClick={onClose}><X className="h-5 w-5" aria-hidden /></button></div>
          <p className="text-sm text-muted">Your layout and customizations are saved as a new version. The analytical result stays exactly as it was.</p>
          <RichTextField label="What changed? (optional)" onChange={setNote} placeholder="e.g. Moved the map above the table" />
          <div className="flex justify-end gap-2"><button type="button" className="btn" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}Save version</button></div>
        </form>
      )}
    </dialog>
  );
}
