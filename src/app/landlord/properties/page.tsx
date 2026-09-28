import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Building2, CheckCircle2, ExternalLink, Minus, PencilLine, Plus } from "lucide-react";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/pill";
import { EmptyState } from "@/components/stat";
import { adjustVacancy } from "@/actions/properties";

export default async function LandlordProperties({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireRole("landlord");
  const sp = await searchParams;
  const banner = sp.created ? "Listing submitted — it will go live once an admin verifies it."
    : sp.updated ? "Changes saved. If details changed, the listing returns to the verification queue."
    : null;

  const myProps = await db
    .select()
    .from(properties)
    .where(eq(properties.landlordId, user.id))
    .orderBy(desc(properties.createdAt));

  if (banner && sp.updated) {
    // Edited listings return to pending for re-verification
  }

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="My properties"
        description="Edit details, keep vacancy counts honest, and track verification status."
        actions={
          <Link href="/landlord/properties/new" className="btn btn-moss">
            <Plus className="h-4 w-4" aria-hidden /> New listing
          </Link>
        }
      />

      {banner && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-moss/25 bg-moss/[0.08] p-4 text-sm">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moss" aria-hidden />
          <p className="text-ink/70">{banner}</p>
        </div>
      )}

      {myProps.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          body="Register your first property — add photos, pricing and amenities, and we'll put it in the verification queue."
          action={
            <Link href="/landlord/properties/new" className="btn btn-moss">
              <Plus className="h-4 w-4" aria-hidden /> Add property
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myProps.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              <div className="relative h-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                <div className="absolute left-3 top-3"><StatusPill status={p.status} /></div>
                <p className="font-num absolute bottom-3 left-3 text-lg text-paper">
                  {fmtMoney(p.pricePerMonth)}<span className="text-xs opacity-70">/mo</span>
                </p>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="heading truncate text-lg">{p.title}</h3>
                    <p className="mt-0.5 text-xs text-ink/55">
                      {p.area} · {titleCase(p.roomType)} · listed {fmtDate(p.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Link href={`/landlord/properties/${p.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:border-moss hover:text-moss" title="Edit listing">
                      <PencilLine className="h-4 w-4" aria-hidden />
                    </Link>
                    {p.status === "verified" && (
                      <Link href={`/listings/${p.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:border-moss hover:text-moss" title="View public page">
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-ink/10 bg-ink/[0.03] px-3.5 py-2.5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/45">Vacancy</p>
                    <p className="font-num text-sm font-medium">
                      {p.availableRooms} <span className="text-ink/40">/ {p.totalRooms}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <form action={adjustVacancy}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="delta" value="-1" />
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:border-ink hover:text-ink disabled:opacity-40" disabled={p.availableRooms <= 0} aria-label="Decrease vacancy">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </form>
                    <form action={adjustVacancy}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="delta" value="1" />
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:border-ink hover:text-ink disabled:opacity-40" disabled={p.availableRooms >= p.totalRooms} aria-label="Increase vacancy">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </form>
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
