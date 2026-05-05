"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Wrench, 
  MessageSquare, 
  FileText,
  ChevronRight,
  ArrowUpRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function TenantDashboard({ user, tenancy }: { user: any, tenancy: any }) {
  const isRentPaid = false; // Placeholder logic
  const isRentDueSoon = true; // Placeholder logic
  
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-serif text-primary">Home</h1>
        <p className="text-muted-foreground">{tenancy.property.address}</p>
      </header>

      {/* Rent Card */}
      <Card className={cn(
        "border-none shadow-md overflow-hidden transition-colors",
        isRentPaid ? "bg-success/5" : isRentDueSoon ? "bg-amber-50" : "bg-destructive/5"
      )}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={cn(
              "p-4 rounded-full",
              isRentPaid ? "bg-success/20 text-success" : isRentDueSoon ? "bg-amber-100 text-amber-600" : "bg-destructive/20 text-destructive"
            )}>
              {isRentPaid ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-widest font-semibold text-muted-foreground">
                {isRentPaid ? "All paid up" : "Rent due soon"}
              </p>
              <p className="text-4xl font-bold">KES {tenancy.monthlyRent.toLocaleString()}</p>
              <p className="text-muted-foreground">Due on May {tenancy.rentDueDay}, 2026</p>
            </div>

            <div className="w-full max-w-xs pt-4">
              {isRentPaid ? (
                <Button variant="outline" className="w-full bg-white h-12 flex gap-2">
                  <FileText className="w-4 h-4" />
                  View Receipt
                </Button>
              ) : (
                <Link href="/dashboard/payments">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white h-12 flex gap-2">
                    <Wallet className="w-4 h-4" />
                    Pay Rent Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Repairs */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="font-serif text-lg">Active Repairs</CardTitle>
            <Wrench className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">No active repair reports.</p>
            <Button variant="outline" className="w-full justify-between group">
              <span>Report a problem</span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </Button>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="font-serif text-lg">Messages</CardTitle>
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {tenancy.landlord.name?.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium">{tenancy.landlord.name}</p>
                <p className="text-xs text-muted-foreground truncate">Welcome to NestSync! Let me know if you need anything.</p>
              </div>
            </div>
            <Link href="/dashboard/messages">
              <Button variant="outline" className="w-full">Open Messages</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "My Lease", icon: FileText, href: "#" },
          { label: "History", icon: Clock, href: "#" },
          { label: "Contact", icon: User, href: "#" },
          { label: "Help", icon: AlertCircle, href: "#" },
        ].map((link) => (
          <Link key={link.label} href={link.href}>
            <div className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-2 text-center group">
              <link.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
              <span className="text-xs font-medium">{link.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
