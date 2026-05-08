import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Layers, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function PropertyUnitsPage({ params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
    include: {
      units: {
        include: {
          tenancies: {
            where: { status: "ACTIVE" },
            include: { tenant: true }
          }
        },
        orderBy: { unitNumber: "asc" }
      }
    }
  });

  if (!property || property.landlordId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Units Management</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage individual units and their occupancy for {property.address}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Unit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {property.units.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <Layers className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">No units added yet</p>
            <Button variant="ghost" className="mt-4 text-primary font-bold">Add your first unit</Button>
          </div>
        ) : (
          property.units.map((unit) => (
            <div key={unit.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-bold">
                  {unit.unitNumber}
                </div>
                <Badge className={unit.status === 'OCCUPIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'}>
                  {unit.status}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Unit {unit.unitNumber}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">{unit.type}</p>
              
              {unit.tenancies[0] ? (
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Tenant</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {unit.tenancies[0].tenant.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{unit.tenancies[0].tenant.name}</span>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-50">
                   <p className="text-[10px] font-bold text-slate-400 uppercase italic">Vacant - Ready for lease</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", className)}>
      {children}
    </span>
  );
}

import { cn } from "@/lib/utils";
