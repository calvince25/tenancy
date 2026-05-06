import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RevenueCharts } from "@/components/analytics/revenue-charts";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  Building2,
  Droplets
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch some aggregate data for the cards
  const propertiesCount = await prisma.property.count({ where: { landlordId: session.user.id } });
  const unitsCount = await prisma.unit.count({ where: { property: { landlordId: session.user.id } } });
  const tenancies = await prisma.tenancy.findMany({
    where: { landlordId: session.user.id, status: "ACTIVE" },
    include: { payments: { where: { status: "CONFIRMED" } } }
  });

  const totalMonthlyRent = tenancies?.reduce((acc, t) => acc + (t.monthlyRent || 0), 0) || 0;
  const totalRevenueCollected = tenancies?.reduce((acc, t) => acc + (t.payments?.reduce((pAcc, p) => pAcc + (p.amount || 0), 0) || 0), 0) || 0;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground mt-1 font-medium">Deep dive into your portfolio's financial performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-muted-foreground/10 font-bold gap-2 h-11 px-6">
            <Calendar className="w-4 h-4" /> This Year
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-8">
               <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <Badge className="bg-success/10 text-success border-none font-bold">+12.5%</Badge>
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Revenue (Annual)</p>
               <p className="text-3xl font-bold text-primary mt-1">KES 5.2M</p>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-8">
               <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <Badge className="bg-success/10 text-success border-none font-bold">+4.2%</Badge>
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Net Profit</p>
               <p className="text-3xl font-bold text-primary mt-1">KES 3.8M</p>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-8">
               <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-success/5 rounded-2xl flex items-center justify-center text-success">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <Badge className="bg-primary/5 text-primary border-none font-bold">Optimal</Badge>
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rent Collection Rate</p>
               <p className="text-3xl font-bold text-primary mt-1">96.8%</p>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-8">
               <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-warning/5 rounded-2xl flex items-center justify-center text-warning">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <Badge className="bg-destructive/10 text-destructive border-none font-bold">-2.1%</Badge>
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Water Collection Rate</p>
               <p className="text-3xl font-bold text-primary mt-1">84.2%</p>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-muted/40 h-[500px] flex flex-col">
               <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-xl font-bold text-primary">Revenue Growth</h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Monthly breakdown of income types</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Rent</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-secondary" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Water</span>
                     </div>
                  </div>
               </div>
               <div className="flex-1 w-full bg-slate-50/50 rounded-2xl flex items-center justify-center">
                  <span className="text-muted-foreground font-bold">Revenue Data Visualization (Temporarily Disabled)</span>
                  {/* <RevenueCharts /> */}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-muted/40">
                  <h3 className="font-bold text-primary uppercase text-xs tracking-widest mb-6">Occupancy Trends</h3>
                  <div className="h-48 flex items-end justify-between gap-2">
                     {[40, 60, 45, 90, 85, 100, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-100 rounded-t-lg relative group">
                           <div className="absolute bottom-0 left-0 right-0 bg-primary/20 rounded-t-lg transition-all duration-500 group-hover:bg-primary/40" style={{ height: `${h}%` }} />
                        </div>
                     ))}
                  </div>
                  <div className="flex justify-between mt-4 text-[9px] font-bold text-muted-foreground uppercase">
                     <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span><span>Dec</span>
                  </div>
               </div>
               <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-muted/40">
                  <h3 className="font-bold text-primary uppercase text-xs tracking-widest mb-6">Expense vs Revenue</h3>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                           <span className="text-muted-foreground">Operating Expenses</span>
                           <span className="text-primary font-bold">KES 1.2M</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-secondary" style={{ width: '25%' }} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                           <span className="text-muted-foreground">Maintenance</span>
                           <span className="text-primary font-bold">KES 400K</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-warning" style={{ width: '8%' }} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                           <span className="text-muted-foreground">Net Profit</span>
                           <span className="text-success font-bold">KES 3.8M</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-success" style={{ width: '67%' }} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-muted/40">
               <h2 className="text-xl font-bold text-primary mb-6">Top Performing Units</h2>
               <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((u) => (
                     <div key={u} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-white border border-muted/30 flex items-center justify-center font-bold text-primary text-sm shadow-sm">
                              A{u}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-primary">Luxury Suite</p>
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Skyline Residences</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-bold text-primary">KES 85,000</p>
                           <p className="text-[9px] text-success font-bold uppercase tracking-widest">100% ROI</p>
                        </div>
                     </div>
                  ))}
               </div>
               <Button variant="ghost" className="w-full mt-6 text-primary font-bold hover:bg-primary/5 rounded-xl">View All Performance</Button>
            </div>

            <div className="bg-primary rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
               <h3 className="text-lg font-bold mb-4 relative z-10">Monthly Projection</h3>
               <p className="text-sm opacity-80 mb-6 relative z-10">Based on current occupancy and payment trends, your expected revenue for next month is:</p>
               <p className="text-4xl font-bold relative z-10">KES 485,200</p>
               <div className="mt-8 flex items-center gap-2 relative z-10">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs font-bold text-success uppercase tracking-widest">+5.4% vs last month</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", className)}>
      {children}
    </span>
  );
}
