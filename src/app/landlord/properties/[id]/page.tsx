import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { PropertyForm } from "../property-form";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("landlord");
  const { id } = await params;

  const [property] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  if (!property || property.landlordId !== user.id) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Edit listing"
        title={property.title}
        description="Update details, pricing or photos. Material changes are re-verified by an admin."
        actions={
          property.status === "verified" ? (
            <Link href={`/listings/${property.id}`} className="btn btn-ghost">
              <ExternalLink className="h-4 w-4" aria-hidden /> View public page
            </Link>
          ) : undefined
        }
      />
      <PropertyForm mode="edit" initial={property} />
    </>
  );
}
