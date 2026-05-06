"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Droplets, 
  CreditCard, 
  MoreVertical, 
  BedDouble, 
  Bath, 
  Maximize,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function UnitList({ units, propertyId }: { units: any[], propertyId: string }) {
  const [activeUnit, setActiveUnit] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      {units.length === 0 ? (
        <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-muted">
          <p className="text-muted-foreground font-medium">No units added to this property yet.</p>
          <Button variant="link" className="text-primary font-bold">Add your first unit</Button>
        </div>
      ) : (
        units.map((unit) => (
          <div 
            key={unit.id} 
            className={cn(
              "group relative bg-white rounded-[1.5rem] p-6 border-2 transition-all duration-300",
              activeUnit === unit.id ? "border-primary shadow-xl scale-[1.02]" : "border-muted/30 hover:border-primary/50 hover:shadow-lg"
            )}
            onClick={() => setActiveUnit(unit.id)}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-bold text-lg">
                  {unit.unitNumber}
                </div>
                <div>
                  <h3 className="font-bold text-primary">{unit.type}</h3>
                  <Badge className={cn(
                    "text-[8px] font-bold uppercase tracking-widest px-2 py-0 h-4 border-none shadow-none",
                    unit.status === "OCCUPIED" ? "bg-success/10 text-success" : 
                    unit.status === "VACANT" ? "bg-primary/5 text-primary" : 
                    "bg-warning/10 text-warning"
                  )}>
                    {unit.status}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-tight">Tenant</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {unit.tenancies[0]?.tenant.name || "VACANT"}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-tight">Monthly Rent</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  KES {(unit.monthlyRent || unit.tenancies[0]?.monthlyRent || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="h-px bg-muted/50 my-6" />

            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-primary">2 Beds</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <Bath className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-primary">1 Bath</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <Maximize className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-primary">850 sqft</span>
               </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-transform">
              <Button variant="outline" className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-wider border-muted-foreground/10 hover:bg-primary/5 hover:text-primary transition-all">
                Edit Details
              </Button>
              {unit.status === "VACANT" ? (
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/10">
                  Assign Tenant
                </Button>
              ) : (
                <Button variant="outline" className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-wider border-destructive/10 text-destructive hover:bg-destructive/5 hover:border-destructive transition-all">
                  Mark Vacant
                </Button>
              )}
            </div>
            
            {unit.status === "MAINTENANCE" && (
              <div className="absolute top-4 right-12">
                <Badge className="bg-warning text-white gap-1 animate-pulse border-none">
                  <AlertCircle className="w-3 h-3" /> Issue Reported
                </Badge>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
