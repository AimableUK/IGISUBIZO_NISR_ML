import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-28 text-center">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted">The page you asked for does not exist or has moved.</p>
      <div className="mt-6 flex justify-center gap-2"><Link href="/" className="btn">Home</Link><Link href="/workspace" className="btn btn-primary">Start an analysis</Link></div>
    </div>
  );
}
