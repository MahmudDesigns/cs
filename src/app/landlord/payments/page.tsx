import { and, desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { Banknote, Clock3, ReceiptText, TriangleAlert } from "lucide-react";
import { db } from "@/db";
import { bookings, payments, properties } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { effectivePaymentStatus, fmtDate, fmtDateTime, fmtMoney } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { StatCard, EmptyState } from "@/components/stat";
import { SubmitButton } from "@/components/submit-button";
import { markPaid } from "@/actions/payments";
import { ChargeForm } from "./charge-form";

const FILTERS = ["all", "pending", "overdue", "paid"] as const;

export default async function LandlordPayments({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRole("landlord");
  const sp = await searchParams;
  const filter = (typeof sp.status === "string" && FILTERS.includes(sp.status as never) ? sp.status : "all") as (typeof FILTERS)[number];

  const rows = await db.query.payments.findMany({
    where: eq(payments.landlordId, user.id),
    with: { student: true, booking: { with: { property: true } } },
    orderBy: [desc(payments.dueDate)],
  });

  const byStatus = (s: string) => rows.filter((r) => effectivePaymentStatus(r) === s);
  const paidSum = byStatus("paid").reduce((s, r) => s + r.amount, 0);
  const pendSum = byStatus("pending").reduce((s, r) => s + r.amount, 0);
  const overSum = byStatus("overdue").reduce((s, r) => s + r.amount, 0);

  const myProps = await db.select({ id: properties.id }).from(properties).where(eq(properties.landlordId, user.id));
  const active = myProps.length
    ? await db.query.bookings.findMany({
        where: and(inArray(bookings.propertyId, myProps.map((p) => p.id)), inArray(bookings.status, ["confirmed", "occupied"])),
        with: { student: true, property: true },
      })
    : [];

  const visible = filter === "all" ? rows : byStatus(filter);

  return (
    <>
      <PageHeader
        eyebrow="Rent ledger"
        title="Rent & payments"
        description="Raise monthly charges against active tenancies and record every payment received — the ledger students and admins see."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Banknote} label="Collected (all time)" value={fmtMoney(paidSum)} hint={`${byStatus("paid").length} receipts recorded`} />
        <StatCard icon={Clock3} label="Pending" value={fmtMoney(pendSum)} hint={`${byStatus("pending").length} charges awaiting payment`} />
        <StatCard icon={TriangleAlert} label="Overdue" value={fmtMoney(overSum)} hint={overSum > 0 ? "Follow up with these tenants" : "Nothing overdue"} dark={overSum > 0} />
      </div>

      <div className="mt-3">
        <ChargeForm
          bookings={active.map((b) => ({
            id: b.id,
            label: `${b.student.name} — ${b.property.title}`,
            rent: b.monthlyRent,
          }))}
        />
      </div>

      {/* filter tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/landlord/payments" : `/landlord/payments?status=${f}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filter === f ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:border-ink/30"
            }`}
          >
            {f}
            <span className="font-num ml-1.5 opacity-60">
              {f === "all" ? rows.length : byStatus(f).length}
            </span>
          </Link>
        ))}
      </div>

      <div className="card mt-3 overflow-hidden">
        {visible.length === 0 ? (
          <div className="p-2">
            <EmptyState
              icon={ReceiptText}
              title={filter === "all" ? "No charges yet" : `No ${filter} payments`}
              body="Raise a charge above to start the paper trail — due dates, references and receipts all tracked here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead className="thead">
                <tr>
                  <th>Reference</th>
                  <th>Tenant</th>
                  <th>Property</th>
                  <th>Period</th>
                  <th>Due</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Record payment</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => {
                  const eff = effectivePaymentStatus(p);
                  return (
                    <tr key={p.id} className="trow trow-hover">
                      <td className="font-num text-xs text-ink/55">{p.reference}</td>
                      <td className="font-medium">{p.student.name}</td>
                      <td className="max-w-[170px] truncate text-ink/70">{p.booking.property.title}</td>
                      <td className="font-num">{p.period}</td>
                      <td className="font-num">{fmtDate(p.dueDate)}</td>
                      <td className="font-num font-medium">{fmtMoney(p.amount)}</td>
                      <td>
                        <StatusPill status={eff} />
                        {eff === "paid" && p.paidAt && (
                          <span className="mt-1 block text-[10px] text-ink/45">
                            {fmtDateTime(p.paidAt)} · {p.method}
                          </span>
                        )}
                      </td>
                      <td>
                        {eff === "paid" ? (
                          <span className="text-xs text-ink/40">Settled</span>
                        ) : (
                          <form action={markPaid} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={p.id} />
                            <select name="method" defaultValue={PAYMENT_METHODS[0]} className="field !w-auto !rounded-full !px-3 !py-1.5 text-xs">
                              {PAYMENT_METHODS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                            <SubmitButton className="!px-3.5 !py-1.5 text-xs" pendingLabel="…">Mark paid</SubmitButton>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
