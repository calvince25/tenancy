"use client";

import { useState, useMemo } from "react";
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
  Download
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function LandlordDashboard({ user }: { user: any }) {
  const router = useRouter();

  // Calculate Statistics
  const stats = useMemo(() => {
    let totalUnits = 0;
    let occupiedUnits = 0;
    let totalRentDue = 0;
    let totalRentCollected = 0;
    let totalWaterDue = 0;
    let totalWaterCollected = 0;
    let openMaintenance = 0;
    let urgentMaintenance = 0;
    let totalExpenses = 0;

    user.properties?.forEach((property: any) => {
      property.units?.forEach((unit: any) => {
        totalUnits++;
        if (unit.status === "OCCUPIED") occupiedUnits++;
        
        unit.tenancies?.forEach((tenancy: any) => {
          totalRentDue += tenancy.monthlyRent || 0;
          
          tenancy.payments?.forEach((p: any) => {
            if (p.type === "RENT" && p.status === "CONFIRMED") totalRentCollected += p.amount;
            if (p.type === "WATER" && p.status === "CONFIRMED") totalWaterCollected += p.amount;
          });

          tenancy.waterBills?.forEach((w: any) => {
            totalWaterDue += w.totalAmount;
          });

          tenancy.repairReports?.forEach((r: any) => {
            if (r.status !== "RESOLVED") {
              openMaintenance++;
              if (r.urgency === "EMERGENCY" || r.urgency === "URGENT") urgentMaintenance++;
            }
            if (r.status === "RESOLVED" && r.cost) totalExpenses += r.cost;
          });
        });
      });
    });

    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    const outstandingRent = totalRentDue - totalRentCollected;
    const outstandingWater = totalWaterDue - totalWaterCollected;
    const netRevenue = (totalRentCollected + totalWaterCollected) - totalExpenses;

    return {
      totalUnits, occupiedUnits, vacantUnits, occupancyRate,
      totalRentDue, totalRentCollected, outstandingRent,
      totalWaterDue, totalWaterCollected, outstandingWater,
      openMaintenance, urgentMaintenance,
      netRevenue
    };
  }, [user]);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">
            Good Morning, <span className="text-primary font-bold">{user.name?.split(' ')[0] || "Landlord"}!</span>
          </p>
          <p className="text-sm text-muted-foreground">It's a great day to stay ahead of your property management goals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-muted shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary min-w-[120px]">
              {typeof window !== 'undefined' ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '...'}
            </span>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column: Main Content */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Property Summary</p>
                    <Building2 className="w-5 h-5 text-primary/40" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold text-primary">{stats.totalUnits}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Total Units</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-success flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> 3.0%
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">Occupancy</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Occupancy Rate</span>
                        <span className="text-primary">{stats.occupancyRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={stats.occupancyRate} className="h-2 bg-muted" />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-muted/50 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stats.occupiedUnits} Occupied | {stats.vacantUnits} Vacant</span>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-primary p-0 hover:bg-transparent">VIEW MORE</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rent Collection</p>
                    <CreditCard className="w-5 h-5 text-secondary/40" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">KES {(stats.totalRentCollected/1000).toFixed(1)}k</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Collected</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-destructive flex items-center gap-1 justify-end">
                          KES {(stats.outstandingRent/1000).toFixed(1)}k
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">Outstanding</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Collection Rate</span>
                        <span className="text-secondary">{stats.totalRentDue > 0 ? ((stats.totalRentCollected/stats.totalRentDue)*100).toFixed(1) : 0}%</span>
                      </div>
                      <Progress 
                        value={stats.totalRentDue > 0 ? (stats.totalRentCollected/stats.totalRentDue)*100 : 0} 
                        className="h-2 bg-muted" 
                        indicatorClassName="bg-secondary"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-muted/50 flex justify-between items-center group-hover:bg-secondary/5 transition-colors">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target: KES {(stats.totalRentDue/1000).toFixed(1)}k</span>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-secondary p-0 hover:bg-transparent">VIEW MORE</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Maintenance</p>
                    <Wrench className="w-5 h-5 text-accent/40" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold text-primary">{stats.openMaintenance}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Open Requests</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-warning flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {stats.urgentMaintenance} Urgent
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">Needs Attention</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
                          <div className="bg-destructive w-1/3" />
                          <div className="bg-warning w-1/3" />
                          <div className="bg-primary w-1/3" />
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                        <span>Urgent</span>
                        <span>Normal</span>
                        <span>Low</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-muted/50 flex justify-between items-center group-hover:bg-accent/5 transition-colors">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Response: 2.4 Days</span>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-accent p-0 hover:bg-transparent">VIEW MORE</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 rounded-2xl flex flex-col gap-2 border-muted-foreground/10 hover:border-primary hover:bg-primary/5 transition-all group"
              onClick={() => router.push("/dashboard/tenants")}
            >
              <div className="p-2 bg-primary/5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tight">Add Tenant</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 rounded-2xl flex flex-col gap-2 border-muted-foreground/10 hover:border-secondary hover:bg-secondary/5 transition-all group"
              onClick={() => router.push("/dashboard/payments")}
            >
              <div className="p-2 bg-secondary/5 rounded-xl group-hover:bg-secondary group-hover:text-white transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tight">Record Payment</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 rounded-2xl flex flex-col gap-2 border-muted-foreground/10 hover:border-accent hover:bg-accent/5 transition-all group"
              onClick={() => router.push("/dashboard/water")}
            >
              <div className="p-2 bg-accent/5 rounded-xl group-hover:bg-accent group-hover:text-white transition-colors">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tight">Log Water</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 rounded-2xl flex flex-col gap-2 border-muted-foreground/10 hover:border-warning hover:bg-warning/5 transition-all group"
              onClick={() => router.push("/dashboard/maintenance")}
            >
              <div className="p-2 bg-warning/5 rounded-xl group-hover:bg-warning group-hover:text-white transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-tight">New Request</span>
            </Button>
          </div>

          {/* Properties Preview Section */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-muted/40">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary">Portfolio Overview</h2>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Top performing properties</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="text-primary font-bold gap-2 hover:bg-primary/5 rounded-xl"
                onClick={() => router.push("/dashboard/properties")}
              >
                View Portfolio <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.properties?.slice(0, 4).map((property: any) => (
                <div key={property.id} className="group relative bg-slate-50/50 rounded-2xl overflow-hidden border border-muted/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer">
                  <div className="flex h-40">
                    <div className="w-1/3 relative overflow-hidden">
                      <img 
                        src={property.photoUrl || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=400&fit=crop"} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="w-2/3 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{property.type}</span>
                          <span className="text-[10px] font-bold text-success uppercase">Active</span>
                        </div>
                        <h3 className="text-lg font-bold text-primary mt-1 leading-tight">{property.address}</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                          ))}
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">+{property.units.length}</div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Yield</p>
                          <p className="text-xs font-bold text-primary">8.4%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar / Activity */}
        <div className="space-y-8">
          {/* Revenue Overview Card */}
          <Card className="border-none shadow-xl card-gradient-1 text-white rounded-[2rem] overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Net Revenue</p>
                <TrendingUp className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-1 mb-8">
                <p className="text-4xl font-bold">KES {(stats.netRevenue/1000).toFixed(1)}k</p>
                <p className="text-xs opacity-70 flex items-center gap-2">
                   <TrendingUp className="w-3 h-3" /> +12.5% from last month
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-70">Outstanding Payments</span>
                  <span className="font-bold">KES {(stats.outstandingRent + stats.outstandingWater).toLocaleString()}</span>
                </div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[85%]" />
                </div>
                <div className="flex items-center justify-between text-xs pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] opacity-70 uppercase font-bold">Total Expenses</span>
                    <span className="font-bold">KES {stats.totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center">
                    {/* Tiny visual chart or icon */}
                    <TrendingUp className="w-8 h-8 opacity-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-muted/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-primary">Recent Activities</h3>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="space-y-6">
              {[
                { type: 'MAINTENANCE', title: 'Leaking Sink - Unit 4B', time: '2 hours ago', icon: Wrench, color: 'text-warning bg-warning/5' },
                { type: 'PAYMENT', title: 'Rent Received - John Doe', time: '5 hours ago', icon: CreditCard, color: 'text-success bg-success/5' },
                { type: 'WATER', title: 'Water Bill Logged - Unit 12', time: 'Yesterday', icon: Droplets, color: 'text-secondary bg-secondary/5' },
                { type: 'LEASE', title: 'Lease Expiring - Unit 8', time: '2 days ago', icon: FileText, color: 'text-primary bg-primary/5' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", activity.color)}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-primary truncate leading-tight group-hover:text-primary/70 transition-colors">{activity.title}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" className="w-full mt-8 text-primary font-bold text-xs hover:bg-primary/5 rounded-xl border border-muted/50">
              VIEW ALL ACTIVITY
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
