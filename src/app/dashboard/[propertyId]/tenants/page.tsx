import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TenantTable } from "@/components/tenants/tenant-table";
import { Button } from "@/components/ui/button";
import { UserPlus, Download, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function PropertyTenantsPage({ params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
    select: { address: true, landlordId: true }
  });

  if (!property || property.landlordId !== session.user.id) {
    redirect("/dashboard");
  }

  const tenancies = await prisma.tenancy.findMany({
    where: { propertyId: params.propertyId, status: "ACTIVE" },
    include: {
      tenant: true,
      unit: true,
      property: true,
      payments: {
        orderBy: { submittedAt: "desc" },
        take: 1
      },
      waterBills: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const vacantUnits = await prisma.unit.findMany({
    where: { propertyId: params.propertyId, status: "VACANT" },
    orderBy: { unitNumber: "asc" }
  });

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      <TenantManager 
        initialTenancies={JSON.parse(JSON.stringify(tenancies))} 
        vacantUnits={JSON.parse(JSON.stringify(vacantUnits))}
        propertyId={params.propertyId}
        propertyName={property.address || "this property"}
      />
    </div>
  );
}

import { TenantManager } from "@/components/tenants/TenantManager";
