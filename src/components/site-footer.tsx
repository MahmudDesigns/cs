import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="ink-panel texture-grid-paper grain relative mt-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo dark />
            <p className="mt-4 text-sm leading-relaxed text-paper/60">
              The trusted bridge between students and landlords. Verified listings, real-time
              vacancies, bookings, rent tracking and maintenance — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="eyebrow text-paper/40">Students</p>
              <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
                <li><Link className="transition-colors hover:text-paper" href="/listings">Find a room</Link></li>
                <li><Link className="transition-colors hover:text-paper" href="/register">Create account</Link></li>
                <li><Link className="transition-colors hover:text-paper" href="/student">My bookings</Link></li>
              </ul>
            </div>
            <div>
              <p className="eyebrow text-paper/40">Landlords</p>
              <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
                <li><Link className="transition-colors hover:text-paper" href="/register">List a property</Link></li>
                <li><Link className="transition-colors hover:text-paper" href="/landlord">Owner dashboard</Link></li>
                <li><Link className="transition-colors hover:text-paper" href="/#faq">How verification works</Link></li>
              </ul>
            </div>
            <div>
              <p className="eyebrow text-paper/40">Platform</p>
              <ul className="mt-4 space-y-2.5 text-sm text-paper/70">
                <li><Link className="transition-colors hover:text-paper" href="/#how-it-works">How it works</Link></li>
                <li><Link className="transition-colors hover:text-paper" href="/admin">Admin</Link></li>
                <li>
                  <Link className="group inline-flex items-center gap-1 transition-colors hover:text-paper" href="/listings">
                    Browse verified stays <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-paper/10 pt-6 text-xs text-paper/45 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CampusStay. Built for students, landlords and campus communities.</p>
          <p className="font-num">Demo accounts: student@ / landlord@ / admin@ campusstay.app</p>
        </div>
      </div>
    </footer>
  );
}
