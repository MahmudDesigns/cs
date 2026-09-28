import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarCheck2,
  MapPin,
  Search,
  Wallet,
  Wrench,
} from "lucide-react";
import { db } from "@/db";
import { bookings, maintenanceRequests, payments } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { fmtDate, fmtMoney, timeAgo, effectivePaymentStatus } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { StatCard } from "@/components/stat";
import { Avatar } from "@/components/avatar";

export default async function StudentOverview() {
  const user = await requireRole("student");

  const [myBookings, myPayments, myRequests] = await Promise.all([
    db.query.bookings.findMany({
      where: eq(bookings.studentId, user.id),
      with: { property: { with: { landlord: true } } },
      orderBy: [desc(bookings.createdAt)],
    }),
    db
      .select()
      .from(payments)
      .where(eq(payments.studentId, user.id))
      .orderBy(desc(payments.createdAt))
      .limit(30),
    db.query.maintenanceRequests.findMany({
      where: eq(maintenanceRequests.studentId, user.id),
      orderBy: [desc(maintenanceRequests.createdAt)],
      limit: 3,
    }),
  ]);

  const active = myBookings.find((b) => ["pending", "confirmed", "occupied"].includes(b.status));
  const due = myPayments.filter((p) => effectivePaymentStatus(p) !== "paid");
  const dueTotal = due.reduce((s, p) => s + p.amount, 0);
  const openReqs = myRequests.filter((r) => r.status !== "resolved").length;

  return (
    <>
      <PageHeader
        eyebrow="Student home"
        title={`Hey, ${user.name.split(" ")[0]} — welcome back`}
        description={user.university ? `${user.university} · everything about your housing in one place.` : "Everything about your housing in one place."}
        actions={
          <Link href="/listings" className="btn btn-moss">
            <Search className="h-4 w-4" aria-hidden /> Find accommodation
          </Link>
        }
      />

      {/* active booking hero */}
      {active ? (
        <div className="card relative mb-6 overflow-hidden">
          <div className="grid md:grid-cols-[280px_1fr]">
            <div className="relative h-44 md:h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.property.images[0]} alt={active.property.title} className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={active.status} />
                <span className="font-num rounded-full bg-ink/[0.05] px-2.5 py-1 text-[11px] text-ink/60">
                  {active.reference}
                </span>
              </div>
              <h2 className="heading mt-3 text-2xl">{active.property.title}</h2>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink/55">
                <MapPin className="h-3.5 w-3.5 text-moss" aria-hidden />
                {active.property.address}, {active.property.area}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="text-ink/60">
                  Move-in <span className="font-num font-medium text-ink">{fmtDate(active.moveInDate)}</span>
                </span>
                <span className="text-ink/60">
                  Duration <span className="font-num font-medium text-ink">{active.durationMonths} months</span>
                </span>
                <span className="text-ink/60">
                  Rent <span className="font-num font-medium text-ink">{fmtMoney(active.monthlyRent)}/mo</span>
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-4">
                <span className="flex items-center gap-2 text-xs text-ink/55">
                  <Avatar name={active.property.landlord.name} size="sm" />
                  {active.property.landlord.name}
                </span>
                <Link href={`/listings/${active.propertyId}`} className="btn btn-ghost ml-auto !py-2 text-xs">
                  View listing <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="ink-panel texture-grid-paper grain relative mb-6 overflow-hidden rounded-3xl p-6 md:p-8">
          <div className="relative max-w-lg">
            <p className="eyebrow text-paper/50">No active housing</p>
            <h2 className="heading mt-2 text-2xl text-paper md:text-3xl">Find your room for this semester</h2>
            <p className="mt-2 text-sm text-paper/60">
              Browse verified listings with live vacancy counts and book in under a minute.
            </p>
            <Link href="/listings" className="btn btn-moss mt-5">
              Start searching <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}

      {/* stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={BedDouble}
          label="Active bookings"
          value={myBookings.filter((b) => ["pending", "confirmed", "occupied"].includes(b.status)).length}
          hint="Pending, confirmed or occupied"
        />
        <StatCard
          icon={Wallet}
          label="Rent due"
          value={fmtMoney(dueTotal)}
          hint={`${due.length} unpaid charge${due.length === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={Wrench}
          label="Open requests"
          value={openReqs}
          hint="Maintenance awaiting resolution"
        />
      </div>

      {/* lists */}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="card card-pad">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="heading text-lg">Upcoming & recent charges</h3>
            <Link href="/student/payments" className="text-xs font-semibold text-moss hover:underline">View all</Link>
          </div>
          {due.length === 0 ? (
            <p className="rounded-2xl bg-moss/[0.06] px-4 py-6 text-center text-sm text-moss">
              All clear — no unpaid charges.
            </p>
          ) : (
            <ul className="divide-y divide-ink/[0.07]">
              {due.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">{p.period}</p>
                    <p className="font-num text-xs text-ink/50">due {fmtDate(p.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-num font-medium">{fmtMoney(p.amount)}</span>
                    <StatusPill status={effectivePaymentStatus(p)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card card-pad">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="heading text-lg">Recent maintenance</h3>
            <Link href="/student/maintenance" className="text-xs font-semibold text-moss hover:underline">View all</Link>
          </div>
          {myRequests.length === 0 ? (
            <p className="rounded-2xl bg-ink/[0.03] px-4 py-6 text-center text-sm text-ink/50">
              No requests yet — hopefully nothing breaks.
            </p>
          ) : (
            <ul className="divide-y divide-ink/[0.07]">
              {myRequests.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.title}</p>
                    <p className="text-xs text-ink/50">{timeAgo(r.createdAt)}</p>
                  </div>
                  <StatusPill status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
