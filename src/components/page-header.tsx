import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow text-moss">{eyebrow}</p>
        <h1 className="heading mt-2 text-3xl md:text-[2.1rem]">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
