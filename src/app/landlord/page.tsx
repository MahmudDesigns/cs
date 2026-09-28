import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  BedDouble,
  Building2,
  Gauge,
  Plus,
  TriangleAlert,
  Wallet,
  Wrench,
} from "lucide-react";
import { db } from "@/db";
import { bookings, maintenanceRequests, payments, properties } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { effectivePaymentStatus, fmtDate, fmtMoney, monthPeriod, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill, VacancyBadge } from "@/components/pill";
import { StatCard } from "@/components/stat";
import { SubmitButton } from "@/components/submit-button";
import { confirmBooking } from "@/actions/bookings";

export default async function LandlordOverview() {
  const user = await requireRole("landlord");

  const myProps = await db.select().from(properties).where(eq(properties.landlordId, user.id));
  const ids = myProps.map((p) => p.id);

  const [myBookings, myPayments, myRequests] = ids.length
    ? await Promise.all([
        db.query.bookings.findMany({
          where: inArray(bookings.propertyId, ids),
          with: { student: true, property: true },
          orderBy: [desc(bookings.createdAt)],
        }),
        db.select().from(payments).where(eq(payments.landlordId, user.id)).orderBy(desc(payments.createdAt)),
        db.query.maintenanceRequests.findMany({
          where: inArray(maintenanceRequests.propertyId, ids),
          with: { student: true, property: true },
          orderBy: [desc(maintenanceRequests.createdAt)],
        }),
      ])
    : [[], [], []];

  const totalRooms = myProps.reduce((s, p) => s + p.totalRooms, 0);
  const freeRooms = myProps.reduce((s, p) => s + p.availableRooms, 0);
  const occupancy = totalRooms ? Math.round(((totalRooms - freeRooms) / totalRooms) * 100) : 0;

  const now = new Date();
  const thisMonth = monthPeriod(now);
  const collectedMonth = myPayments
    .filter((p) => p.status === "paid" && p.paidAt && monthPeriod(new Date(p.paidAt)) === thisMonth)
    .reduce((s, p) => s + p.amount, 0);
  const receivable = myPayments.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount, 0);

  const pendingApps = myBookings.filter((b) => b.status === "pending");
  const openReqs = myRequests.filter((r) => r.status === "open");

  // last 6 months revenue (paid)
  const months: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: monthPeriod(d), total: 0 });
  }
  for (const p of myPayments) {
    if (p.status === "paid" && p.paidAt) {
      const label = monthPeriod(new Date(p.paidAt));
      const m = months.find((x) => x.label === label);
      if (m) m.total += p.amount;
    }
  }
  const maxRev = Math.max(1, ...months.map((m) => m.total));

  return (
    <>
      <PageHeader
        eyebrow="Landlord home"
        title={`${user.name.split(" ")[0]}'s portfolio`}
        description="Listings, tenants, rent and repairs — the health of your properties at a glance."
        actions={
          <Link href="/landlord/properties/new" className="btn btn-moss">
            <Plus className="h-4 w-4" aria-hidden /> New listing
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Building2} label="Properties" value={myProps.length} hint={`${myProps.filter((p) => p.status === "verified").length} live & verified`} />
        <StatCard icon={Gauge} label="Occupancy" value={`${occupancy}%`} hint={`${totalRooms - freeRooms} of ${totalRooms} rooms filled`} />
        <StatCard icon={Wallet} label={`Collected · ${thisMonth}`} value={fmtMoney(collectedMonth)} hint={`${fmtMoney(receivable)} still receivable`} />
        <StatCard icon={Wrench} label="Open repairs" value={openReqs.length} hint={openReqs.length ? "Tenants are waiting" : "All resolved"} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {/* revenue chart */}
        <div className="card card-pad">
          <div className="flex items-center justify-between">
            <h3 className="heading text-lg">Rent collected — last 6 months</h3>
            <Link href="/landlord/payments" className="text-xs font-semibold text-moss hover:underline">Ledger →</Link>
          </div>
          <div className="mt-6 flex h-40 items-end gap-3">
            {months.map((m) => (
              <div key={m.label} className="group flex flex-1 flex-col items-center gap-2">
                <span className="font-num text-[10px] text-ink/45 opacity-0 transition-opacity group-hover:opacity-100">
                  {fmtMoney(m.total)}
                </span>
                <div
                  className="w-full max-w-10 rounded-t-lg bg-moss transition-all duration-500 group-hover:bg-ink"
                  style={{ height: `${Math.max(4, (m.total / maxRev) * 100)}%` }}
                />
                <span className="text-[10px] font-medium uppercase tracking-wide text-ink/45">
                  {m.label.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* pending applications */}
        <div className="card card-pad">
          <div className="flex items-center justify-between">
            <h3 className="heading text-lg">Applications awaiting you</h3>
            <Link href="/landlord/bookings" className="text-xs font-semibold text-moss hover:underline">All bookings →</Link>
          </div>
          {pendingApps.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-moss/[0.06] px-4 py-8 text-center text-sm text-moss">
              Inbox zero — no pending applications.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingApps.slice(0, 4).map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{b.student.name}</p>
                    <p className="truncate text-xs text-ink/55">
                      {b.property.title} · move-in {fmtDate(b.moveInDate)}
                    </p>
                  </div>
                  <span className="font-num text-xs text-ink/50">{timeAgo(b.createdAt)}</span>
                  <form action={confirmBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <SubmitButton className="!px-3.5 !py-1.5 text-xs" pendingLabel="…">Confirm</SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* properties snapshot */}
      <div className="card mt-3 card-pad">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="heading text-lg">Your properties</h3>
          <Link href="/landlord/properties" className="text-xs font-semibold text-moss hover:underline">Manage →</Link>
        </div>
        {myProps.length === 0 ? (
          <div className="rounded-2xl bg-ink/[0.03] px-4 py-8 text-center">
            <BedDouble className="mx-auto h-6 w-6 text-ink/35" aria-hidden />
            <p className="mt-2 text-sm text-ink/55">No properties yet — publish your first listing in under two minutes.</p>
            <Link href="/landlord/properties/new" className="btn btn-moss mt-4">
              <Plus className="h-4 w-4" aria-hidden /> Add property
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="thead">
                <tr>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Rent</th>
                  <th>Vacancy</th>
                  <th>Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {myProps.map((p) => {
                  const occ = p.totalRooms ? Math.round(((p.totalRooms - p.availableRooms) / p.totalRooms) * 100) : 0;
                  return (
                    <tr key={p.id} className="trow trow-hover">
                      <td className="font-medium">
                        <Link href={`/landlord/properties/${p.id}`} className="hover:text-moss">{p.title}</Link>
                        <span className="block text-xs font-normal text-ink/50">{p.area}</span>
                      </td>
                      <td><StatusPill status={p.status} /></td>
                      <td className="font-num">{fmtMoney(p.pricePerMonth)}</td>
                      <td><VacancyBadge rooms={p.availableRooms} /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink/10">
                            <div className="h-full rounded-full bg-moss" style={{ width: `${occ}%` }} />
                          </div>
                          <span className="font-num text-xs text-ink/55">{occ}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* urgent maintenance */}
      {openReqs.length > 0 && (
        <div className="card mt-3 card-pad">
          <div className="mb-3 flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 text-ink" aria-hidden />
            <h3 className="heading text-lg">Open maintenance ({openReqs.length})</h3>
          </div>
          <ul className="divide-y divide-ink/[0.07]">
            {openReqs.slice(0, 4).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="truncate text-xs text-ink/55">{r.property.title} · {r.student.name} · {timeAgo(r.createdAt)}</p>
                </div>
                <StatusPill status={r.priority} />
                <Link href="/landlord/maintenance" className="btn btn-ghost !px-3.5 !py-1.5 text-xs">Respond</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

    </>
  );
}
