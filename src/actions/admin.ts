"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { disputes, properties, users } from "@/db/schema";
import { makeRef } from "@/lib/format";
import { requireRole } from "@/lib/session";

export type DisputeState = { error?: string; success?: string } | null;

/* ------------------------------ verification ------------------------------ */

export async function setListingStatus(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!["verified", "rejected", "pending"].includes(action)) return;

  await db
    .update(properties)
    .set({ status: action as "verified" | "rejected" | "pending" })
    .where(eq(properties.id, id));

  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  revalidatePath("/listings");
}

export async function toggleFeatured(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const [p] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  if (!p) return;
  await db.update(properties).set({ featured: !p.featured }).where(eq(properties.id, id));
  revalidatePath("/admin/listings");
  revalidatePath("/");
}

/* ------------------------------- user control ----------------------------- */

export async function setUserStatus(formData: FormData): Promise<void> {
  const admin = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (id === admin.id) return;
  if (!["active", "suspended"].includes(action)) return;

  await db
    .update(users)
    .set({ status: action as "active" | "suspended" })
    .where(eq(users.id, id));

  revalidatePath("/admin/users");
}

/* -------------------------------- disputes -------------------------------- */

export async function createDispute(_prev: DisputeState, formData: FormData): Promise<DisputeState> {
  const user = await requireRole("student", "landlord");
  const subject = String(formData.get("subject") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  if (!subject || !details) return { error: "Please provide a subject and details." };

  await db.insert(disputes).values({
    reference: makeRef("DP"),
    raisedById: user.id,
    subject,
    details,
  });
  return { success: "Complaint filed. The admin team will review it shortly." };
}

export async function setDisputeStatus(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!["open", "in_review", "resolved"].includes(status)) return;

  const [d] = await db.select().from(disputes).where(eq(disputes.id, id)).limit(1);
  if (!d) return;

  await db
    .update(disputes)
    .set({
      status: status as "open" | "in_review" | "resolved",
      adminNote: note || d.adminNote,
      updatedAt: new Date(),
    })
    .where(eq(disputes.id, id));

  revalidatePath("/admin/disputes");
  revalidatePath("/admin");
}
