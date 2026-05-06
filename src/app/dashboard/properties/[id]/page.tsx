import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { UnitList } from "@/components/properties/unit-list";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  MoreVertical,
  Calendar,
  Home,
  TrendingUp,
  Users
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const property = await prisma.property.findUnique({
    where: { id: params.id },
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

  if (!property) {
    notFound();
  }

  const totalUnits = property.units.length;
  const occupiedUnits = property.units.filter((u: any) => u.status === "OCCUPIED").length;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/properties">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">{property.address}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge className="bg-primary/5 text-primary border-none font-bold uppercase text-[10px] tracking-widest">{property.type}</Badge>
              <span className="text-muted-foreground text-sm flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3" /> Property ID: {property.id.substring(0, 8)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-muted-foreground/10 font-bold gap-2 h-11 px-6">
            <MoreVertical className="w-4 h-4" /> Options
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Unit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-muted/40">
            <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-muted">
               <img 
                  src={property.photoUrl || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=600&fit=crop"} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
            </div>
            
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Units</p>
                    <p className="text-2xl font-bold text-primary">{totalUnits}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                    <Home className="w-6 h-6" />
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Occupancy</p>
                    <p className="text-2xl font-bold text-success">{occupancyRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-success/5 rounded-xl flex items-center justify-center text-success">
                    <Users className="w-6 h-6" />
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revenue Impact</p>
                    <p className="text-2xl font-bold text-secondary">High</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/5 rounded-xl flex items-center justify-center text-secondary">
                    <TrendingUp className="w-6 h-6" />
                  </div>
               </div>
            </div>

            <div className="h-px bg-muted my-8" />

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Property Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Built Year</span>
                  <span className="font-bold">2020</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-bold">{property.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Landlord</span>
                  <span className="font-bold">{session.user.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-muted/40">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-primary">Unit Management</h2>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Manage assignments and status</p>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="outline" className="rounded-xl font-bold text-xs">Filter</Button>
                   <Button variant="outline" className="rounded-xl font-bold text-xs">Sort</Button>
                </div>
             </div>
             
             <UnitList units={property.units} propertyId={property.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
