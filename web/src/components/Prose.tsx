export default function Prose({ title, intro, updated, children }: { title: string; intro?: string; updated?: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-semibold leading-tight">{title}</h1>
      {intro && <p className="mt-3 max-w-[60ch] text-lg text-muted">{intro}</p>}
      {updated && <p className="mt-2 text-sm text-muted">Last updated {updated}</p>}
      <div className="prose-page mt-8">{children}</div>
    </article>
  );
}
