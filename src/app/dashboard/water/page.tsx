import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function WaterBillsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "LANDLORD") redirect("/login");

  const bills = await prisma.waterBill.findMany({
    where: {
      tenancy: {
        property: {
          landlordId: session.user.id
        }
      }
    },
    include: {
      tenancy: {
        include: {
          property: true,
          unit: true,
          tenant: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 md:p-10 space-y-8">
      <DashboardHeader 
        title="Water Bills" 
        description="Track water usage and billing across your units." 
      />
      
      <div className="bg-white rounded-2xl border border-muted-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">Month</th>
                <th className="px-6 py-4 text-sm font-semibold">Tenant/Unit</th>
                <th className="px-6 py-4 text-sm font-semibold">Readings</th>
                <th className="px-6 py-4 text-sm font-semibold">Units Used</th>
                <th className="px-6 py-4 text-sm font-semibold">Total Amount</th>
                <th className="px-6 py-4 text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bills.map((bill: any) => (
                <tr key={bill.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{bill.month}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{bill.tenancy.tenant.name}</div>
                    <div className="text-[10px] text-muted-foreground">Unit {bill.tenancy.unit?.unitNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {bill.previousReading} → {bill.currentReading}
                  </td>
                  <td className="px-6 py-4 text-sm">{bill.unitsUsed}</td>
                  <td className="px-6 py-4 font-bold text-sm">KES {bill.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={bill.status === "PAID" ? "default" : "outline"} className={
                      bill.status === "PAID" ? "bg-success/10 text-success border-none" : "text-amber-500 border-amber-200"
                    }>
                      {bill.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground italic">
                    No water bills found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
