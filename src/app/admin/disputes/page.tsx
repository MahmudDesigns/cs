import Link from "next/link";
import { desc } from "drizzle-orm";
import { MessageSquareWarning } from "lucide-react";
import { db } from "@/db";
import { disputes } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { fmtDateTime } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { EmptyState } from "@/components/stat";
import { Avatar } from "@/components/avatar";
import { SubmitButton } from "@/components/submit-button";
import { setDisputeStatus } from "@/actions/admin";

const FILTERS = ["all", "open", "in_review", "resolved"] as const;

export default async function AdminDisputes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("admin");
  const sp = await searchParams;
  const filter = (typeof sp.status === "string" && FILTERS.includes(sp.status as never) ? sp.status : "all") as (typeof FILTERS)[number];

  const all = await db.query.disputes.findMany({
    with: { raisedBy: true },
    orderBy: [desc(disputes.createdAt)],
  });

  const counts = {
    all: all.length,
    open: all.filter((d) => d.status === "open").length,
    in_review: all.filter((d) => d.status === "in_review").length,
    resolved: all.filter((d) => d.status === "resolved").length,
  };
  const visible = filter === "all" ? all : all.filter((d) => d.status === filter);

  return (
    <>
      <PageHeader
        eyebrow="Escalations"
        title="Disputes & complaints"
        description="Cases escalated by students and landlords. Investigate, leave a written resolution, and close the loop."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/disputes" : `/admin/disputes?status=${f}`}
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
            icon={MessageSquareWarning}
            title={filter === "all" ? "No disputes on record" : `Nothing ${filter.replace("_", " ")} right now`}
            body="Complaints filed by students or landlords show up here for review and resolution."
          />
        ) : (
          visible.map((d) => (
            <div key={d.id} className="card card-pad">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={d.status} />
                <span className="font-num text-[11px] text-ink/45">{d.reference}</span>
                <span className="ml-auto text-[11px] text-ink/45">
                  filed {fmtDateTime(d.createdAt)} · updated {fmtDateTime(d.updatedAt)}
                </span>
              </div>
              <h3 className="heading mt-3 text-lg">{d.subject}</h3>
              <p className="mt-1 flex items-center gap-2 text-xs text-ink/55">
                <Avatar name={d.raisedBy.name} size="sm" className="!h-5 !w-5 !text-[8px]" />
                Raised by {d.raisedBy.name} · {d.raisedBy.role} · {d.raisedBy.email}
              </p>
              <p className="mt-3 rounded-2xl bg-ink/[0.03] p-3.5 text-sm leading-relaxed text-ink/70">{d.details}</p>

              <form action={setDisputeStatus} className="mt-4 flex flex-col gap-2.5 border-t border-ink/10 pt-4 md:flex-row md:items-end">
                <input type="hidden" name="id" value={d.id} />
                <label className="w-full md:w-44">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink/45">Set status</span>
                  <select name="status" defaultValue={d.status} className="field !py-2 text-sm">
                    <option value="open">Open</option>
                    <option value="in_review">In review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </label>
                <label className="flex-1">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink/45">
                    Resolution note <span className="font-normal normal-case text-ink/30">(visible to the reporter)</span>
                  </span>
                  <input name="note" defaultValue={d.adminNote ?? ""} placeholder="Outcome, action taken, or next steps…" className="field !py-2 text-sm" />
                </label>
                <SubmitButton className="!py-2 text-xs md:!px-5" pendingLabel="Saving…">Save</SubmitButton>
              </form>
            </div>
          ))
        )}
      </div>
    </>
  );
}
