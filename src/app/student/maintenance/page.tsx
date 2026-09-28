import { and, desc, eq, inArray } from "drizzle-orm";
import { MessageSquareQuote, Wrench } from "lucide-react";
import { db } from "@/db";
import { bookings, maintenanceRequests } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { fmtDateTime, titleCase, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { EmptyState } from "@/components/stat";
import { MaintenanceForm } from "./maintenance-form";

export default async function StudentMaintenance() {
  const user = await requireRole("student");

  const activeBookings = await db.query.bookings.findMany({
    where: and(eq(bookings.studentId, user.id), inArray(bookings.status, ["confirmed", "occupied"])),
    with: { property: true },
  });

  const requests = await db.query.maintenanceRequests.findMany({
    where: eq(maintenanceRequests.studentId, user.id),
    with: { property: true },
    orderBy: [desc(maintenanceRequests.createdAt)],
  });

  return (
    <>
      <PageHeader
        eyebrow="Repairs"
        title="Maintenance requests"
        description="Report a problem and follow it to resolution — with your landlord's responses on record."
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <div>
          {activeBookings.length > 0 ? (
            <MaintenanceForm
              bookings={activeBookings.map((b) => ({
                id: b.id,
                label: `${b.property.title} — ${b.property.area}`,
              }))}
            />
          ) : (
            <div className="card card-pad text-sm leading-relaxed text-ink/60">
              You can raise maintenance requests once a booking is confirmed. Book a room first, then
              come back here if anything needs fixing.
            </div>
          )}
        </div>

        <div className="space-y-3">
          {requests.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="Nothing reported yet"
              body="If something breaks — a leaking tap, a dead socket, a broken lock — file it here and track the fix."
            />
          ) : (
            requests.map((r) => (
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
                <p className="mt-1 text-xs text-ink/50">
                  {r.property.title} · reported {timeAgo(r.createdAt)} · updated {fmtDateTime(r.updatedAt)}
                </p>
                <p className="mt-3 rounded-2xl bg-ink/[0.03] p-3.5 text-sm leading-relaxed text-ink/70">
                  {r.details}
                </p>
                {r.landlordNote && (
                  <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-moss/20 bg-moss/[0.06] p-3.5">
                    <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-moss" aria-hidden />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-moss">
                        Landlord response
                      </p>
                      <p className="mt-0.5 text-sm text-ink/75">{r.landlordNote}</p>
                    </div>
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
