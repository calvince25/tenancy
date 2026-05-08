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
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Water Billing</h1>
          <p className="text-muted-foreground mt-1 font-medium">Meter readings and billing cycles for {property.address}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2 h-11 px-6">
            <History className="w-4 h-4" /> Usage History
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Log Reading
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Billing Log</h3>
          <div className="flex items-center gap-2">
             <Search className="w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-6 py-4">Unit / Tenant</th>
                <th className="px-6 py-4">Previous</th>
                <th className="px-6 py-4">Current</th>
                <th className="px-6 py-4">Consumption</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {waterBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">No water bills generated yet.</td>
                </tr>
              ) : (
                waterBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">Unit {bill.tenancy.unit.unitNumber}</p>
                      <p className="text-xs text-slate-400">{bill.tenancy.tenant.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">{bill.previousReading} units</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">{bill.currentReading} units</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-primary">{(bill.currentReading - bill.previousReading).toFixed(1)} Units</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900">KES {bill.totalAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
