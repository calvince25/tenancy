import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PropertiesList } from "@/components/properties/properties-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "LANDLORD") {
    redirect("/dashboard");
  }

  const properties = await prisma.property.findMany({
    where: { landlordId: session.user.id },
    include: {
      tenancies: {
        include: { tenant: true, unit: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <DashboardHeader 
        title="Your Properties" 
        description="Manage your units, tenant invites, and property details."
      >
        {/* We'll handle property adding via the main dashboard for now to keep it centralized, 
            but this page provides a detailed list view */}
      </DashboardHeader>

      <PropertiesList properties={properties} />
    </div>
  );
}
