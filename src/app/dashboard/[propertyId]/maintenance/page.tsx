import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, Search, Filter, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function PropertyMaintenancePage({ params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
    select: { address: true, landlordId: true }
  });

  if (!property || property.landlordId !== session.user.id) {
    redirect("/dashboard");
  }

  const reports = await prisma.repairReport.findMany({
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
          <h1 className="text-3xl font-bold text-primary tracking-tight">Maintenance & Repairs</h1>
          <p className="text-muted-foreground mt-1 font-medium">Tracking and managing repair requests for {property.address}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> New Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Open Requests", value: reports.filter(r => r.status !== 'RESOLVED').length, icon: Clock, color: "text-orange-600 bg-orange-50" },
          { label: "Urgent Issues", value: reports.filter(r => (r.urgency === 'URGENT' || r.urgency === 'EMERGENCY') && r.status !== 'RESOLVED').length, icon: AlertCircle, color: "text-red-600 bg-red-50" },
          { label: "Resolved (30d)", value: reports.filter(r => r.status === 'RESOLVED').length, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
               <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 ml-1">Recent Requests</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {reports.length === 0 ? (
             <div className="col-span-full py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                <Wrench className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">No maintenance reports found.</p>
             </div>
           ) : (
             reports.map((report) => (
               <div key={report.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Wrench className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-900">Unit {report.tenancy.unit.unitNumber}</p>
                          <p className="text-xs text-slate-400">{report.tenancy.tenant.name}</p>
                       </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      report.urgency === 'EMERGENCY' ? 'bg-red-50 text-red-600' : 
                      report.urgency === 'URGENT' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {report.urgency}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">{report.issue}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{report.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(report.createdAt).toLocaleDateString()}</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      report.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {report.status}
                    </span>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
