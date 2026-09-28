import { desc, eq, inArray } from "drizzle-orm";
import { Mail, Phone, Users } from "lucide-react";
import { db } from "@/db";
import { bookings, payments, properties } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { effectivePaymentStatus, fmtDate, fmtMoney } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { EmptyState } from "@/components/stat";
import { Avatar } from "@/components/avatar";

export default async function LandlordTenants() {
  const user = await requireRole("landlord");
  const myProps = await db.select().from(properties).where(eq(properties.landlordId, user.id));
  const ids = myProps.map((p) => p.id);

  const active = ids.length
    ? await db.query.bookings.findMany({
        where: inArray(bookings.propertyId, ids),
        with: { student: true, property: true },
        orderBy: [desc(bookings.createdAt)],
      })
    : [];

  const tenants = active.filter((b) => b.status === "confirmed" || b.status === "occupied");
  const myPayments = ids.length
    ? await db.select().from(payments).where(eq(payments.landlordId, user.id))
    : [];

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Tenant records"
        description="Every student currently tied to your properties — with contact details and their rent standing."
      />

      {tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants yet"
          body="When you confirm a booking application, the student becomes a tenant and appears here."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tenants.map((b) => {
            const ledger = myPayments.filter((p) => p.bookingId === b.id);
            const paid = ledger.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
            const due = ledger
              .filter((p) => effectivePaymentStatus(p) !== "paid")
              .reduce((s, p) => s + p.amount, 0);
            const overdue = ledger.some((p) => effectivePaymentStatus(p) === "overdue");

            return (
              <div key={b.id} className="card card-pad">
                <div className="flex items-center gap-3">
                  <Avatar name={b.student.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{b.student.name}</p>
                    <p className="truncate text-xs text-ink/55">{b.student.university ?? "Student"}</p>
                  </div>
                  <StatusPill status={b.status} />
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-ink/60">
                  {b.student.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-moss" aria-hidden />
                      <span className="font-num">{b.student.phone}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-moss" aria-hidden />
                    <span className="truncate">{b.student.email}</span>
                  </p>
                </div>

                <div className="mt-4 rounded-2xl bg-ink/[0.03] px-3.5 py-3 text-xs">
                  <p className="font-medium text-ink">{b.property.title}</p>
                  <p className="font-num mt-1 text-ink/55">
                    {fmtMoney(b.monthlyRent)}/mo · since {fmtDate(b.moveInDate)} · {b.reference}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl border border-moss/20 bg-moss/[0.06] px-2 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-moss">Paid</p>
                    <p className="font-num mt-0.5 text-sm font-medium text-moss">{fmtMoney(paid)}</p>
                  </div>
                  <div className={`rounded-xl border px-2 py-2 ${overdue ? "border-ink bg-ink text-paper" : "border-ink/15"}`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${overdue ? "text-paper/70" : "text-ink/50"}`}>
                      {overdue ? "Overdue" : "Due"}
                    </p>
                    <p className={`font-num mt-0.5 text-sm font-medium ${overdue ? "" : "text-ink"}`}>{fmtMoney(due)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
