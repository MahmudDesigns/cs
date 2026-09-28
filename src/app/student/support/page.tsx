import { desc, eq } from "drizzle-orm";
import { LifeBuoy } from "lucide-react";
import { db } from "@/db";
import { disputes } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { fmtDateTime } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { EmptyState } from "@/components/stat";
import { DisputeForm } from "@/components/dispute-form";

export default async function StudentSupport() {
  const user = await requireRole("student");
  const myDisputes = await db
    .select()
    .from(disputes)
    .where(eq(disputes.raisedById, user.id))
    .orderBy(desc(disputes.createdAt));

  return (
    <>
      <PageHeader
        eyebrow="Support & disputes"
        title="Get help from the admin team"
        description="Escalate suspected fraud, unfair treatment or unresolved problems. Admins review every case and their decision stays on record."
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <DisputeForm />

        <div className="space-y-3">
          {myDisputes.length === 0 ? (
            <EmptyState
              icon={LifeBuoy}
              title="No complaints filed"
              body="Hopefully it stays that way — but if something goes wrong, the form on the left reaches the admins directly."
            />
          ) : (
            myDisputes.map((d) => (
              <div key={d.id} className="card card-pad">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={d.status} />
                  <span className="font-num ml-auto text-[11px] text-ink/45">
                    {d.reference} · {fmtDateTime(d.createdAt)}
                  </span>
                </div>
                <h3 className="heading mt-3 text-lg">{d.subject}</h3>
                <p className="mt-2 rounded-2xl bg-ink/[0.03] p-3.5 text-sm leading-relaxed text-ink/70">{d.details}</p>
                {d.adminNote && (
                  <div className="mt-3 rounded-2xl border border-moss/20 bg-moss/[0.06] p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-moss">Admin response</p>
                    <p className="mt-0.5 text-sm text-ink/75">{d.adminNote}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
