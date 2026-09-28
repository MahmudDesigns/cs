import type { ReactNode } from "react";
import type { Metadata } from "next";
import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { bookings, maintenanceRequests, properties } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Landlord dashboard" };

export default async function LandlordLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("landlord");

  const myProps = await db.select({ id: properties.id }).from(properties).where(eq(properties.landlordId, user.id));
  const ids = myProps.map((p) => p.id);

  let pendingBookings = 0;
  let openRequests = 0;
  if (ids.length > 0) {
    const [[pb], [or]] = await Promise.all([
      db
        .select({ c: count() })
        .from(bookings)
        .where(and(inArray(bookings.propertyId, ids), eq(bookings.status, "pending"))),
      db
        .select({ c: count() })
        .from(maintenanceRequests)
        .where(and(inArray(maintenanceRequests.propertyId, ids), eq(maintenanceRequests.status, "open"))),
    ]);
    pendingBookings = pb.c;
    openRequests = or.c;
  }

  return (
    <DashboardShell
      role="landlord"
      name={user.name}
      email={user.email}
      badges={{ "/landlord/bookings": pendingBookings, "/landlord/maintenance": openRequests }}
    >
      {children}
    </DashboardShell>
  );
}
