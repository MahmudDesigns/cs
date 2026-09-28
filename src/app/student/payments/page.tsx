import { desc, eq } from "drizzle-orm";
import { ReceiptText } from "lucide-react";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { effectivePaymentStatus, fmtDate, fmtMoney } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { StatCard, EmptyState } from "@/components/stat";
import { Banknote, Clock3, TriangleAlert } from "lucide-react";

export default async function StudentPayments() {
  const user = await requireRole("student");

  const rows = await db.query.payments.findMany({
    where: eq(payments.studentId, user.id),
    with: { booking: { with: { property: true } } },
    orderBy: [desc(payments.dueDate)],
  });

  const paid = rows.filter((r) => r.status === "paid");
  const pending = rows.filter((r) => effectivePaymentStatus(r) === "pending");
  const overdue = rows.filter((r) => effectivePaymentStatus(r) === "overdue");
  const sum = (arr: typeof rows) => arr.reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Rent ledger"
        title="Payments & receipts"
        description="A shared record between you and your landlord — every charge, its due date, and proof of payment."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Banknote} label="Paid to date" value={fmtMoney(sum(paid))} hint={`${paid.length} receipts`} />
        <StatCard icon={Clock3} label="Pending" value={fmtMoney(sum(pending))} hint={`${pending.length} upcoming charges`} />
        <StatCard icon={TriangleAlert} label="Overdue" value={fmtMoney(sum(overdue))} hint={overdue.length ? "Pay these first" : "Nothing overdue"} dark={overdue.length > 0} />
      </div>

      <div className="card mt-3 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-2">
            <EmptyState
              icon={ReceiptText}
              title="No charges yet"
              body="When your landlord raises a rent charge it will appear here with a due date and reference."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="thead">
                <tr>
                  <th>Reference</th>
                  <th>Property</th>
                  <th>Period</th>
                  <th>Due date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Paid</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="trow trow-hover">
                    <td className="font-num text-xs text-ink/60">{p.reference}</td>
                    <td className="max-w-[200px] truncate font-medium">{p.booking.property.title}</td>
                    <td className="font-num">{p.period}</td>
                    <td className="font-num">{fmtDate(p.dueDate)}</td>
                    <td className="font-num font-medium">{fmtMoney(p.amount)}</td>
                    <td><StatusPill status={effectivePaymentStatus(p)} /></td>
                    <td className="font-num text-ink/60">{fmtDate(p.paidAt)}</td>
                    <td className="text-ink/60">{p.method ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
