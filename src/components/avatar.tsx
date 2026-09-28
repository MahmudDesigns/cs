import { initials } from "@/lib/format";

export function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-base",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-moss/25 bg-moss/10 font-display font-semibold uppercase tracking-wide text-moss ${sizes[size]} ${className}`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
