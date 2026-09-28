"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarCheck2,
  Globe,
  LayoutGrid,
  LifeBuoy,
  LogOut,
  Menu,
  MessageSquareWarning,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/avatar";
import { logout } from "@/actions/auth";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };

function navFor(role: "student" | "landlord" | "admin"): NavItem[] {
  if (role === "student")
    return [
      { href: "/student", label: "Overview", icon: LayoutGrid },
      { href: "/student/bookings", label: "My bookings", icon: CalendarCheck2 },
      { href: "/student/payments", label: "Payments", icon: Wallet },
      { href: "/student/maintenance", label: "Maintenance", icon: Wrench },
      { href: "/listings", label: "Find accommodation", icon: Search },
      { href: "/student/support", label: "Support", icon: LifeBuoy },
    ];
  if (role === "landlord")
    return [
      { href: "/landlord", label: "Overview", icon: LayoutGrid },
      { href: "/landlord/properties", label: "My properties", icon: Building2 },
      { href: "/landlord/bookings", label: "Bookings", icon: CalendarCheck2 },
      { href: "/landlord/tenants", label: "Tenants", icon: Users },
      { href: "/landlord/payments", label: "Rent & payments", icon: Wallet },
      { href: "/landlord/maintenance", label: "Maintenance", icon: Wrench },
      { href: "/landlord/support", label: "Support", icon: LifeBuoy },
    ];
  return [
    { href: "/admin", label: "Overview", icon: LayoutGrid },
    { href: "/admin/listings", label: "Listing review", icon: ShieldCheck },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/disputes", label: "Disputes", icon: MessageSquareWarning },
    { href: "/listings", label: "View public site", icon: Globe },
  ];
}

export function DashboardShell({
  role,
  name,
  email,
  badges = {},
  children,
}: {
  role: "student" | "landlord" | "admin";
  name: string;
  email: string;
  badges?: Record<string, number>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navFor(role).map((i) => ({ ...i, badge: badges[i.href] }));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebar = (
    <div className="ink-panel texture-grid-paper flex h-full w-[264px] flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo dark href="/" />
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="eyebrow px-5 pb-2 pt-4 text-paper/35">Menu</p>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-paper/10 text-paper" : "text-paper/55 hover:bg-paper/[0.06] hover:text-paper"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-moss transition-transform ${
                  active ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                }`}
              />
              <item.icon className="h-[17px] w-[17px]" strokeWidth={2} aria-hidden />
              {item.label}
              {item.badge ? (
                <span className="font-num ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-moss px-1.5 text-[10.5px] font-semibold text-paper">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-paper/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={name} size="sm" className="!border-paper/25 !bg-paper/10 !text-paper" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{name}</p>
            <p className="truncate text-[11px] text-paper/45">{email}</p>
          </div>
          <form action={logout}>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-paper/15 text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden lg:block">{sidebar}</aside>

      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink/10 bg-paper/90 px-4 backdrop-blur lg:hidden">
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo href="/" />
        <Avatar name={name} size="sm" />
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 shadow-2xl">{sidebar}</div>
        </div>
      )}

      <main className="lg:pl-[264px]">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-9">{children}</div>
      </main>
    </div>
  );
}
