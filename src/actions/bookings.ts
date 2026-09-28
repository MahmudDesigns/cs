"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bookings, properties } from "@/db/schema";
import { makeRef } from "@/lib/format";
import { requireRole } from "@/lib/session";

export type BookingState = { error?: string; success?: string } | null;

export async function createBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const user = await requireRole("student");
  const propertyId = String(formData.get("propertyId") ?? "");
  const moveInDate = String(formData.get("moveInDate") ?? "");
  const durationMonths = Number(formData.get("durationMonths") ?? 0);

  if (!propertyId || !moveInDate || !durationMonths)
    return { error: "Choose a move-in date and duration." };

  if (moveInDate < new Date().toISOString().slice(0, 10))
    return { error: "Move-in date can't be in the past." };

  const [property] = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  if (!property) return { error: "This listing no longer exists." };
  if (property.status !== "verified")
    return { error: "This listing is awaiting verification and can't be booked yet." };
  if (property.availableRooms < 1)
    return { error: "No rooms available — this property is fully booked right now." };

  // One active booking per student per property
  const [dup] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.studentId, user.id),
        eq(bookings.propertyId, propertyId),
        eq(bookings.status, "pending")
      )
    )
    .limit(1);
  const [dup2] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.studentId, user.id),
        eq(bookings.propertyId, propertyId),
        eq(bookings.status, "confirmed")
      )
    )
    .limit(1);
  if (dup || dup2) return { error: "You already have an active booking for this property." };

  const ref = makeRef("BK");
  await db.insert(bookings).values({
    reference: ref,
    studentId: user.id,
    propertyId,
    status: "pending",
    moveInDate,
    durationMonths,
    monthlyRent: property.pricePerMonth,
  });

  revalidatePath("/student/bookings");
  revalidatePath("/landlord/bookings");
  redirect(`/student/bookings?new=${ref}`);
}

export async function cancelBooking(formData: FormData): Promise<void> {
  const user = await requireRole("student");
  const id = String(formData.get("id") ?? "");
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking || booking.studentId !== user.id) return;
  if (booking.status !== "pending" && booking.status !== "confirmed") return;

  await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, id));

  if (booking.status === "confirmed") {
    const [p] = await db.select().from(properties).where(eq(properties.id, booking.propertyId));
    if (p) {
      await db
        .update(properties)
        .set({ availableRooms: Math.min(p.totalRooms, p.availableRooms + 1) })
        .where(eq(properties.id, p.id));
    }
  }
  revalidatePath("/student/bookings");
  revalidatePath("/landlord/bookings");
}

/** Landlord confirms an application and a room is taken off the market. */
export async function confirmBooking(formData: FormData): Promise<void> {
  const user = await requireRole("landlord", "admin");
  const id = String(formData.get("id") ?? "");
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking || booking.status !== "pending") return;

  const [property] = await db.select().from(properties).where(eq(properties.id, booking.propertyId));
  if (!property) return;
  if (user.role === "landlord" && property.landlordId !== user.id) return;
  if (property.availableRooms < 1) {
    await db.update(bookings).set({ status: "rejected" }).where(eq(bookings.id, id));
  } else {
    await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, id));
    await db
      .update(properties)
      .set({ availableRooms: Math.max(0, property.availableRooms - 1) })
      .where(eq(properties.id, property.id));
  }
  revalidatePath("/landlord/bookings");
  revalidatePath("/landlord");
  revalidatePath("/listings");
}

export async function rejectBooking(formData: FormData): Promise<void> {
  const user = await requireRole("landlord", "admin");
  const id = String(formData.get("id") ?? "");
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking || booking.status !== "pending") return;
  const [property] = await db.select().from(properties).where(eq(properties.id, booking.propertyId));
  if (!property || (user.role === "landlord" && property.landlordId !== user.id)) return;
  await db.update(bookings).set({ status: "rejected" }).where(eq(bookings.id, id));
  revalidatePath("/landlord/bookings");
}

export async function markOccupied(formData: FormData): Promise<void> {
  const user = await requireRole("landlord", "admin");
  const id = String(formData.get("id") ?? "");
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking || booking.status !== "confirmed") return;
  const [property] = await db.select().from(properties).where(eq(properties.id, booking.propertyId));
  if (!property || (user.role === "landlord" && property.landlordId !== user.id)) return;
  await db.update(bookings).set({ status: "occupied" }).where(eq(bookings.id, id));
  revalidatePath("/landlord/bookings");
  revalidatePath("/landlord/tenants");
}

export async function completeBooking(formData: FormData): Promise<void> {
  const user = await requireRole("landlord", "admin");
  const id = String(formData.get("id") ?? "");
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!booking || (booking.status !== "occupied" && booking.status !== "confirmed")) return;
  const [property] = await db.select().from(properties).where(eq(properties.id, booking.propertyId));
  if (!property || (user.role === "landlord" && property.landlordId !== user.id)) return;
  await db.update(bookings).set({ status: "completed" }).where(eq(bookings.id, id));
  await db
    .update(properties)
    .set({ availableRooms: Math.min(property.totalRooms, property.availableRooms + 1) })
    .where(eq(properties.id, property.id));
  revalidatePath("/landlord/bookings");
  revalidatePath("/landlord/tenants");
  revalidatePath("/listings");
}
