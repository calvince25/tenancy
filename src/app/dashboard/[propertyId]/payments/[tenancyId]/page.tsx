import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Download, 
  Plus,
  CreditCard,
  History,
  Calendar,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PaymentList } from "@/components/payments/PaymentList";

export default async function TenantPaymentsPage({ 
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
      payments: {
        orderBy: { submittedAt: "desc" }
      }
    }
  });

  if (!tenancy || tenancy.propertyId !== params.propertyId || tenancy.landlordId !== session.user.id) {
    notFound();
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto animate-in fade-in duration-500 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/${params.propertyId}/payments`}>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Payment Records</h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">
                {tenancy.tenant.name} • Unit {tenancy.unit?.unitNumber}
            </p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
          <Download className="w-4 h-4" /> Download Report (PDF/CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Summary Info */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Rent</p>
                    <p className="text-2xl font-black text-primary">KES {tenancy.monthlyRent.toLocaleString()}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 italic">Rent Due Day</span>
                        <span className="text-xs font-bold text-slate-700">{tenancy.rentDueDay}st of Month</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 italic">Total Paid</span>
                        <span className="text-xs font-bold text-emerald-600">KES {tenancy.payments.filter((p: any) => p.status === 'CONFIRMED').reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 shadow-xl">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Running Balance</p>
                    <p className="text-xl font-bold">KES 0</p>
                </div>
            </div>
        </div>

        {/* Right: Payment List & Form */}
        <div className="lg:col-span-3">
            <PaymentList 
                initialPayments={JSON.parse(JSON.stringify(tenancy.payments))}
                tenancyId={tenancy.id}
                tenantId={tenancy.tenantId}
                rentAmount={tenancy.monthlyRent}
            />
        </div>
      </div>
    </div>
  );
}
