"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Wallet, 
  AlertCircle, 
  Wrench, 
  ChevronRight,
  Plus,
  ArrowLeft,
  Droplets,
  Receipt,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { UnitManagement } from "./unit-management";
import { WaterBillManagement } from "./water-bill-management";
import { PaymentRecording } from "./payment-recording";

export function LandlordDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "PROPERTY_DETAIL" | "TENANTS" | "PAYMENTS" | "WATER">("DASHBOARD");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedTenancy, setSelectedTenancy] = useState<any>(null);

  const totalProperties = user.properties.length;
  const activeTenants = user.properties.filter((p: any) => p.tenancies.length > 0).length;

  const navigateToProperty = (property: any) => {
    setSelectedProperty(property);
    setActiveTab("PROPERTY_DETAIL");
  };

  const navigateToWater = (tenancy: any) => {
    setSelectedTenancy(tenancy);
    setActiveTab("WATER");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "PROPERTY_DETAIL":
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <Button variant="ghost" onClick={() => setActiveTab("DASHBOARD")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/3">
                <Card className="overflow-hidden">
                  <div className="h-48 bg-muted">
                    {selectedProperty.photoUrl ? (
                      <img src={selectedProperty.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <Building2 className="w-24 h-24" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="font-serif">{selectedProperty.address}</CardTitle>
                    <Badge className="w-fit">{selectedProperty.type}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Invite Code</p>
                      <p className="text-2xl font-mono font-bold text-primary tracking-widest">{selectedProperty.inviteCode}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">Share this code with tenants to join this property.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="w-full md:w-2/3">
                <UnitManagement propertyId={selectedProperty.id} />
              </div>
            </div>
          </div>
        );

      case "WATER":
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <Button variant="ghost" onClick={() => setActiveTab("PROPERTY_DETAIL")} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Property
            </Button>
            <WaterBillManagement 
              tenancyId={selectedTenancy.id} 
              unitNumber={selectedTenancy.unit?.unitNumber || "N/A"} 
            />
          </div>
        );

      default:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif text-primary">Welcome, {user.name}</h1>
                <p className="text-muted-foreground">Manage your properties and tenants with ease.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Receipt className="w-4 h-4" />
                  Payments
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Add Property
                </Button>
              </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm bg-white hover:bg-blue-50/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Properties</p>
                      <p className="text-2xl font-bold">{totalProperties}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white hover:bg-blue-50/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-success/10 rounded-xl text-success">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Active Tenants</p>
                      <p className="text-2xl font-bold">{activeTenants}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white hover:bg-blue-50/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Water Bills Due</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Property Cards */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif text-primary">Your Properties</h2>
                <Link href="/dashboard/properties" className="text-sm text-accent hover:underline">View all</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.properties.map((property: any) => (
                  <Card 
                    key={property.id} 
                    className="border-none shadow-sm hover:shadow-md transition-all bg-white overflow-hidden group cursor-pointer hover:-translate-y-1"
                    onClick={() => navigateToProperty(property)}
                  >
                    <div className="h-40 bg-muted relative">
                      {property.photoUrl ? (
                        <img src={property.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                          <Building2 className="w-16 h-16" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge className={cn(
                          "border-none px-3 py-1",
                          property.tenancies.length > 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        )}>
                          {property.tenancies.length > 0 ? "Occupied" : "Vacant"}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-lg leading-tight group-hover:text-accent transition-colors">
                        {property.address}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">{property.type.toLowerCase()}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {property.tenancies.length} Tenants
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {renderContent()}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

