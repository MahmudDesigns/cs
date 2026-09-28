import type { ReactNode } from "react";
import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { disputes, properties } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Admin console" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("admin");

  const [[pendingListings], [openDisputes]] = await Promise.all([
    db.select({ c: count() }).from(properties).where(eq(properties.status, "pending")),
    db.select({ c: count() }).from(disputes).where(eq(disputes.status, "open")),
  ]);

  return (
    <DashboardShell
      role="admin"
      name={user.name}
      email={user.email}
      badges={{ "/admin/listings": pendingListings.c, "/admin/disputes": openDisputes.c }}
    >
      {children}
    </DashboardShell>
  );
}
