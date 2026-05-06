import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "LANDLORD") redirect("/login");

  const payments = await prisma.payment.findMany({
    where: {
      tenancy: {
        property: {
          landlordId: session.user.id
        }
      }
    },
    include: {
      tenant: true,
      tenancy: {
        include: {
          property: true,
          unit: true
        }
      }
    },
    orderBy: { submittedAt: "desc" }
  });

  return (
    <div className="p-6 md:p-10 space-y-8">
      <DashboardHeader 
        title="Payments" 
        description="Monitor all rental and utility payments." 
      />
      
      <div className="bg-white rounded-2xl border border-muted-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-sm font-semibold">Tenant</th>
                <th className="px-6 py-4 text-sm font-semibold">Property/Unit</th>
                <th className="px-6 py-4 text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold">Type/Method</th>
                <th className="px-6 py-4 text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {format(new Date(payment.submittedAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{payment.tenant.name}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {payment.tenancy.property.address} - {payment.tenancy.unit?.unitNumber}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">
                    KES {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase text-primary">{payment.type}</span>
                      <span className="text-[10px] text-muted-foreground">{payment.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={payment.status === "CONFIRMED" ? "default" : "outline"} className={
                      payment.status === "CONFIRMED" ? "bg-success/10 text-success border-none" : "text-amber-500 border-amber-200"
                    }>
                      {payment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground italic">
                    No payment records found.
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
