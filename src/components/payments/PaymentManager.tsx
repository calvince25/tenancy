"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Eye,
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PaymentManagerProps {
  tenancies: any[];
  propertyId: string;
  propertyName: string;
}

export function PaymentManager({ tenancies, propertyId, propertyName }: PaymentManagerProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const monthYear = selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const stats = useMemo(() => {
    let collected = 0;
    let expected = 0;
    
    tenancies.forEach(t => {
      expected += t.monthlyRent;
      const monthPayment = t.payments.find((p: any) => p.period === monthYear && p.status === 'CONFIRMED');
      if (monthPayment) {
        collected += monthPayment.amount;
      }
    });

    const arrears = expected - collected;
    const rate = expected > 0 ? (collected / expected) * 100 : 0;

    return { collected, arrears, rate };
  }, [tenancies, monthYear]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const filteredTenancies = tenancies.filter(t => 
    (t.tenant?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (t.unit?.unitNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payments & Rent</h1>
          <p className="text-muted-foreground mt-1 font-medium">Tracking income and collection for {propertyName}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2 h-11 px-6 shadow-sm">
            <Download className="w-4 h-4" /> Download Full Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Monthly Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selected Month</p>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="h-7 w-7 rounded-lg hover:bg-slate-50">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="h-7 w-7 rounded-lg hover:bg-slate-50">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{monthYear}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60">Rent Collected</p>
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                </div>
            </div>
            <p className="text-2xl font-black text-emerald-600">KES {stats.collected.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-red-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600/60">Arrears Outstanding</p>
                <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                    <AlertCircle className="w-4 h-4" />
                </div>
            </div>
            <p className="text-2xl font-black text-red-600">KES {stats.arrears.toLocaleString()}</p>
        </div>

        <div className="bg-primary p-6 rounded-[2rem] shadow-xl shadow-primary/20 flex flex-col justify-between text-white">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Collection Rate</p>
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white">
                    <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
            <p className="text-3xl font-black">{stats.rate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Tenant Payment List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Tenant Payment Status — {monthYear}</h3>
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="Search tenant or unit..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 rounded-xl border-slate-200 bg-white"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="px-8 py-4">Tenant / Unit</th>
                        <th className="px-8 py-4">Expected Rent</th>
                        <th className="px-8 py-4">Amount Paid</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredTenancies.map((t) => {
                        const monthPayment = t.payments.find((p: any) => p.period === monthYear && p.status === 'CONFIRMED');
                        const isPaid = !!monthPayment;
                        
                        return (
                            <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-8 py-5">
                                    <p className="font-bold text-slate-900 text-sm">{t.tenant.name}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Unit {t.unit?.unitNumber || "N/A"}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="font-bold text-slate-700 text-sm">KES {t.monthlyRent.toLocaleString()}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="font-black text-slate-900 text-sm">KES {monthPayment?.amount.toLocaleString() || "0"}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <Badge className={cn(
                                        "rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest border-none shadow-sm",
                                        isPaid ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                    )}>
                                        {isPaid ? "PAID" : "OVERDUE"}
                                    </Badge>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <Button 
                                        variant="ghost" 
                                        className="rounded-xl font-bold text-xs gap-2 text-primary hover:bg-primary/5"
                                        onClick={() => router.push(`/dashboard/${propertyId}/payments/${t.id}`)}
                                    >
                                        View Records <ChevronRight className="w-3 h-3" />
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredTenancies.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold italic">No active tenancies found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
