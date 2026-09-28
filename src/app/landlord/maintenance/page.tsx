import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { Wrench } from "lucide-react";
import { db } from "@/db";
import { maintenanceRequests, properties } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { fmtDateTime, titleCase, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { EmptyState } from "@/components/stat";
import { Avatar } from "@/components/avatar";
import { SubmitButton } from "@/components/submit-button";
import { updateRequest } from "@/actions/maintenance";

const FILTERS = ["all", "open", "in_progress", "resolved"] as const;

export default async function LandlordMaintenance({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRole("landlord");
  const sp = await searchParams;
  const filter = (typeof sp.status === "string" && FILTERS.includes(sp.status as never) ? sp.status : "all") as (typeof FILTERS)[number];

  const myProps = await db.select({ id: properties.id }).from(properties).where(eq(properties.landlordId, user.id));
  const ids = myProps.map((p) => p.id);

  const all = ids.length
    ? await db.query.maintenanceRequests.findMany({
        where: inArray(maintenanceRequests.propertyId, ids),
        with: { student: true, property: true },
        orderBy: [desc(maintenanceRequests.createdAt)],
      })
    : [];

  const counts = {
    all: all.length,
    open: all.filter((r) => r.status === "open").length,
    in_progress: all.filter((r) => r.status === "in_progress").length,
    resolved: all.filter((r) => r.status === "resolved").length,
  };
  const visible = filter === "all" ? all : all.filter((r) => r.status === filter);

  return (
    <>
      <PageHeader
        eyebrow="Repairs"
        title="Maintenance requests"
        description="Respond, keep tenants updated and close the loop — every step is visible to the tenant."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/landlord/maintenance" : `/landlord/maintenance?status=${f}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filter === f ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:border-ink/30"
            }`}
          >
            {f.replace("_", " ")}
            <span className="font-num ml-1.5 opacity-60">{counts[f]}</span>
          </Link>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title={filter === "all" ? "No requests yet" : `Nothing ${filter.replace("_", " ")} right now`}
            body="When a tenant reports an issue it appears here with their contact details and a live status."
          />
        ) : (
          visible.map((r) => (
            <div key={r.id} className="card card-pad">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={r.status} />
                <StatusPill status={r.priority} />
                <span className="rounded-full border border-ink/15 px-2.5 py-[3px] font-display text-[10.5px] uppercase tracking-[0.08em] text-ink/60">
                  {titleCase(r.category)}
                </span>
                <span className="font-num ml-auto text-[11px] text-ink/45">{r.reference}</span>
              </div>

              <h3 className="heading mt-3 text-lg">{r.title}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/55">
                <span className="font-medium text-ink/75">{r.property.title}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Avatar name={r.student.name} size="sm" className="!h-5 !w-5 !text-[8px]" />
                  {r.student.name}{r.student.phone ? ` · ${r.student.phone}` : ""}
                </span>
                <span>·</span>
                <span>{timeAgo(r.createdAt)}</span>
              </p>
              <p className="mt-3 rounded-2xl bg-ink/[0.03] p-3.5 text-sm leading-relaxed text-ink/70">{r.details}</p>

              <form action={updateRequest} className="mt-4 flex flex-col gap-2.5 border-t border-ink/10 pt-4 sm:flex-row sm:items-end">
                <input type="hidden" name="id" value={r.id} />
                <label className="w-full sm:w-44">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink/45">Set status</span>
                  <select name="status" defaultValue={r.status} className="field !py-2 text-sm">
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>
                <label className="flex-1">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink/45">
                    Note to tenant <span className="font-normal normal-case text-ink/30">(visible to them)</span>
                  </span>
                  <input name="note" defaultValue={r.landlordNote ?? ""} placeholder="e.g. Plumber booked for Saturday 10am" className="field !py-2 text-sm" />
                </label>
                <SubmitButton className="!py-2 text-xs sm:!px-5" pendingLabel="Saving…">Update</SubmitButton>
              </form>
              <p className="mt-2 text-[10px] text-ink/40">Last updated {fmtDateTime(r.updatedAt)}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
