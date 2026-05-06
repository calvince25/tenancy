import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WaterBillTable } from "@/components/water/water-bill-table";
import { Button } from "@/components/ui/button";
import { Plus, Droplets, Download, Filter, Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default async function WaterBillsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

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
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Water Billing</h1>
          <p className="text-muted-foreground mt-1 font-medium">Monitor consumption and manage utility billing for all units.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-muted-foreground/10 font-bold gap-2 h-11 px-6">
            <Download className="w-4 h-4" /> Usage Report
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Log New Reading
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Droplets className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Usage This Month</p>
                  <p className="text-2xl font-bold text-primary">1,245 Units</p>
               </div>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revenue Impact</p>
                  <p className="text-2xl font-bold text-primary">KES 249,000</p>
               </div>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Filter className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Rate</p>
                  <p className="text-2xl font-bold text-primary">KES 200 / Unit</p>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-muted/40 overflow-hidden">
        <div className="p-8 border-b border-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex gap-4">
              <Button className="bg-primary text-white font-bold rounded-xl px-6 h-10 border-none">Current Cycle</Button>
              <Button variant="ghost" className="text-muted-foreground font-bold hover:text-primary rounded-xl px-6 h-10">Billing History</Button>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search unit or tenant..." 
                className="pl-10 h-10 w-64 rounded-xl border-muted-foreground/10 bg-slate-50/50 focus:ring-primary"
              />
           </div>
        </div>
        <WaterBillTable bills={bills} />
      </div>
    </div>
  );
}
