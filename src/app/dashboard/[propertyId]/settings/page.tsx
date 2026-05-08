import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings, Save, Trash2, Shield, Bell, CreditCard } from "lucide-react";

export default async function PropertySettingsPage({ params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
  });

  if (!property || property.landlordId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-32 animate-in fade-in duration-500">
      <PropertySettingsForm property={JSON.parse(JSON.stringify(property))} />
    </div>
  );
}

import { PropertySettingsForm } from "@/components/properties/PropertySettingsForm";
