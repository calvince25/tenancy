import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Download, 
  Phone, 
  IdCard, 
  Calendar, 
  CreditCard, 
  Droplets,
  BadgeCheck,
  History
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function TenantRecordPage({ 
  params 
}: { 
  params: { propertyId: string; tenancyId: string } 
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const tenancy = await prisma.tenancy.findUnique({
    where: { id: params.tenancyId },
    include: {
      tenant: true,
      unit: true,
      property: true,
      payments: {
        orderBy: { submittedAt: "desc" }
      },
      waterBills: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!tenancy || tenancy.propertyId !== params.propertyId || tenancy.landlordId !== session.user.id) {
    notFound();
  }

  const latestPayment = tenancy.payments[0];
  const latestWater = tenancy.waterBills[0];

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto animate-in fade-in duration-500 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/${params.propertyId}/tenants`}>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{tenancy.tenant.name}</h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">Tenant Record • Unit {tenancy.unit?.unitNumber}</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
          <Download className="w-4 h-4" /> Export records (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tenant Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
             <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center text-3xl font-black text-primary mb-4 border-4 border-white shadow-xl">
                    {tenancy.tenant.name?.substring(0, 2).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{tenancy.tenant.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Tenant</p>
             </div>

             <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Phone className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Phone Number</p>
                        <p className="font-bold text-slate-700">{tenancy.tenant.phone}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <IdCard className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">National ID</p>
                        <p className="font-bold text-slate-700">{tenancy.tenant.nationalId || "Not provided"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Lease Term</p>
                        <p className="font-bold text-slate-700 text-sm">
                            {new Date(tenancy.startDate).toLocaleDateString()} - {tenancy.endDate ? new Date(tenancy.endDate).toLocaleDateString() : "Ongoing"}
                        </p>
                    </div>
                </div>
             </div>

             <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase mb-2">Financial Summary</p>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-2xl font-black text-primary">KES {tenancy.monthlyRent.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-primary/60 italic">Monthly Rent</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-slate-600">KES {tenancy.depositAmount?.toLocaleString() || "0"}</p>
                        <p className="text-[10px] font-bold text-slate-400 italic">Deposit Paid</p>
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Rent Status</p>
                    <p className="text-lg font-bold text-slate-900">{latestPayment?.status === "CONFIRMED" ? "Up to date" : "Payment Pending"}</p>
                </div>
                <Badge className={cn(
                    "h-10 px-4 rounded-xl font-bold border-none",
                    latestPayment?.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                    {latestPayment?.status === "CONFIRMED" ? "PAID" : "OVERDUE"}
                </Badge>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Water Status</p>
                    <p className="text-lg font-bold text-slate-900">{latestWater?.status === "PAID" ? "All cleared" : "Reading Logged"}</p>
                </div>
                <Badge className={cn(
                    "h-10 px-4 rounded-xl font-bold border-none",
                    latestWater?.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                    {latestWater?.status === "PAID" ? "PAID" : "PENDING"}
                </Badge>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <History className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Payment History</h3>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Date</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Period</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Amount</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {tenancy.payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-4 text-sm font-bold text-slate-700">{new Date(payment.submittedAt).toLocaleDateString()}</td>
                                <td className="px-8 py-4 text-sm font-medium text-slate-600">{payment.period}</td>
                                <td className="px-8 py-4 text-sm font-black text-slate-900">KES {payment.amount.toLocaleString()}</td>
                                <td className="px-8 py-4 text-right">
                                    <Badge className={cn(
                                        "rounded-full px-3 py-0.5 text-[9px] font-bold border-none",
                                        payment.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                    )}>
                                        {payment.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        {tenancy.payments.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-10 text-center text-slate-400 italic text-sm">No payment records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>

          {/* Water History */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Droplets className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Water Consumption</h3>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Month</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Usage</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Amount</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {tenancy.waterBills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-4 text-sm font-bold text-slate-700">{bill.month}</td>
                                <td className="px-8 py-4 text-sm font-medium text-slate-600">{bill.unitsUsed} Units</td>
                                <td className="px-8 py-4 text-sm font-black text-slate-900">KES {bill.totalAmount.toLocaleString()}</td>
                                <td className="px-8 py-4 text-right">
                                    <Badge className={cn(
                                        "rounded-full px-3 py-0.5 text-[9px] font-bold border-none",
                                        bill.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                    )}>
                                        {bill.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        {tenancy.waterBills.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-10 text-center text-slate-400 italic text-sm">No water bills recorded.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
