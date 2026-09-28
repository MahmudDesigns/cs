const GOOD = new Set([
  "paid",
  "verified",
  "resolved",
  "active",
  "occupied",
  "confirmed",
  "featured",
]);
const ALERT = new Set(["overdue", "rejected", "cancelled", "suspended", "urgent"]);

const LABELS: Record<string, string> = {
  in_progress: "In progress",
  in_review: "In review",
};

export function StatusPill({ status, className = "" }: { status: string; className?: string }) {
  const label = LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);

  let cls: string;
  let dot: string;
  if (GOOD.has(status)) {
    cls = "bg-moss/10 text-moss border-moss/25";
    dot = "bg-moss";
  } else if (ALERT.has(status)) {
    cls = "bg-ink text-paper border-ink";
    dot = "bg-paper";
  } else {
    cls = "bg-ink/[0.045] text-ink/70 border-ink/15";
    dot = "bg-ink/50";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-display text-[10.5px] font-medium uppercase tracking-[0.08em] ${cls} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}

/** Live vacancy badge used on listing cards. */
export function VacancyBadge({ rooms, dark = false }: { rooms: number; dark?: boolean }) {
  if (rooms <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-display text-[11px] font-medium text-paper">
        Fully booked
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[11px] font-medium backdrop-blur ${
        dark ? "bg-paper/90 text-ink" : "bg-moss/10 text-moss border border-moss/25"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-moss" />
      </span>
      {rooms} {rooms === 1 ? "room" : "rooms"} free
    </span>
  );
}
