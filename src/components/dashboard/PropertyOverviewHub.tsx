"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Droplets,
  CreditCard,
  Wrench,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Calendar,
  Download,
  Activity,
  LayoutDashboard,
  BadgeCheck,
  UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PropertyOverviewHubProps {
  property: any;
}

export function PropertyOverviewHub({ property }: PropertyOverviewHubProps) {
  const router = useRouter();

  const stats = useMemo(() => {
    let totalUnits = property.units.length;
    let occupiedUnits = 0;
    let expectedRent = 0;
    let collectedRent = 0;
    let urgentMaintenance = 0;
    let normalMaintenance = 0;
    let lowMaintenance = 0;

    const currentMonth = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    property.units.forEach((unit: any) => {
      if (unit.status === "OCCUPIED") occupiedUnits++;
      
      unit.tenancies?.forEach((tenancy: any) => {
        if (tenancy.status === "ACTIVE") {
            expectedRent += tenancy.monthlyRent;
            
            tenancy.payments?.forEach((p: any) => {
                if (p.period === currentMonth && p.status === "CONFIRMED" && p.type === "RENT") {
                    collectedRent += p.amount;
                }
            });

            tenancy.repairReports?.forEach((r: any) => {
                if (r.status !== "RESOLVED") {
                    if (r.urgency === "EMERGENCY" || r.urgency === "URGENT") urgentMaintenance++;
                    else if (r.urgency === "SOON" || r.urgency === "NORMAL") normalMaintenance++;
                    else lowMaintenance++;
                }
            });
        }
      });
    });

    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    const rentCollectionRate = expectedRent > 0 ? (collectedRent / expectedRent) * 100 : 0;

    return {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      occupancyRate,
      expectedRent,
      collectedRent,
      rentCollectionRate,
      urgentMaintenance,
      normalMaintenance,
      lowMaintenance
    };
  }, [property]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             Property Hub
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Overview and quick management for {property.address}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold gap-2 px-6 shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <div className="h-11 px-4 bg-slate-100 rounded-xl flex items-center gap-2 text-slate-500 font-bold text-sm">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
            { label: "Total Units", value: stats.totalUnits, sub: "Capacity", icon: Building2, color: "text-slate-900 bg-slate-50" },
            { label: "Occupancy", value: `${stats.occupiedUnits} / ${stats.totalUnits}`, sub: `${stats.occupancyRate.toFixed(1)}% Rate`, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "Expected Rent", value: `KES ${stats.expectedRent.toLocaleString()}`, sub: "Monthly Target", icon: CreditCard, color: "text-primary bg-primary/5" },
            { label: "Collected", value: `KES ${stats.collectedRent.toLocaleString()}`, sub: `${stats.rentCollectionRate.toFixed(1)}% Rate`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
            { label: "Maintenance", value: stats.urgentMaintenance + stats.normalMaintenance + stats.lowMaintenance, sub: `${stats.urgentMaintenance} Urgent`, icon: Wrench, color: "text-amber-600 bg-amber-50" },
            { label: "Vacant", value: stats.vacantUnits, sub: "Available Now", icon: LayoutDashboard, color: "text-slate-400 bg-slate-50" },
        ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-lg font-black text-slate-900 leading-tight">{stat.value}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic">{stat.sub}</p>
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Quick Action Hub
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                        variant="outline" 
                        className="h-28 rounded-3xl flex flex-col gap-2 border-slate-100 hover:border-primary hover:bg-primary/5 hover:scale-[1.02] transition-all group shadow-sm"
                        onClick={() => router.push(`/dashboard/${property.id}/tenants`)}
                    >
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Add Tenant</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="h-28 rounded-3xl flex flex-col gap-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 hover:scale-[1.02] transition-all group shadow-sm"
                        onClick={() => router.push(`/dashboard/${property.id}/payments`)}
                    >
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Record Payment</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="h-28 rounded-3xl flex flex-col gap-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 hover:scale-[1.02] transition-all group shadow-sm"
                        onClick={() => router.push(`/dashboard/${property.id}/water`)}
                    >
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Droplets className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Log Water</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="h-28 rounded-3xl flex flex-col gap-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50 hover:scale-[1.02] transition-all group shadow-sm"
                        onClick={() => router.push(`/dashboard/${property.id}/maintenance`)}
                    >
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                            <Wrench className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">New Request</span>
                    </Button>
                </div>
            </div>

            {/* Maintenance Summary Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Maintenance Summary</h3>
                    <Badge variant="outline" className="rounded-lg font-bold text-[10px] text-slate-400">STATUS VIEW</Badge>
                </div>
                <div className="p-8 grid grid-cols-3 gap-6">
                    <div className="p-6 bg-red-50 rounded-3xl border border-red-100 text-center">
                        <p className="text-2xl font-black text-red-600">{stats.urgentMaintenance}</p>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1">Urgent</p>
                    </div>
                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 text-center">
                        <p className="text-2xl font-black text-amber-600">{stats.normalMaintenance}</p>
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-1">Normal</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                        <p className="text-2xl font-black text-slate-600">{stats.lowMaintenance}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Low Priority</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 text-center">
                    <Button variant="ghost" className="text-[10px] font-black uppercase text-primary hover:bg-primary/5" onClick={() => router.push(`/dashboard/${property.id}/maintenance`)}>
                        Manage All Requests
                    </Button>
                </div>
            </div>
        </div>

        {/* Recent Activity / Sidebar */}
        <div className="lg:col-span-1 space-y-8">
             <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <TrendingUp className="w-24 h-24" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] opacity-40 mb-8">Yield & Performance</h3>
                <div className="space-y-6">
                    <div>
                        <p className="text-3xl font-black mb-1">{stats.rentCollectionRate.toFixed(1)}%</p>
                        <p className="text-[10px] font-bold uppercase text-primary/80">Collection Efficiency</p>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ width: `${stats.rentCollectionRate}%` }} 
                        />
                    </div>
                    <div className="pt-4 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-lg font-bold">KES {stats.collectedRent.toLocaleString()}</p>
                            <p className="text-[10px] opacity-40 uppercase font-black">Received</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-red-400">KES {(stats.expectedRent - stats.collectedRent).toLocaleString()}</p>
                            <p className="text-[10px] opacity-40 uppercase font-black">Arrears</p>
                        </div>
                    </div>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center justify-between">
                    Property Health
                    <BadgeCheck className="w-4 h-4 text-primary" />
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Maintenance Response</span>
                        <span className="text-xs font-black text-slate-900">Excellent</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Tenant Retention</span>
                        <span className="text-xs font-black text-slate-900">92%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">System Uptime</span>
                        <span className="text-xs font-black text-slate-900">100%</span>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}

