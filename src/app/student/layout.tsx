import type { ReactNode } from "react";
import type { Metadata } from "next";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, maintenanceRequests } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Student dashboard" };

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("student");

  const [[pending], [openReqs]] = await Promise.all([
    db
      .select({ c: count() })
      .from(bookings)
      .where(and(eq(bookings.studentId, user.id), eq(bookings.status, "pending"))),
    db
      .select({ c: count() })
      .from(maintenanceRequests)
      .where(and(eq(maintenanceRequests.studentId, user.id), eq(maintenanceRequests.status, "open"))),
  ]);

  return (
    <DashboardShell
      role="student"
      name={user.name}
      email={user.email}
      badges={{ "/student/bookings": pending.c, "/student/maintenance": openReqs.c }}
    >
      {children}
    </DashboardShell>
  );
}
