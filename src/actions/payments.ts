"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { bookings, payments, properties } from "@/db/schema";
import { makeRef } from "@/lib/format";
import { requireRole } from "@/lib/session";

export type PaymentState = { error?: string; success?: string } | null;

/** Landlord raises a rent charge (invoice) against an active booking. */
export async function createCharge(_prev: PaymentState, formData: FormData): Promise<PaymentState> {
  const user = await requireRole("landlord");
  const bookingId = String(formData.get("bookingId") ?? "");
  const amount = Math.round(Number(formData.get("amount") ?? 0));
  const period = String(formData.get("period") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "");

  if (!bookingId || !amount || !period || !dueDate)
    return { error: "Fill in amount, period and due date." };
  if (amount < 1) return { error: "Amount must be greater than zero." };

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  if (!booking) return { error: "Booking not found." };
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, booking.propertyId))
    .limit(1);
  if (!property || property.landlordId !== user.id) return { error: "Booking not found." };
  if (booking.status !== "confirmed" && booking.status !== "occupied")
    return { error: "Charges can only be raised on confirmed or occupied bookings." };

  await db.insert(payments).values({
    reference: makeRef("PM"),
    bookingId,
    studentId: booking.studentId,
    landlordId: user.id,
    amount,
    period,
    dueDate,
    status: "pending",
  });

  revalidatePath("/landlord/payments");
  return { success: `Charge of KES${amount} for ${period} created.` };
}

/** Landlord records a received payment against a charge. */
export async function markPaid(formData: FormData): Promise<void> {
  const user = await requireRole("landlord", "admin");
  const id = String(formData.get("id") ?? "");
  const method = String(formData.get("method") ?? "Cash");

  const [payment] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  if (!payment) return;
  if (user.role === "landlord" && payment.landlordId !== user.id) return;
  if (payment.status === "paid") return;

  await db
    .update(payments)
    .set({ status: "paid", paidAt: new Date(), method })
    .where(eq(payments.id, id));

  revalidatePath("/landlord/payments");
  revalidatePath("/landlord/tenants");
  revalidatePath("/landlord");
  revalidatePath("/student/payments");
}
