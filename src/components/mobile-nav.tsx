"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, LayoutGrid, Menu, X } from "lucide-react";

const LINKS = [
  { href: "/listings", label: "Explore stays" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#for-landlords", label: "For landlords" },
  { href: "/#faq", label: "FAQ" },
];

export function MobileNav({
  loggedIn,
  homePath,
  name,
}: {
  loggedIn: boolean;
  homePath: string;
  name: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="ink-panel texture-grid-paper absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-paper/50">Menu</p>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper/25"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-10 flex flex-col gap-1">
              {LINKS.map((l, i) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-center justify-between border-b border-paper/10 py-4 font-display text-2xl font-medium"
                >
                  {l.label}
                  <ArrowRight className="h-5 w-5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  <span className="sr-only">{i}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              {loggedIn ? (
                <Link href={homePath} className="btn btn-moss w-full !py-3.5">
                  <LayoutGrid className="h-4 w-4" /> Open my dashboard{name ? `, ${name.split(" ")[0]}` : ""}
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn btn-moss w-full !py-3.5">
                    Get started — it&apos;s free
                  </Link>
                  <Link
                    href="/login"
                    className="btn w-full !border-paper/30 !py-3.5 text-paper hover:bg-paper/10"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
