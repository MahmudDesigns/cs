"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { requireRole } from "@/lib/session";

export type PropertyState = { error?: string } | null;

function parsePropertyForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const nearestCampus = String(formData.get("nearestCampus") ?? "").trim();
  const distanceKm = String(formData.get("distanceKm") ?? "1.0").trim();
  const roomType = String(formData.get("roomType") ?? "single") as
    | "single"
    | "shared"
    | "studio"
    | "one_bedroom"
    | "apartment";
  const pricePerMonth = Math.max(0, Math.round(Number(formData.get("pricePerMonth") ?? 0)));
  const deposit = Math.max(0, Math.round(Number(formData.get("deposit") ?? 0)));
  const totalRooms = Math.max(1, Math.round(Number(formData.get("totalRooms") ?? 1)));
  const availableRoomsRaw = Number(formData.get("availableRooms") ?? totalRooms);
  const availableRooms = Math.min(totalRooms, Math.max(0, Math.round(availableRoomsRaw)));
  const amenities = formData.getAll("amenities").map(String).filter(Boolean);
  const images = formData.getAll("images").map(String).filter(Boolean);

  if (!title || !description || !area || !address || !nearestCampus)
    return { error: "Please complete all required fields." } as const;
  if (pricePerMonth < 1) return { error: "Enter a valid monthly rent." } as const;
  if (images.length < 1) return { error: "Choose at least one photo for the listing." } as const;
  if (description.length < 40)
    return { error: "Description should be at least 40 characters — students want details." } as const;

  return {
    data: {
      title,
      description,
      area,
      address,
      nearestCampus,
      distanceKm,
      roomType,
      pricePerMonth,
      deposit,
      totalRooms,
      availableRooms,
      amenities,
      images,
    },
  } as const;
}

export async function createProperty(_prev: PropertyState, formData: FormData): Promise<PropertyState> {
  const user = await requireRole("landlord");
  const parsed = parsePropertyForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await db.insert(properties).values({
    ...parsed.data,
    landlordId: user.id,
    status: "pending",
  });

  revalidatePath("/landlord/properties");
  revalidatePath("/admin/listings");
  redirect("/landlord/properties?created=1");
}

export async function updateProperty(
  propertyId: string,
  _prev: PropertyState,
  formData: FormData
): Promise<PropertyState> {
  const user = await requireRole("landlord");
  const parsed = parsePropertyForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const [existing] = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  if (!existing || existing.landlordId !== user.id) return { error: "Listing not found." };

  const availableRooms = Math.min(
    parsed.data.totalRooms,
    Math.max(0, Math.min(parsed.data.availableRooms, parsed.data.totalRooms))
  );

  await db
    .update(properties)
    .set({
      ...parsed.data,
      availableRooms,
      // Material edits bypass verification is a fraud vector — re-queue.
      status: "pending",
    })
    .where(eq(properties.id, propertyId));

  revalidatePath("/landlord/properties");
  revalidatePath(`/landlord/properties/${propertyId}`);
  revalidatePath("/listings");
  redirect("/landlord/properties?updated=1");
}

export async function adjustVacancy(formData: FormData): Promise<void> {
  const user = await requireRole("landlord");
  const id = String(formData.get("id") ?? "");
  const delta = Number(formData.get("delta") ?? 0);
  const [p] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  if (!p || p.landlordId !== user.id) return;
  const next = Math.min(p.totalRooms, Math.max(0, p.availableRooms + delta));
  await db.update(properties).set({ availableRooms: next }).where(eq(properties.id, id));
  revalidatePath("/landlord/properties");
  revalidatePath("/listings");
}
