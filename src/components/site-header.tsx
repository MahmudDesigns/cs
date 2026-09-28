import Link from "next/link";
import { Logo } from "./logo";
import { Avatar } from "./avatar";
import { getCurrentUser, homePathForRole } from "@/lib/session";
import { MobileNav } from "./mobile-nav";

const LINKS = [
  { href: "/listings", label: "Explore stays" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#for-landlords", label: "For landlords" },
  { href: "/#faq", label: "FAQ" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/[0.05] hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={homePathForRole(user.role)}
                className="hidden items-center gap-2.5 rounded-full border border-ink/15 py-1 pl-1 pr-3.5 transition-colors hover:border-moss/40 hover:bg-moss/[0.06] sm:inline-flex"
              >
                <Avatar name={user.name} size="sm" />
                <span className="max-w-[110px] truncate text-sm font-medium">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <Link href={homePathForRole(user.role)} className="btn btn-moss hidden !py-2 md:inline-flex">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost hidden !py-2 sm:inline-flex">
                Log in
              </Link>
              <Link href="/register" className="btn btn-moss !py-2">
                Get started
              </Link>
            </>
          )}
          <MobileNav
            loggedIn={!!user}
            homePath={user ? homePathForRole(user.role) : "/login"}
            name={user?.name ?? null}
          />
        </div>
      </div>
    </header>
  );
}
