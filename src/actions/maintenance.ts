"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { bookings, maintenanceRequests, properties } from "@/db/schema";
import { makeRef } from "@/lib/format";
import { requireRole } from "@/lib/session";

export type MaintenanceState = { error?: string; success?: string } | null;

export async function createRequest(
  _prev: MaintenanceState,
  formData: FormData
): Promise<MaintenanceState> {
  const user = await requireRole("student");
  const bookingId = String(formData.get("bookingId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const category = String(formData.get("category") ?? "other") as
    | "plumbing"
    | "electrical"
    | "furniture"
    | "internet"
    | "security"
    | "cleaning"
    | "other";
  const priority = String(formData.get("priority") ?? "medium") as "low" | "medium" | "urgent";

  if (!bookingId || !title || !details) return { error: "Please complete all required fields." };

  const [booking] = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.id, bookingId),
        eq(bookings.studentId, user.id),
        inArray(bookings.status, ["confirmed", "occupied"])
      )
    )
    .limit(1);
  if (!booking)
    return { error: "You can only raise requests for an active, confirmed accommodation." };

  await db.insert(maintenanceRequests).values({
    reference: makeRef("MR"),
    propertyId: booking.propertyId,
    studentId: user.id,
    bookingId: booking.id,
    title,
    details,
    category,
    priority,
  });

  revalidatePath("/student/maintenance");
  return { success: "Request submitted — your landlord has been notified." };
}

export async function updateRequest(formData: FormData): Promise<void> {
  const user = await requireRole("landlord");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as "open" | "in_progress" | "resolved";
  const note = String(formData.get("note") ?? "").trim();
  if (!["open", "in_progress", "resolved"].includes(status)) return;

  const [request] = await db
    .select()
    .from(maintenanceRequests)
    .where(eq(maintenanceRequests.id, id))
    .limit(1);
  if (!request) return;
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, request.propertyId))
    .limit(1);
  if (!property || property.landlordId !== user.id) return;

  await db
    .update(maintenanceRequests)
    .set({ status, landlordNote: note || request.landlordNote, updatedAt: new Date() })
    .where(eq(maintenanceRequests.id, id));

  revalidatePath("/landlord/maintenance");
  revalidatePath("/student/maintenance");
}
