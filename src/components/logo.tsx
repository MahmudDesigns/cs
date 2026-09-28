import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-xl bg-moss ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none">
        <path
          d="M4 11.2 12 4l8 7.2"
          stroke="var(--color-paper)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.4 10.4V20h11.2v-9.6"
          stroke="var(--color-paper)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="14.6" r="2.1" fill="var(--color-paper)" />
      </svg>
    </span>
  );
}

export function Logo({ dark = false, href = "/" }: { dark?: boolean; href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <LogoMark />
      <span
        className={`font-display text-[1.05rem] font-semibold tracking-tight ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        Campus<span className={dark ? "text-paper/70" : "text-moss"}>Stay</span>
      </span>
    </Link>
  );
}
