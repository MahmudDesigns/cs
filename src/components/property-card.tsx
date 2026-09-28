import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import type { Property } from "@/db/schema";
import { fmtMoney, titleCase } from "@/lib/format";
import { ROOM_TYPES } from "@/lib/constants";
import { AmenityIcon } from "./amenity-icon";
import { VacancyBadge } from "./pill";

export function PropertyCard({ property: p }: { property: Property }) {
  const img = p.images?.[0];
  const roomLabel = ROOM_TYPES.find((r) => r.value === p.roomType)?.label ?? titleCase(p.roomType);

  return (
    <Link
      href={`/listings/${p.id}`}
      className="card group relative flex flex-col overflow-hidden transition-transform duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-30px_rgba(14,26,18,0.45)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={p.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <VacancyBadge rooms={p.availableRooms} dark />
        </div>
        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-paper backdrop-blur">
          <ShieldCheck className="h-3 w-3" aria-hidden /> Verified
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-center gap-1.5 text-xs text-ink/55">
          <MapPin className="h-3.5 w-3.5 text-moss" aria-hidden />
          <span className="truncate">
            {p.area} · {p.distanceKm} km to {p.nearestCampus}
          </span>
        </div>

        <h3 className="heading text-[1.05rem] leading-snug transition-colors group-hover:text-moss">
          {p.title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-ink/15 px-2.5 py-1 text-[11px] font-medium text-ink/65">
            {roomLabel}
          </span>
          {p.amenities.slice(0, 3).map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-2.5 py-1 text-[11px] font-medium text-ink/65"
            >
              <AmenityIcon name={a} className="h-3 w-3 text-moss" /> {a}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-ink/10 pt-3">
          <p className="font-num text-lg font-medium">
            {fmtMoney(p.pricePerMonth)}
            <span className="ml-1 font-body text-xs font-normal text-ink/50">/ month</span>
          </p>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-all group-hover:border-moss group-hover:bg-moss group-hover:text-paper">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
