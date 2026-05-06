"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  ChevronRight,
  Plus,
  ArrowLeft,
  Droplets,
  Receipt,
  LayoutDashboard,
  Trash2,
  ArrowUpRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { UnitManagement } from "./unit-management";
import { PropertyForm } from "./property-form";
import { RevenueChart } from "./revenue-chart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LandlordDashboard({ user: initialUser }: { user: any }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "PROPERTY_DETAIL">("DASHBOARD");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  const totalProperties = user.properties.length;
  const activeTenants = user.properties.reduce((acc: number, p: any) => acc + p.tenancies.length, 0);

  const revenueData = [
    { month: "Jan", amount: 45000 },
    { month: "Feb", amount: 52000 },
    { month: "Mar", amount: 48000 },
    { month: "Apr", amount: 61000 },
    { month: "May", amount: 59000 },
    { month: "Jun", amount: 0 },
    { month: "Jul", amount: 0 },
    { month: "Aug", amount: 0 },
    { month: "Sep", amount: 0 },
    { month: "Oct", amount: 0 },
    { month: "Nov", amount: 0 },
    { month: "Dec", amount: 0 },
  ];

  const navigateToProperty = (property: any) => {
    setSelectedProperty(property);
    setActiveTab("PROPERTY_DETAIL");
  };

  async function handleDeleteProperty(id: string) {
    if (!confirm("Are you sure you want to delete this property? All units and records will be lost.")) return;
    try {
      const res = await fetch(`/api/properties?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Property deleted");
        window.location.reload();
      } else {
        toast.error("Failed to delete property");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  const renderContent = () => {
    if (activeTab === "PROPERTY_DETAIL" && selectedProperty) {
      return (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setActiveTab("DASHBOARD")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive border-destructive/20 hover:bg-destructive/5 gap-2"
                onClick={() => handleDeleteProperty(selectedProperty.id)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
              <Button 
                size="sm" 
                className="gap-2"
                onClick={() => {
                  setEditingProperty(selectedProperty);
                  setIsPropertyModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" /> Edit
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-1/3 space-y-6">
              <Card className="overflow-hidden border-none shadow-sm bg-white">
                <div className="h-48 bg-muted relative group">
                  {selectedProperty.photoUrl ? (
                    <img src={selectedProperty.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/10 bg-gradient-to-br from-primary/5 to-primary/20">
                      <Building2 className="w-24 h-24" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl font-bold">{selectedProperty.address}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-primary/5 text-primary border-none font-bold">{selectedProperty.type}</Badge>
                    <Badge variant="outline" className="font-bold">{selectedProperty.tenancies.length} Units</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Invite Code</p>
                    <p className="text-3xl font-mono font-bold text-primary tracking-widest">{selectedProperty.inviteCode}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
                      <Building2 className="w-4 h-4" /> Property Gallery
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-square bg-muted rounded-xl overflow-hidden border border-muted-foreground/10 relative group">
                          <img 
                            src={`https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop`} 
                            alt="" 
                            className="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all cursor-pointer" 
                          />
                        </div>
                      ))}
                      <button className="aspect-square bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center hover:bg-muted hover:border-primary/40 transition-all group">
                        <Plus className="w-6 h-6 text-muted-foreground/30 group-hover:text-primary/40" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="w-full lg:w-2/3">
              <UnitManagement propertyId={selectedProperty.id} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-primary font-bold">Landlord Center</h1>
            <p className="text-muted-foreground">Premium property management at your fingertips.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 h-12 px-6 border-muted-foreground/20 font-bold" onClick={() => router.push("/dashboard/payments")}>
              <Receipt className="w-4 h-4" />
              Payments
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-12 px-6 font-bold shadow-lg shadow-primary/20" onClick={() => setIsPropertyModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer group"
            onClick={() => router.push("/dashboard/properties")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/20" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Properties</p>
                <p className="text-3xl font-bold text-primary">{totalProperties}</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer group"
            onClick={() => router.push("/dashboard/tenants")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-success/5 rounded-xl text-success group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/20" />
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Active Tenants</p>
                <p className="text-3xl font-bold text-success">{activeTenants}</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer group col-span-1 lg:col-span-2"
            onClick={() => router.push("/dashboard/payments")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                  <Receipt className="w-4 h-4" /> Revenue Trend
                </p>
                <Badge className="bg-primary/5 text-primary border-none font-bold">2026</Badge>
              </div>
              <RevenueChart data={revenueData} />
            </CardContent>
          </Card>
        </div>

        {/* Property Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-primary font-bold">Quick Access</h2>
            <Button variant="link" className="text-primary font-bold" onClick={() => router.push("/dashboard/properties")}>
              View All Properties
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {user.properties.map((property: any) => (
              <Card 
                key={property.id} 
                className="border-none shadow-sm hover:shadow-2xl transition-all bg-white overflow-hidden group cursor-pointer hover:-translate-y-1"
                onClick={() => navigateToProperty(property)}
              >
                <div className="h-48 bg-muted relative overflow-hidden">
                  {property.photoUrl ? (
                    <img src={property.photoUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/5 bg-gradient-to-br from-primary/5 to-primary/10">
                      <Building2 className="w-20 h-20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className={cn(
                      "border-none px-4 py-1 font-bold shadow-sm",
                      property.tenancies.length > 0 ? "bg-success text-white" : "bg-white text-muted-foreground"
                    )}>
                      {property.tenancies.length > 0 ? "Occupied" : "Vacant"}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-5 left-5 text-white z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">{property.type}</p>
                    <h3 className="text-xl font-serif font-bold leading-tight">{property.address}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-background/50">
      <main className="max-w-7xl mx-auto">
        {renderContent()}
      </main>

      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg">
            <PropertyForm 
              initialData={editingProperty}
              onClose={() => {
                setIsPropertyModalOpen(false);
                setEditingProperty(null);
              }}
              onSuccess={() => window.location.reload()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
