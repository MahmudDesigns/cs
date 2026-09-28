import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarCheck2,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, properties, users } from "@/db/schema";
import { AREAS, IMG, ROOM_TYPES } from "@/lib/constants";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PropertyCard } from "@/components/property-card";
import { HeroStagger, HeroItem, Reveal } from "@/components/motion";
import { VacancyBadge } from "@/components/pill";

export const dynamic = "force-dynamic";

const MARQUEE = [
  "Verified listings",
  "Real-time vacancies",
  "Online booking",
  "Rent tracking",
  "Maintenance requests",
  "Fraud-free housing",
];

async function getLandingData() {
  try {
    const featured = await db.query.properties.findMany({
      where: eq(properties.status, "verified"),
      orderBy: (p, { desc }) => [desc(p.featured), desc(p.createdAt)],
      limit: 6,
    });
    const [[students], [landlords], [props], [bks]] = await Promise.all([
      db.select({ c: count() }).from(users).where(eq(users.role, "student")),
      db.select({ c: count() }).from(users).where(eq(users.role, "landlord")),
      db.select({ c: count() }).from(properties).where(eq(properties.status, "verified")),
      db.select({ c: count() }).from(bookings),
    ]);
    return {
      featured,
      stats: {
        students: students.c,
        landlords: landlords.c,
        listings: props.c,
        bookings: bks.c,
      },
    };
  } catch {
    return { featured: [], stats: { students: 0, landlords: 0, listings: 0, bookings: 0 } };
  }
}

export default async function LandingPage() {
  const { featured, stats } = await getLandingData();

  return (
    <>
      <SiteHeader />
      <main>
        {/* ------------------------------- HERO ------------------------------- */}
        <section className="relative overflow-hidden">
          <div className="texture-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
          <div className="pointer-events-none absolute -top-32 right-[8%] h-72 w-72 rounded-full bg-moss/15 blur-[110px]" />
          <div className="pointer-events-none absolute left-[35%] top-40 h-56 w-56 rounded-full bg-moss/10 blur-[90px]" />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-12 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
            <HeroStagger>
              <HeroItem>
                <span className="inline-flex items-center gap-2 rounded-full border border-moss/25 bg-moss/[0.07] px-3.5 py-1.5 text-xs font-semibold text-moss">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Student housing, minus the chaos
                </span>
              </HeroItem>
              <HeroItem>
                <h1 className="heading mt-5 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.15rem]">
                  Find a room you can{" "}
                  <span className="relative inline-block text-moss">
                    trust
                    <svg
                      viewBox="0 0 220 14"
                      className="absolute -bottom-1 left-0 w-full text-moss/50"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path d="M3 10.5C60 3.5 150 3.5 217 9" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                  </span>
                  , minutes from campus.
                </h1>
              </HeroItem>
              <HeroItem>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/65 md:text-lg">
                  CampusStay replaces notice boards and word-of-mouth with verified listings,
                  live vacancy counts and online booking — then keeps your rent, receipts and
                  repairs organized all semester long.
                </p>
              </HeroItem>

              {/* search */}
              <HeroItem>
                <form
                  action="/listings"
                  className="card mt-7 grid max-w-xl grid-cols-1 gap-2 p-2 sm:grid-cols-[1fr_1fr_auto] sm:rounded-full sm:pl-5"
                >
                  <label className="flex items-center gap-2 border-b border-ink/10 px-2 py-2.5 sm:border-b-0 sm:border-r sm:px-0">
                    <Building2 className="h-4 w-4 shrink-0 text-moss" aria-hidden />
                    <select name="area" className="w-full bg-transparent text-sm font-medium outline-none" defaultValue="" aria-label="Area">
                      <option value="">Any neighborhood</option>
                      {AREAS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 px-2 py-2.5 sm:px-0 sm:pr-3">
                    <BedDouble className="h-4 w-4 shrink-0 text-moss" aria-hidden />
                    <select name="type" className="w-full bg-transparent text-sm font-medium outline-none" defaultValue="" aria-label="Room type">
                      <option value="">Any room type</option>
                      {ROOM_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="btn btn-moss sm:!px-6 sm:!py-3.5">
                    <Search className="h-4 w-4" aria-hidden /> Search
                  </button>
                </form>
              </HeroItem>

              <HeroItem>
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink/60">
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-moss" aria-hidden />
                    Admin-verified listings
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute h-full w-full animate-ping rounded-full bg-moss opacity-50" />
                      <span className="relative h-2.5 w-2.5 rounded-full bg-moss" />
                    </span>
                    Vacancy counts updated live
                  </span>
                </div>
              </HeroItem>
            </HeroStagger>

            {/* collage */}
            <div className="relative hidden h-[520px] select-none lg:block" aria-hidden>
              <div className="absolute right-2 top-2 h-[330px] w-[64%] rotate-2 overflow-hidden rounded-[2rem] border-4 border-paper shadow-[0_40px_80px_-40px_rgba(14,26,18,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.bedrooms[0]} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-10 left-0 h-[235px] w-[52%] -rotate-3 overflow-hidden rounded-[2rem] border-4 border-paper shadow-[0_35px_70px_-35px_rgba(14,26,18,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.shared[0]} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="card absolute -left-1 top-14 flex animate-float items-center gap-2.5 px-4 py-3 shadow-lg">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-moss/10 text-moss">
                  <BadgeCheck className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="font-display text-xs font-semibold">Admin verified</p>
                  <p className="text-[11px] text-ink/55">No fake listings, ever</p>
                </div>
              </div>
              <div className="card absolute bottom-0 right-6 flex animate-float-slow items-center gap-3 px-4 py-3 shadow-lg">
                <VacancyBadge rooms={3} />
              </div>
              <div className="card ink-panel absolute left-10 top-[46%] flex -rotate-2 items-center gap-3 px-4 py-3 shadow-xl">
                <Wallet className="h-4 w-4 text-paper/80" />
                <div>
                  <p className="font-num text-sm text-paper">$240 · Oct rent</p>
                  <p className="text-[11px] text-paper/55">Receipt recorded</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------- MARQUEE ------------------------------ */}
        <div className="ink-panel relative z-10 -rotate-[0.6deg] scale-[1.02] overflow-hidden py-3.5">
          <div className="flex w-max animate-marquee items-center gap-6 pr-6">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="flex items-center gap-6 whitespace-nowrap font-display text-sm font-medium uppercase tracking-[0.18em] text-paper/85">
                {m}
                <Asterisk className="h-4 w-4 text-moss" aria-hidden />
              </span>
            ))}
          </div>
        </div>

        {/* ------------------------------- STATS ------------------------------ */}
        <section className="mx-auto max-w-7xl px-4 pb-4 pt-16 md:px-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[
              { n: stats.listings, label: "Verified listings", icon: ShieldCheck },
              { n: stats.students, label: "Students housed", icon: GraduationCap },
              { n: stats.bookings, label: "Bookings managed", icon: CalendarCheck2 },
              { n: stats.landlords, label: "Trusted landlords", icon: Building2 },
            ].map((s, i) => (
              <Reveal key={s.label} i={i}>
                <div className="card card-pad">
                  <s.icon className="h-5 w-5 text-moss" strokeWidth={2.2} aria-hidden />
                  <p className="font-num mt-4 text-3xl font-medium md:text-4xl">{s.n}</p>
                  <p className="mt-1 text-[13px] text-ink/55">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------------------- FEATURED ------------------------------ */}
        <section className="mx-auto max-w-7xl px-4 pt-16 md:px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-moss">Fresh this week</p>
                <h2 className="heading mt-2 text-3xl md:text-4xl">Verified stays near your campus</h2>
              </div>
              <Link href="/listings" className="btn btn-ghost">
                View all stays <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
          {featured.length === 0 && (
            <div className="card card-pad mt-8 text-center text-sm text-ink/55">
              listings are being verified — check back shortly.
            </div>
          )}
        </section>

        {/* --------------------------- HOW IT WORKS --------------------------- */}
        <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-24 md:px-6">
          <Reveal>
            <p className="eyebrow text-moss">How it works</p>
            <h2 className="heading mt-2 max-w-xl text-3xl md:text-4xl">
              From search to keys in three moves
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                icon: Search,
                title: "Search verified stays",
                body: "Filter by neighborhood, price, room type and amenities. Every listing is screened by admins and shows live vacancy counts — no wasted visits.",
              },
              {
                n: "02",
                icon: CalendarCheck2,
                title: "Book & track online",
                body: "Reserve your room in a tap and follow your application from pending to confirmed to moved-in, with a reference you can quote anywhere.",
              },
              {
                n: "03",
                icon: Wrench,
                title: "Live easy, report fast",
                body: "Track rent receipts, see upcoming charges, and raise maintenance requests that your landlord can respond to — a full paper trail, zero notebooks.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} i={i}>
                <div className="card card-pad group relative h-full overflow-hidden">
                  <span className="font-num absolute -right-2 -top-5 text-[5.2rem] font-semibold text-moss/[0.08] transition-colors group-hover:text-moss/[0.16]">
                    {s.n}
                  </span>
                  <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-moss/10 text-moss">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="heading relative mt-5 text-xl">{s.title}</h3>
                  <p className="relative mt-2.5 text-sm leading-relaxed text-ink/60">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------------------- LANDLORDS ----------------------------- */}
        <section id="for-landlords" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-24 md:px-6">
          <Reveal>
            <div className="ink-panel texture-grid-paper grain relative overflow-hidden rounded-[2.5rem] px-6 py-12 md:px-12 md:py-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-moss/25 blur-[100px]" />
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <p className="eyebrow text-paper/50">For landlords</p>
                  <h2 className="heading mt-3 text-3xl text-paper md:text-4xl">
                    Retire the notebook. Run your properties like a pro.
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/65 md:text-base">
                    Register properties, publish listings, and manage vacancies in real time.
                    Track every tenant, rent receipt and repair request from one clean dashboard.
                  </p>
                  <ul className="mt-7 space-y-3 text-sm text-paper/80">
                    {[
                      "Listings go live only after admin verification — trust brings tenants",
                      "Vacancy counts update automatically as bookings are confirmed",
                      "Rent charges, receipts and overdue flags in one ledger",
                      "Respond to maintenance with a visible resolution trail",
                    ].map((li) => (
                      <li key={li} className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss" aria-hidden />
                        {li}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="btn btn-moss mt-8">
                    List your first property <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>

                {/* faux dashboard preview */}
                <div className="relative" aria-hidden>
                  <div className="rounded-3xl border border-paper/15 bg-paper/[0.05] p-5 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-sm font-medium text-paper">Riverside Court · rent</p>
                      <span className="rounded-full bg-moss/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper">Live</span>
                    </div>
                    <div className="mt-5 flex h-28 items-end gap-2.5">
                      {[38, 52, 47, 66, 74, 92].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-md bg-moss/80" style={{ height: `${h}%`, opacity: 0.45 + i * 0.11 }} />
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2.5">
                      {[
                        { l: "Collected", v: "$1,840" },
                        { l: "Pending", v: "$240" },
                        { l: "Overdue", v: "$0" },
                      ].map((k) => (
                        <div key={k.l} className="rounded-xl border border-paper/10 bg-paper/[0.04] px-3 py-2.5">
                          <p className="text-[10px] uppercase tracking-wider text-paper/45">{k.l}</p>
                          <p className="font-num mt-0.5 text-sm text-paper">{k.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-5 -left-4 rotate-2 rounded-2xl border border-paper/15 bg-ink px-4 py-3 shadow-2xl md:-left-8">
                    <p className="flex items-center gap-2 text-xs text-paper/70">
                      <Wrench className="h-3.5 w-3.5 text-moss" /> Leaking tap — resolved in 2 days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* -------------------------------- FAQ ------------------------------- */}
        <section id="faq" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-24 md:px-6">
          <Reveal>
            <p className="eyebrow text-moss">FAQ</p>
            <h2 className="heading mt-2 text-3xl md:text-4xl">Good questions, straight answers</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              {
                q: "How do you stop fraudulent listings?",
                a: "Every property is reviewed by a platform administrator before it goes live. Suspicious landlords can be suspended, and students can escalate complaints to admins at any time.",
              },
              {
                q: "Are the vacancy counts actually accurate?",
                a: "Yes. Vacancies decrement automatically when a landlord confirms a booking and come back when a tenancy ends or is cancelled — what you see is what is available.",
              },
              {
                q: "Do I pay rent through the platform?",
                a: "No — payments happen directly between you and your landlord. CampusStay records every charge and receipt so both sides always have a clear, shared ledger.",
              },
              {
                q: "Something broke in my room. What now?",
                a: "Open a maintenance request from your dashboard with photos described in text, category and urgency. Your landlord responds and resolves it — the whole trail stays on record.",
              },
            ].map((f, i) => (
              <Reveal key={f.q} i={i}>
                <div className="card card-pad h-full">
                  <h3 className="heading text-lg">{f.q}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink/60">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* -------------------------------- CTA ------------------------------- */}
        <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-moss/20 bg-moss/[0.07] px-6 py-14 text-center md:py-20">
              <div className="texture-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_80%_at_50%_50%,black,transparent)]" />
              <p className="eyebrow relative text-moss">Ready when you are</p>
              <h2 className="heading relative mx-auto mt-3 max-w-2xl text-3xl md:text-5xl">
                Stop chasing notice boards. Start living.
              </h2>
              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/listings" className="btn btn-moss !px-7 !py-3.5">
                  Find my room <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/register" className="btn btn-ghost !px-7 !py-3.5">
                  I&apos;m a landlord
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
