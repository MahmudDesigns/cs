import Link from "next/link";
import { and, eq, inArray, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  BedDouble,
  ChevronRight,
  Clock3,
  Landmark,
  MapPin,
  Phone,
  Ruler,
} from "lucide-react";
import { db } from "@/db";
import { bookings, properties } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { ROOM_TYPES } from "@/lib/constants";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AmenityIcon } from "@/components/amenity-icon";
import { Avatar } from "@/components/avatar";
import { VacancyBadge } from "@/components/pill";
import { PropertyCard } from "@/components/property-card";
import { Gallery } from "./gallery";
import { BookingCard } from "./booking-card";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, id),
    with: { landlord: true },
  });
  if (!property) notFound();

  const isOwner = !!user && (user.id === property.landlordId || user.role === "admin");
  if (property.status !== "verified" && !isOwner) notFound();

  const [already] = user
    ? await db
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          and(
            eq(bookings.studentId, user.id),
            eq(bookings.propertyId, property.id),
            inArray(bookings.status, ["pending", "confirmed", "occupied"])
          )
        )
        .limit(1)
    : [undefined];

  const similar = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.status, "verified"),
        eq(properties.area, property.area),
        ne(properties.id, property.id)
      )
    )
    .limit(3);

  const roomLabel = ROOM_TYPES.find((r) => r.value === property.roomType)?.label ?? property.roomType;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
        {/* breadcrumb */}
        <nav className="flex items-center gap-1.5 pt-6 text-xs text-ink/50">
          <Link href="/listings" className="font-medium text-moss hover:underline">Explore</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span>{property.area}</span>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="max-w-[200px] truncate text-ink/70 sm:max-w-none">{property.title}</span>
        </nav>

        {property.status !== "verified" && (
          <div className="mt-4 rounded-2xl border border-ink/15 bg-ink px-4 py-3 text-center text-xs font-medium text-paper">
            Preview mode — this listing is <span className="font-semibold">{property.status}</span> and
            not visible to students yet.
          </div>
        )}

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* left */}
          <div>
            <Gallery images={property.images} title={property.title} />

            <div className="mt-7">
              <div className="flex flex-wrap items-center gap-2.5">
                <VacancyBadge rooms={property.availableRooms} />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink/65">
                  <BedDouble className="h-3.5 w-3.5 text-moss" aria-hidden />
                  {roomLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-moss/25 bg-moss/[0.07] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-moss">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  Admin verified
                </span>
              </div>

              <h1 className="heading mt-4 text-3xl md:text-4xl">{property.title}</h1>
              <p className="mt-2.5 flex items-center gap-1.5 text-sm text-ink/60">
                <MapPin className="h-4 w-4 text-moss" aria-hidden />
                {property.address}, {property.area} · {property.distanceKm} km to{" "}
                {property.nearestCampus}
              </p>

              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink/70">
                {property.description}
              </p>
            </div>

            {/* facts */}
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Ruler, l: "Distance to campus", v: `${property.distanceKm} km` },
                { icon: BedDouble, l: "Total rooms", v: String(property.totalRooms) },
                { icon: Landmark, l: "Deposit", v: fmtMoney(property.deposit) },
                { icon: Clock3, l: "Listed", v: fmtDate(property.createdAt) },
              ].map((f) => (
                <div key={f.l} className="card p-4">
                  <f.icon className="h-4 w-4 text-moss" aria-hidden />
                  <p className="font-num mt-2.5 text-base font-medium">{f.v}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-ink/45">{f.l}</p>
                </div>
              ))}
            </div>

            {/* amenities */}
            <div className="mt-8">
              <h2 className="heading text-xl">Amenities & features</h2>
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {property.amenities.map((a) => (
                  <div key={a} className="card flex items-center gap-2.5 px-4 py-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-moss/10 text-moss">
                      <AmenityIcon name={a} className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* landlord */}
            <div className="card mt-8 flex flex-wrap items-center gap-4 p-5">
              <Avatar name={property.landlord.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                  Hosted by
                </p>
                <p className="heading mt-0.5 text-lg">{property.landlord.name}</p>
                <p className="text-xs text-ink/55">
                  On CampusStay since {fmtDate(property.landlord.createdAt)} · responds via platform
                </p>
              </div>
              {property.landlord.phone && (
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-3.5 py-2 text-xs font-medium text-ink/70">
                  <Phone className="h-3.5 w-3.5 text-moss" aria-hidden />
                  <span className="font-num">{property.landlord.phone}</span>
                </span>
              )}
            </div>
          </div>

          {/* right */}
          <div>
            <BookingCard
              propertyId={property.id}
              price={property.pricePerMonth}
              deposit={property.deposit}
              available={property.availableRooms}
              userRole={user?.role ?? null}
              alreadyBooked={!!already}
            />
          </div>
        </div>

        {/* similar */}
        {similar.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between">
              <h2 className="heading text-2xl">More in {property.area}</h2>
              <Link href={`/listings?area=${encodeURIComponent(property.area)}`} className="text-sm font-semibold text-moss hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
