import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MaintenanceTable } from "@/components/maintenance/maintenance-table";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, Download, Filter, Search, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default async function MaintenancePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const reports = await prisma.repairReport.findMany({
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
    orderBy: { submittedAt: "desc" }
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Maintenance & Repairs</h1>
          <p className="text-muted-foreground mt-1 font-medium">Track service requests and property maintenance logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-muted-foreground/10 font-bold gap-2 h-11 px-6">
            <Download className="w-4 h-4" /> History Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Log Repair
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-destructive/5 rounded-2xl flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Urgent Requests</p>
                  <p className="text-2xl font-bold text-primary">3 Pending</p>
               </div>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-warning/5 rounded-2xl flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">In Progress</p>
                  <p className="text-2xl font-bold text-primary">8 Jobs</p>
               </div>
            </CardContent>
         </Card>
         <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-success/5 rounded-2xl flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resolved (30d)</p>
                  <p className="text-2xl font-bold text-primary">14 Requests</p>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-muted/40 overflow-hidden">
        <div className="p-8 border-b border-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex gap-4">
              <Button className="bg-primary text-white font-bold rounded-xl px-6 h-10 border-none">Active Requests</Button>
              <Button variant="ghost" className="text-muted-foreground font-bold hover:text-primary rounded-xl px-6 h-10">Resolved</Button>
              <Button variant="ghost" className="text-muted-foreground font-bold hover:text-primary rounded-xl px-6 h-10">Scheduled</Button>
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search requests..." 
                className="pl-10 h-10 w-64 rounded-xl border-muted-foreground/10 bg-slate-50/50 focus:ring-primary"
              />
           </div>
        </div>
        <MaintenanceTable reports={reports} />
      </div>
    </div>
  );
}
