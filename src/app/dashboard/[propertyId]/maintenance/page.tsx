import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MaintenanceManager } from "@/components/maintenance/MaintenanceManager";

export default async function PropertyMaintenancePage({ params }: { params: { propertyId: string } }) {
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
        unit: true
    }
  });

  const reports = await prisma.repairReport.findMany({
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
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <MaintenanceManager 
        tenancies={JSON.parse(JSON.stringify(tenancies))}
        reports={JSON.parse(JSON.stringify(reports))}
        propertyId={params.propertyId}
        propertyName={property.address || "this property"}
      />
    </div>
  );
}
