"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, LogOut, Upload } from "lucide-react";
import { authClient, signOut, useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { useToasts } from "@/store/toasts";

export default function Settings() {
  const { data } = useSession();
  const { t } = useI18n();
  const router = useRouter();
  const push = useToasts((s) => s.push);
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState<string | null>(null);

  const upload = async (f: File) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type) || f.size > 2_000_000) return push(t("set.photoInvalid"), "error");
    setBusy(true);
    try {
      const a = await api.imagekitAuth();
      const fd = new FormData();
      fd.append("file", f); fd.append("fileName", `avatar-${data?.user.id}`); fd.append("folder", `/mboni/${data?.user.id}/avatars`); fd.append("useUniqueFileName", "true");
      fd.append("publicKey", a.publicKey); fd.append("token", a.token); fd.append("expire", String(a.expire)); fd.append("signature", a.signature);
      const { data: up } = await axios.post<{ url: string }>("https://upload.imagekit.io/api/v1/files/upload", fd);
      await authClient.updateUser({ image: up.url });
      push(t("set.photoUpdated"), "success");
    } catch { push(t("set.photoFail"), "error"); }
    finally { setBusy(false); }
  };

  if (!data) return null;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">{t("set.title")}</h1>
      <section aria-labelledby="p-h" className="card mt-6 space-y-5 p-5">
        <h2 id="p-h" className="text-lg font-semibold">{t("set.profile")}</h2>
        <div className="flex items-center gap-4">
          {data.user.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={data.user.image} alt={t("set.photoAlt")} className="h-16 w-16 rounded-full border border-line object-cover" /> : <div aria-hidden className="flex h-16 w-16 items-center justify-center rounded-full bg-tint text-xl font-semibold text-on-tint">{data.user.name.slice(0, 1).toUpperCase()}</div>}
          <div><input ref={file} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" id="avatar" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            <button className="btn" disabled={busy} onClick={() => file.current?.click()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}{t("set.changePhoto")}</button></div>
        </div>
        <form onSubmit={async (e) => { e.preventDefault(); if (!name?.trim()) return; await authClient.updateUser({ name: name.trim() }); push(t("set.nameUpdated"), "success"); }} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1"><label htmlFor="nm" className="mb-1 block text-sm font-medium">{t("set.name")}</label><input id="nm" className="field" defaultValue={data.user.name} onChange={(e) => setName(e.target.value)} /></div>
          <button className="btn" type="submit">{t("set.saveName")}</button>
        </form>
        <p className="text-sm text-muted">{t("set.signedInAs", { email: data.user.email })}</p>
      </section>
      <button className="btn mt-6" onClick={async () => { await signOut(); router.push("/"); }}><LogOut className="h-4 w-4" aria-hidden />{t("set.signOut")}</button>
    </div>
  );
}
