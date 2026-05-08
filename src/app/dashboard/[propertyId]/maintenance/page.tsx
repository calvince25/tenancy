import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MaintenanceHub } from "@/components/maintenance/MaintenanceHub";
import { Wrench } from "lucide-react";

export default async function PropertyMaintenancePage({ params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  try {
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
      <div className="p-6 md:p-10 animate-in fade-in duration-500">
        <MaintenanceHub 
          tenancies={JSON.parse(JSON.stringify(tenancies || []))}
          reports={JSON.parse(JSON.stringify(reports || []))}
          propertyId={params.propertyId}
          propertyName={property.address || "this property"}
        />
      </div>
    );
  } catch (error) {
    console.error("Maintenance Page Error:", error);
    return (
      <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-100 m-10 shadow-sm">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Maintenance Hub Unavailable</h2>
        <p className="text-slate-500 mt-2 font-medium">We're having trouble loading the maintenance records. Please refresh the page or try again later.</p>
      </div>
    );
  }
}
