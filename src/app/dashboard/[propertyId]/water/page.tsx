import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, Download, Search, History } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function PropertyWaterPage({ params }: { params: { propertyId: string } }) {
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
        waterBills: {
            orderBy: { createdAt: "desc" },
            take: 1
        }
    }
  });

  const waterBills = await prisma.waterBill.findMany({
    where: {
      tenancy: { propertyId: params.propertyId }
    },
    include: {
      tenancy: {
        include: {
          tenant: true,
          unit: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      <WaterManager 
        tenancies={JSON.parse(JSON.stringify(tenancies))}
        waterBills={JSON.parse(JSON.stringify(waterBills))}
        propertyId={params.propertyId}
        propertyName={property.address || "this property"}
        waterRate={property.waterRate || 0}
      />
    </div>
  );
}

import { WaterManager } from "@/components/water/WaterManager";
