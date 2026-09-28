import Link from "next/link";
import type { Metadata } from "next";
import { and, desc, asc, eq, gte, lte, ilike, or, gt, type SQL } from "drizzle-orm";
import { FilterX, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { AREAS, AMENITIES, MAX_PRICE, MIN_PRICE, ROOM_TYPES } from "@/lib/constants";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import { EmptyState } from "@/components/stat";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Find accommodation" };

type SP = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export default async function ListingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = str(sp.q).trim();
  const area = str(sp.area);
  const type = str(sp.type);
  const min = Number(str(sp.min)) || 0;
  const max = Number(str(sp.max)) || 0;
  const sort = str(sp.sort) || "new";
  const onlyAvailable = str(sp.available) === "1";
  const amenityFilters = (Array.isArray(sp.amenities) ? sp.amenities : sp.amenities ? [sp.amenities] : []).filter(
    (a): a is string => typeof a === "string"
  );

  const conditions: SQL[] = [eq(properties.status, "verified")];
  if (area) conditions.push(eq(properties.area, area));
  if (type) conditions.push(eq(properties.roomType, type as "single" | "shared" | "studio" | "one_bedroom" | "apartment"));
  if (min > 0) conditions.push(gte(properties.pricePerMonth, min));
  if (max > 0) conditions.push(lte(properties.pricePerMonth, max));
  if (onlyAvailable) conditions.push(gt(properties.availableRooms, 0));
  if (q)
    conditions.push(
      or(
        ilike(properties.title, `%${q}%`),
        ilike(properties.address, `%${q}%`),
        ilike(properties.area, `%${q}%`),
        ilike(properties.nearestCampus, `%${q}%`)
      ) as SQL
    );

  const order =
    sort === "price_asc"
      ? asc(properties.pricePerMonth)
      : sort === "price_desc"
        ? desc(properties.pricePerMonth)
        : desc(properties.createdAt);

  const all = await db
    .select()
    .from(properties)
    .where(and(...conditions))
    .orderBy(desc(properties.featured), order);

  const results = amenityFilters.length
    ? all.filter((p) => amenityFilters.every((a) => p.amenities.includes(a)))
    : all;

  const hasFilters = !!(q || area || type || min || max || onlyAvailable || amenityFilters.length);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
        {/* title */}
        <div className="pt-10 md:pt-14">
          <p className="eyebrow text-moss">Verified stays</p>
          <h1 className="heading mt-2 text-3xl md:text-[2.6rem]">
            {results.length} place{results.length === 1 ? "" : "s"} to call home
          </h1>
          <p className="mt-2 max-w-lg text-sm text-ink/60">
            Every listing below passed admin review. Vacancy counts update the moment a booking is
            confirmed — what you see is what&apos;s available.
          </p>
        </div>

        {/* filter bar */}
        <form action="/listings" className="card sticky top-[68px] z-30 mt-7 p-3.5 shadow-[0_18px_40px_-30px_rgba(14,26,18,0.4)] md:p-4">
          <div className="flex items-center gap-2 pb-3">
            <SlidersHorizontal className="h-4 w-4 text-moss" aria-hidden />
            <p className="font-display text-sm font-medium">Refine your search</p>
            {hasFilters && (
              <Link
                href="/listings"
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-moss hover:underline"
              >
                <RotateCcw className="h-3 w-3" aria-hidden /> Reset all
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            <input name="q" defaultValue={q} placeholder="Search name, address…" className="field !py-2.5 text-sm" />
            <select name="area" defaultValue={area} className="field !py-2.5 text-sm">
              <option value="">All areas</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select name="type" defaultValue={type} className="field !py-2.5 text-sm">
              <option value="">Any room type</option>
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <select name="min" defaultValue={min ? String(min) : ""} className="field !py-2.5 text-sm">
              <option value="">Min price</option>
              {[MIN_PRICE, 100, 150, 200, 250, 300, 400].map((v) => (
                <option key={v} value={v}>${v}+</option>
              ))}
            </select>
            <select name="max" defaultValue={max ? String(max) : ""} className="field !py-2.5 text-sm">
              <option value="">Max price</option>
              {[150, 200, 250, 300, 400, MAX_PRICE].map((v) => (
                <option key={v} value={v}>up to ${v}</option>
              ))}
            </select>
            <select name="sort" defaultValue={sort} className="field !py-2.5 text-sm">
              <option value="new">Newest first</option>
              <option value="price_asc">Price: low → high</option>
              <option value="price_desc">Price: high → low</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                onlyAvailable ? "border-moss bg-moss/10 text-moss" : "border-ink/15 text-ink/65 hover:border-ink/30"
              }`}
            >
              <input type="checkbox" name="available" value="1" defaultChecked={onlyAvailable} className="accent-[#0c6b4e]" />
              Available now
            </label>
            <span className="mx-1 hidden h-4 w-px bg-ink/15 sm:block" />
            {AMENITIES.map((a) => {
              const checked = amenityFilters.includes(a);
              return (
                <label
                  key={a}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    checked ? "border-moss bg-moss/10 text-moss" : "border-ink/15 text-ink/65 hover:border-ink/30"
                  }`}
                >
                  <input type="checkbox" name="amenities" value={a} defaultChecked={checked} className="sr-only" />
                  {a}
                </label>
              );
            })}
            <button type="submit" className="btn btn-ink ml-auto !px-5 !py-2">
              <Search className="h-3.5 w-3.5" aria-hidden /> Apply
            </button>
          </div>
        </form>

        {/* results */}
        {results.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p, i) => (
              <Reveal key={p.id} i={i % 3} amount={0.1}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={FilterX}
              title="No stays match those filters"
              body="Try widening your price range, removing an amenity, or clearing the search. New verified listings are added every week."
              action={
                <Link href="/listings" className="btn btn-moss">
                  Clear all filters
                </Link>
              }
            />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
