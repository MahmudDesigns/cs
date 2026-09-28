import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { PropertyForm } from "../property-form";

export default async function NewPropertyPage() {
  await requireRole("landlord");
  return (
    <>
      <PageHeader
        eyebrow="New listing"
        title="Register a property"
        description="Fill this in carefully — students make decisions from what you write here. Admins verify before it goes live."
      />
      <PropertyForm mode="create" />
    </>
  );
}
