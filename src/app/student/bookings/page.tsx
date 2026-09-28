import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { CalendarCheck2, CheckCircle2, MapPin, Search, XCircle } from "lucide-react";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { fmtDate, fmtDateTime, fmtMoney } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { EmptyState } from "@/components/stat";
import { SubmitButton } from "@/components/submit-button";
import { cancelBooking } from "@/actions/bookings";

export default async function StudentBookings({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRole("student");
  const sp = await searchParams;
  const newRef = typeof sp.new === "string" ? sp.new : null;

  const myBookings = await db.query.bookings.findMany({
    where: eq(bookings.studentId, user.id),
    with: { property: { with: { landlord: true } } },
    orderBy: [desc(bookings.createdAt)],
  });

  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="My bookings"
        description="Track each application from pending to confirmed to moved-in — and cancel anytime before you move in."
        actions={
          <Link href="/listings" className="btn btn-moss">
            <Search className="h-4 w-4" aria-hidden /> Browse stays
          </Link>
        }
      />

      {newRef && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-moss/25 bg-moss/[0.08] p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moss" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold text-moss">Reservation received — reference {newRef}</p>
            <p className="mt-0.5 text-ink/60">
              Your landlord has been notified. You&apos;ll see the status flip to confirmed as soon as
              they accept.
            </p>
          </div>
        </div>
      )}

      {myBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck2}
          title="No bookings yet"
          body="When you reserve a room it shows up here with a live status you can quote to your landlord."
          action={
            <Link href="/listings" className="btn btn-moss">
              Find accommodation
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {myBookings.map((b) => (
            <div key={b.id} className="card overflow-hidden">
              <div className="grid sm:grid-cols-[150px_1fr] md:grid-cols-[190px_1fr]">
                <div className="relative h-32 sm:h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.property.images[0]} alt={b.property.title} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={b.status} />
                    <span className="font-num rounded-full bg-ink/[0.05] px-2.5 py-1 text-[11px] text-ink/60">{b.reference}</span>
                    <span className="ml-auto text-[11px] text-ink/45">applied {fmtDateTime(b.createdAt)}</span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <Link href={`/listings/${b.propertyId}`} className="heading text-lg transition-colors hover:text-moss">
                        {b.property.title}
                      </Link>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/55">
                        <MapPin className="h-3.5 w-3.5 text-moss" aria-hidden />
                        {b.property.address}, {b.property.area} · {b.property.landlord.name}
                      </p>
                    </div>
                    <p className="font-num text-xl font-medium">
                      {fmtMoney(b.monthlyRent)}
                      <span className="font-body text-xs font-normal text-ink/50">/mo</span>
                    </p>
                  </div>
                  <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink/60">
                    <span>Move-in <span className="font-num font-medium text-ink">{fmtDate(b.moveInDate)}</span></span>
                    <span>Duration <span className="font-num font-medium text-ink">{b.durationMonths} mo</span></span>
                    <span>
                      Est. contract value{" "}
                      <span className="font-num font-medium text-ink">{fmtMoney(b.monthlyRent * b.durationMonths)}</span>
                    </span>
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <form action={cancelBooking} className="ml-auto">
                        <input type="hidden" name="id" value={b.id} />
                        <SubmitButton variant="ghost" className="!px-3.5 !py-1.5 text-xs" pendingLabel="Cancelling…">
                          <XCircle className="h-3.5 w-3.5" aria-hidden /> Cancel booking
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
