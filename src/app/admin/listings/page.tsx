import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { BadgeCheck, ExternalLink, ShieldX, Star, Undo2 } from "lucide-react";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatusPill, VacancyBadge } from "@/components/pill";
import { EmptyState } from "@/components/stat";
import { Avatar } from "@/components/avatar";
import { SubmitButton } from "@/components/submit-button";
import { setListingStatus, toggleFeatured } from "@/actions/admin";

export default async function AdminListings() {
  await requireRole("admin");

  const all = await db.query.properties.findMany({
    with: { landlord: true },
    orderBy: [desc(properties.createdAt)],
  });

  const queue = all.filter((p) => p.status === "pending");
  const verified = all.filter((p) => p.status === "verified");
  const rejected = all.filter((p) => p.status === "rejected");

  return (
    <>
      <PageHeader
        eyebrow="Trust & safety"
        title="Listing verification"
        description="Nothing reaches students until you approve it — the front line against fraudulent postings."
      />

      {/* queue */}
      <section>
        <h2 className="heading mb-3 text-xl">
          Awaiting review{" "}
          <span className="font-num ml-1 rounded-full bg-moss/10 px-2 py-0.5 text-sm text-moss">{queue.length}</span>
        </h2>
        {queue.length === 0 ? (
          <div className="card card-pad text-sm text-ink/55">Queue is empty. New landlord submissions will appear here.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {queue.map((p) => (
              <div key={p.id} className="card overflow-hidden">
                <div className="relative h-44">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  <div className="absolute right-3 top-3"><StatusPill status="pending" /></div>
                </div>
                <div className="p-4">
                  <h3 className="heading text-lg">{p.title}</h3>
                  <p className="mt-0.5 text-xs text-ink/55">
                    {p.address}, {p.area} · {titleCase(p.roomType)} · <span className="font-num">{fmtMoney(p.pricePerMonth)}/mo · {p.totalRooms} rooms</span>
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-ink/65">{p.description}</p>
                  <div className="mt-3 flex items-center gap-2.5 border-t border-ink/10 pt-3 text-xs text-ink/60">
                    <Avatar name={p.landlord.name} size="sm" />
                    <span className="truncate">
                      {p.landlord.name} · {p.landlord.email} · listed {fmtDate(p.createdAt)}
                    </span>
                  </div>
                  <div className="mt-3.5 flex gap-2">
                    <form action={setListingStatus} className="flex-1">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="action" value="verified" />
                      <SubmitButton className="w-full !py-2.5 text-xs" pendingLabel="Verifying…">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Verify & publish
                      </SubmitButton>
                    </form>
                    <form action={setListingStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="action" value="rejected" />
                      <SubmitButton variant="ghost" className="!py-2.5 text-xs" pendingLabel="…">
                        <ShieldX className="h-3.5 w-3.5" aria-hidden /> Reject
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* live */}
      <section className="mt-8">
        <h2 className="heading mb-3 text-xl">
          Live on the platform{" "}
          <span className="font-num ml-1 rounded-full bg-ink/[0.06] px-2 py-0.5 text-sm text-ink/60">{verified.length}</span>
        </h2>
        {verified.length === 0 ? (
          <div className="card card-pad text-sm text-ink/55">Nothing live yet — verify submissions above to populate the marketplace.</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead className="thead">
                  <tr>
                    <th>Listing</th>
                    <th>Landlord</th>
                    <th>Rent</th>
                    <th>Vacancy</th>
                    <th>Featured</th>
                    <th className="!text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verified.map((p) => (
                    <tr key={p.id} className="trow trow-hover">
                      <td>
                        <span className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.images[0]} alt="" className="h-10 w-14 rounded-lg object-cover" />
                          <span>
                            <span className="block max-w-[220px] truncate font-medium">{p.title}</span>
                            <span className="text-xs text-ink/50">{p.area}</span>
                          </span>
                        </span>
                      </td>
                      <td className="text-ink/70">{p.landlord.name}</td>
                      <td className="font-num">{fmtMoney(p.pricePerMonth)}</td>
                      <td><VacancyBadge rooms={p.availableRooms} /></td>
                      <td>
                        <form action={toggleFeatured}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                              p.featured
                                ? "border-moss bg-moss/10 text-moss"
                                : "border-ink/15 text-ink/35 hover:border-ink/30 hover:text-ink"
                            }`}
                            title={p.featured ? "Remove from featured" : "Feature on homepage"}
                          >
                            <Star className="h-3.5 w-3.5" fill={p.featured ? "currentColor" : "none"} />
                          </button>
                        </form>
                      </td>
                      <td className="!text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/listings/${p.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/55 transition-colors hover:border-ink hover:text-ink"
                            title="Open public page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <form action={setListingStatus}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="action" value="rejected" />
                            <button
                              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-ink/15 px-3 text-xs font-semibold text-ink/55 transition-colors hover:border-ink hover:text-ink"
                              title="Take listing offline"
                            >
                              <Undo2 className="h-3 w-3" /> De-list
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* rejected */}
      {rejected.length > 0 && (
        <section className="mt-8">
          <h2 className="heading mb-3 text-xl">Rejected ({rejected.length})</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rejected.map((p) => (
              <div key={p.id} className="card card-pad">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-ink/55">{p.area} · {p.landlord.name}</p>
                  </div>
                  <StatusPill status="rejected" />
                </div>
                <form action={setListingStatus} className="mt-3">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="action" value="pending" />
                  <SubmitButton variant="ghost" className="!py-2 text-xs" pendingLabel="…">
                    <Undo2 className="h-3.5 w-3.5" aria-hidden /> Return to queue
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
