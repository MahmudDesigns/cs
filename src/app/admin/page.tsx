import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  Activity,
  Building2,
  CalendarCheck2,
  MessageSquareWarning,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { db } from "@/db";
import { bookings, disputes, maintenanceRequests, payments, properties, users } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { effectivePaymentStatus, fmtMoney, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat";
import { StatusPill } from "@/components/pill";
import { Avatar } from "@/components/avatar";

export default async function AdminOverview() {
  const user = await requireRole("admin");

  const [allUsers, allProps, allBookings, allPayments, allDisputes, allMaintenance] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(properties).orderBy(desc(properties.createdAt)),
    db.select().from(bookings).orderBy(desc(bookings.createdAt)),
    db.select().from(payments).orderBy(desc(payments.createdAt)),
    db.query.disputes.findMany({ with: { raisedBy: true }, orderBy: [desc(disputes.createdAt)] }),
    db.select().from(maintenanceRequests).orderBy(desc(maintenanceRequests.createdAt)),
  ]);

  const students = allUsers.filter((u) => u.role === "student").length;
  const landlords = allUsers.filter((u) => u.role === "landlord").length;
  const pendingListings = allProps.filter((p) => p.status === "pending");
  const verifiedListings = allProps.filter((p) => p.status === "verified").length;
  const openDisputes = allDisputes.filter((d) => d.status === "open");
  const openMaintenance = allMaintenance.filter((m) => m.status === "open").length;
  const trackedRevenue = allPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const overdueCount = allPayments.filter((p) => effectivePaymentStatus(p) === "overdue").length;

  // bookings by status (report bars)
  const bookingStatuses = ["pending", "confirmed", "occupied", "completed", "cancelled", "rejected"];
  const bookingCounts = bookingStatuses.map((s) => ({
    status: s,
    count: allBookings.filter((b) => b.status === s).length,
  }));
  const maxBk = Math.max(1, ...bookingCounts.map((x) => x.count));

  // unified activity feed
  const feed = [
    ...allUsers.slice(0, 6).map((u) => ({
      id: `u-${u.id}`,
      at: new Date(u.createdAt),
      text: `${u.name} registered as ${u.role}`,
      kind: "user" as const,
    })),
    ...allBookings.slice(0, 6).map((b) => ({
      id: `b-${b.id}`,
      at: new Date(b.createdAt),
      text: `Booking ${b.reference} created (${b.status})`,
      kind: "booking" as const,
    })),
    ...allPayments.slice(0, 6).map((p) => ({
      id: `p-${p.id}`,
      at: new Date(p.createdAt),
      text: `Charge ${p.reference} for ${fmtMoney(p.amount)} (${p.status})`,
      kind: "payment" as const,
    })),
    ...allDisputes.slice(0, 4).map((d) => ({
      id: `d-${d.id}`,
      at: new Date(d.createdAt),
      text: `Complaint ${d.reference}: ${d.subject}`,
      kind: "dispute" as const,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 9);

  const feedIcon = { user: Users, booking: CalendarCheck2, payment: Wallet, dispute: MessageSquareWarning };

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title={`System overview`}
        description="Users, listings, bookings, money flow and disputes across the whole platform."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} label="Users" value={allUsers.length} hint={`${students} students · ${landlords} landlords`} />
        <StatCard icon={Building2} label="Listings" value={allProps.length} hint={`${verifiedListings} verified · ${pendingListings.length} in queue`} />
        <StatCard icon={CalendarCheck2} label="Bookings" value={allBookings.length} hint={`${allBookings.filter((b) => b.status === "pending").length} awaiting landlords`} />
        <StatCard icon={Wallet} label="Rent tracked" value={fmtMoney(trackedRevenue)} hint={`${overdueCount} charges overdue`} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {/* verification queue */}
        <div className="card card-pad">
          <div className="flex items-center justify-between">
            <h3 className="heading flex items-center gap-2 text-lg">
              <ShieldCheck className="h-4 w-4 text-moss" aria-hidden /> Verification queue
            </h3>
            <Link href="/admin/listings" className="text-xs font-semibold text-moss hover:underline">Review all →</Link>
          </div>
          {pendingListings.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-moss/[0.06] px-4 py-6 text-center text-sm text-moss">
              Queue clear — every listing has been reviewed.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {pendingListings.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-ink/10 px-3.5 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]} alt="" className="h-10 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                    <p className="font-num text-xs text-ink/55">{p.area} · {fmtMoney(p.pricePerMonth)}/mo</p>
                  </div>
                  <Link href="/admin/listings" className="btn btn-moss !px-3.5 !py-1.5 text-xs">Review</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* booking status report */}
        <div className="card card-pad">
          <h3 className="heading text-lg">Bookings by status</h3>
          <div className="mt-5 space-y-3">
            {bookingCounts.map((b) => (
              <div key={b.status} className="flex items-center gap-3">
                <span className="w-20 text-xs capitalize text-ink/60">{b.status}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/[0.07]">
                  <div className="h-full rounded-full bg-moss" style={{ width: `${(b.count / maxBk) * 100}%` }} />
                </div>
                <span className="font-num w-8 text-right text-xs font-medium">{b.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-ink/10 pt-4 text-center">
            <div className="rounded-xl bg-ink/[0.03] px-2 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/50">Open repairs</p>
              <p className="font-num mt-0.5 text-lg">{openMaintenance}</p>
            </div>
            <div className="rounded-xl bg-ink/[0.03] px-2 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/50">Overdue rent</p>
              <p className="font-num mt-0.5 text-lg">{fmtMoney(allPayments.filter((p) => effectivePaymentStatus(p) === "overdue").reduce((s, p) => s + p.amount, 0))}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        {/* activity */}
        <div className="card card-pad">
          <h3 className="heading flex items-center gap-2 text-lg">
            <Activity className="h-4 w-4 text-moss" aria-hidden /> Recent system activity
          </h3>
          <ul className="mt-4 divide-y divide-ink/[0.07]">
            {feed.map((f) => {
              const Icon = feedIcon[f.kind];
              return (
                <li key={f.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-moss/[0.08] text-moss">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink/75">{f.text}</span>
                  <span className="font-num shrink-0 text-[11px] text-ink/45">{timeAgo(f.at)}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* disputes spotlight */}
        <div className="card card-pad">
          <div className="flex items-center justify-between">
            <h3 className="heading text-lg">Disputes</h3>
            <Link href="/admin/disputes" className="text-xs font-semibold text-moss hover:underline">Handle all →</Link>
          </div>
          {openDisputes.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-moss/[0.06] px-4 py-6 text-center text-sm text-moss">
              No open disputes — the community is behaving.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {openDisputes.slice(0, 4).map((d) => (
                <li key={d.id} className="rounded-2xl border border-ink/10 px-3.5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={d.raisedBy.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{d.subject}</p>
                      <p className="text-xs text-ink/55">by {d.raisedBy.name} ({d.raisedBy.role})</p>
                    </div>
                    <StatusPill status={d.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink px-4 py-3 text-paper">
            <span className="flex items-center gap-2 text-xs text-paper/70">
              <Wrench className="h-3.5 w-3.5" aria-hidden /> System health
            </span>
            <span className="font-num text-xs">{allUsers.length} users · {allProps.length} listings · {allPayments.length} charges</span>
          </div>
        </div>
      </div>
    </>
  );
}
