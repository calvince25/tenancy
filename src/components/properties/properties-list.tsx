"use client";

import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MoreVertical, 
  Users, 
  Home, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export function PropertiesList({ properties }: { properties: any[] }) {
  const router = useRouter();

  if (properties.length === 0) {
    return (
      <Card className="p-12 border-2 border-dashed border-muted text-center bg-transparent">
        <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-primary">No properties yet</h3>
        <p className="text-muted-foreground mt-2">Start by adding your first property to the portfolio.</p>
        <Button className="mt-6 bg-primary rounded-xl font-bold">Add Property</Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {properties?.map((property: any) => {
        const totalUnits = property.units?.length || 0;
        const occupiedUnits = property.units?.filter((u: any) => u.status === "OCCUPIED").length || 0;
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
        const monthlyRevenue = property.units?.reduce((acc: number, u: any) => {
          const rent = u.tenancies?.find((t: any) => t.status === "ACTIVE")?.monthlyRent || 0;
          return acc + rent;
        }, 0) || 0;

        return (
          <Card key={property.id} className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-[2rem] overflow-hidden group cursor-pointer" onClick={() => router.push(`/dashboard/properties/${property.id}`)}>
            <div className="flex flex-col sm:flex-row h-full">
              <div className="sm:w-1/3 relative h-48 sm:h-auto overflow-hidden">
                <img 
                  src={property.photoUrl || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=600&fit=crop"} 
                  alt={property.address} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-primary border-none backdrop-blur-md font-bold shadow-sm">
                    {property.type}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Address</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mt-2 -mr-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <h2 className="text-xl font-bold text-primary group-hover:text-primary/70 transition-colors">{property.address}</h2>
                  
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Home className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Total Units</span>
                      </div>
                      <p className="text-lg font-bold text-primary">{totalUnits}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-2 text-muted-foreground justify-end">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Est. Revenue</span>
                      </div>
                      <p className="text-lg font-bold text-primary">KES {(monthlyRevenue/1000).toFixed(1)}k</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-muted-foreground">Occupancy Rate</span>
                      <span className={cn(occupancyRate > 80 ? "text-success" : "text-amber-500")}>{occupancyRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={occupancyRate} className="h-1.5 bg-muted" />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {property.units.slice(0, 3).map((unit: any, i: number) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-primary">
                        {unit.unitNumber}
                      </div>
                    ))}
                    {totalUnits > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[8px] font-bold">
                        +{totalUnits - 3}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" className="text-primary font-bold group-hover:translate-x-2 transition-transform">
                    Enter <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
