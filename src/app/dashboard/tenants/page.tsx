import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function TenantsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "LANDLORD") redirect("/login");

  const properties = await prisma.property.findMany({
    where: { landlordId: session.user.id },
    include: {
      tenancies: {
        include: {
          tenant: true,
          unit: true,
        }
      }
    }
  });

  const tenants = properties.flatMap(p => p.tenancies.map(t => ({
    ...t.tenant,
    propertyAddress: p.address,
    unitNumber: t.unit?.unitNumber,
    tenancyId: t.id
  })));

  return (
    <div className="p-6 md:p-10 space-y-8">
      <DashboardHeader 
        title="Tenants" 
        description="Manage all tenants across your properties." 
      />
      
      <div className="bg-white rounded-2xl border border-muted-foreground/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted/30 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold">Tenant Name</th>
              <th className="px-6 py-4 text-sm font-semibold">Property</th>
              <th className="px-6 py-4 text-sm font-semibold">Unit</th>
              <th className="px-6 py-4 text-sm font-semibold">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tenants.map((tenant: any) => (
              <tr key={tenant.id} className="hover:bg-muted/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium">{tenant.name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{tenant.propertyAddress}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {tenant.unitNumber || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{tenant.email}</td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground italic">
                  No tenants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
