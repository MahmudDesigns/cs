import { desc, eq, inArray } from "drizzle-orm";
import { Check, DoorOpen, Handshake, Inbox, X } from "lucide-react";
import { db } from "@/db";
import { bookings, properties } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { fmtDate, fmtDateTime, fmtMoney } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { EmptyState } from "@/components/stat";
import { Avatar } from "@/components/avatar";
import { SubmitButton } from "@/components/submit-button";
import { completeBooking, confirmBooking, markOccupied, rejectBooking } from "@/actions/bookings";

export default async function LandlordBookings() {
  const user = await requireRole("landlord");
  const myProps = await db.select({ id: properties.id }).from(properties).where(eq(properties.landlordId, user.id));
  const ids = myProps.map((p) => p.id);

  const all = ids.length
    ? await db.query.bookings.findMany({
        where: inArray(bookings.propertyId, ids),
        with: { student: true, property: true },
        orderBy: [desc(bookings.createdAt)],
      })
    : [];

  const pending = all.filter((b) => b.status === "pending");
  const active = all.filter((b) => b.status === "confirmed" || b.status === "occupied");
  const history = all.filter((b) => ["completed", "cancelled", "rejected"].includes(b.status));

  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="Bookings & applications"
        description="Confirm applications to take rooms off the market — vacancies update instantly for students."
      />

      {/* pending */}
      <section>
        <h2 className="heading mb-3 text-xl">
          Pending applications{" "}
          <span className="font-num ml-1 rounded-full bg-moss/10 px-2 py-0.5 text-sm text-moss">{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <div className="card card-pad text-sm text-ink/55">No applications waiting on you right now.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {pending.map((b) => (
              <div key={b.id} className="card card-pad">
                <div className="flex items-center gap-3">
                  <Avatar name={b.student.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{b.student.name}</p>
                    <p className="truncate text-xs text-ink/55">{b.student.university ?? b.student.email}</p>
                  </div>
                  <span className="font-num text-[11px] text-ink/45">{fmtDateTime(b.createdAt)}</span>
                </div>
                <div className="mt-3.5 rounded-2xl bg-ink/[0.03] px-3.5 py-3 text-sm">
                  <p className="font-medium">{b.property.title}</p>
                  <p className="font-num mt-1 text-xs text-ink/55">
                    {fmtDate(b.moveInDate)} · {b.durationMonths} mo · {fmtMoney(b.monthlyRent)}/mo · {b.reference}
                  </p>
                </div>
                <div className="mt-3.5 flex gap-2">
                  <form action={confirmBooking} className="flex-1">
                    <input type="hidden" name="id" value={b.id} />
                    <SubmitButton className="w-full !py-2.5 text-xs" pendingLabel="Confirming…">
                      <Check className="h-3.5 w-3.5" aria-hidden /> Confirm
                    </SubmitButton>
                  </form>
                  <form action={rejectBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <SubmitButton variant="ghost" className="!py-2.5 text-xs" pendingLabel="…">
                      <X className="h-3.5 w-3.5" aria-hidden /> Decline
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* active */}
      <section className="mt-8">
        <h2 className="heading mb-3 text-xl">
          Active tenancies{" "}
          <span className="font-num ml-1 rounded-full bg-ink/[0.06] px-2 py-0.5 text-sm text-ink/60">{active.length}</span>
        </h2>
        {active.length === 0 ? (
          <div className="card card-pad text-sm text-ink/55">Confirmed bookings appear here before and after move-in.</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="thead">
                  <tr>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Reference</th>
                    <th>Move-in</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th className="!text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {active.map((b) => (
                    <tr key={b.id} className="trow trow-hover">
                      <td>
                        <span className="flex items-center gap-2.5">
                          <Avatar name={b.student.name} size="sm" />
                          <span className="font-medium">{b.student.name}</span>
                        </span>
                      </td>
                      <td className="max-w-[180px] truncate text-ink/70">{b.property.title}</td>
                      <td className="font-num text-xs text-ink/55">{b.reference}</td>
                      <td className="font-num">{fmtDate(b.moveInDate)}</td>
                      <td className="font-num font-medium">{fmtMoney(b.monthlyRent)}</td>
                      <td><StatusPill status={b.status} /></td>
                      <td className="!text-right">
                        {b.status === "confirmed" ? (
                          <form action={markOccupied} className="inline">
                            <input type="hidden" name="id" value={b.id} />
                            <SubmitButton variant="ink" className="!px-3.5 !py-1.5 text-xs" pendingLabel="…">
                              <DoorOpen className="h-3.5 w-3.5" aria-hidden /> Mark moved in
                            </SubmitButton>
                          </form>
                        ) : (
                          <form action={completeBooking} className="inline">
                            <input type="hidden" name="id" value={b.id} />
                            <SubmitButton variant="ghost" className="!px-3.5 !py-1.5 text-xs" pendingLabel="…">
                              <Handshake className="h-3.5 w-3.5" aria-hidden /> End tenancy
                            </SubmitButton>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* history */}
      <section className="mt-8">
        <h2 className="heading mb-3 text-xl">History</h2>
        {history.length === 0 ? (
          <div className="card card-pad flex items-center gap-3 text-sm text-ink/55">
            <Inbox className="h-4 w-4 text-ink/35" aria-hidden /> Completed, cancelled or declined bookings land here.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="thead">
                  <tr>
                    <th>Student</th>
                    <th>Property</th>
                    <th>Reference</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((b) => (
                    <tr key={b.id} className="trow trow-hover">
                      <td className="font-medium">{b.student.name}</td>
                      <td className="max-w-[200px] truncate text-ink/70">{b.property.title}</td>
                      <td className="font-num text-xs text-ink/55">{b.reference}</td>
                      <td className="font-num">{fmtMoney(b.monthlyRent)}</td>
                      <td><StatusPill status={b.status} /></td>
                      <td className="font-num text-ink/55">{fmtDate(b.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
