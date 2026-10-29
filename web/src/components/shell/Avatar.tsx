import { cx } from "./cx";

export default function Avatar({ name, image, className }: { name: string; image?: string | null; className?: string }) {
  const size = "h-8 w-8 shrink-0 rounded-full";
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className={cx(size, "border border-line object-cover", className)} />;
  }
  return (
    <span aria-hidden className={cx(size, "flex items-center justify-center bg-tint text-sm font-semibold text-on-tint", className)}>
      {name.trim().slice(0, 1).toUpperCase() || "?"}
    </span>
  );
}
