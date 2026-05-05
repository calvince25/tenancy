"use client";

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
  Plus
} from "lucide-react";
import Link from "next/link";

export function LandlordDashboard({ user }: { user: any }) {
  const totalProperties = user.properties.length;
  const activeTenants = user.properties.filter((p: any) => p.tenancies.length > 0).length;
  
  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-primary">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">Here's what's happening across your properties.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Property</span>
        </Button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
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
        <Card className="border-none shadow-sm bg-white">
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
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Collected (May)</p>
                <p className="text-2xl font-bold">KES 0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif text-primary">Priority Alerts</h2>
        <div className="grid gap-4">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-2 bg-amber-500 rounded-full text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-900">Rent Payment Pending</p>
              <p className="text-sm text-amber-700">You have 0 pending payment claims to verify.</p>
            </div>
            <Button variant="ghost" size="sm" className="text-amber-700 font-medium">View all</Button>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
            <div className="p-2 bg-blue-500 rounded-full text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">Maintenance Requests</p>
              <p className="text-sm text-blue-700">No new repair reports submitted today.</p>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-700 font-medium">Manage</Button>
          </div>
        </div>
      </section>

      {/* Property Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-primary">Your Properties</h2>
          <Link href="/dashboard/properties" className="text-sm text-accent hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.properties.map((property: any) => (
            <Card key={property.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
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
                    {property.tenancies[0] ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                          {property.tenancies[0].tenant.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{property.tenancies[0].tenant.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No tenant assigned</span>
                    )}
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
