import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  dark = false,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  dark?: boolean;
}) {
  return (
    <div className={`card card-pad group relative overflow-hidden ${dark ? "ink-panel" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`eyebrow ${dark ? "text-paper/50" : "text-ink/45"}`}
          >
            {label}
          </p>
          <p
            className={`font-num mt-2 text-[1.7rem] font-medium leading-none ${
              dark ? "text-paper" : "text-ink"
            }`}
          >
            {value}
          </p>
          {hint && (
            <p className={`mt-2 text-xs ${dark ? "text-paper/55" : "text-ink/55"}`}>{hint}</p>
          )}
        </div>
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            dark ? "border-paper/15 bg-paper/5 text-paper" : "border-moss/20 bg-moss/[0.07] text-moss"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </span>
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-ink/25 bg-ink/[0.03] text-ink/50">
        <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
      </span>
      <div>
        <p className="heading text-lg">{title}</p>
        {body && <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink/55">{body}</p>}
      </div>
      {action}
    </div>
  );
}
