import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TenantTable } from "@/components/tenants/tenant-table";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function TenantsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const tenancies = await prisma.tenancy.findMany({
    where: { landlordId: session.user.id, status: "ACTIVE" },
    include: {
      tenant: true,
      unit: true,
      property: true,
      payments: {
        orderBy: { submittedAt: "desc" },
        take: 1
      },
      waterBills: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Tenants Portfolio</h1>
          <p className="text-muted-foreground mt-1 font-medium">Detailed directory of all residents across your properties.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-muted-foreground/10 font-bold gap-2 h-11 px-6">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <UserPlus className="w-4 h-4" /> Add New Tenant
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, phone, or unit number..." 
            className="pl-10 h-12 rounded-xl border-muted-foreground/10 bg-white focus:ring-primary shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 rounded-xl border-muted-foreground/10 bg-white px-6 font-bold gap-2">
            <Filter className="w-4 h-4" /> Status: All
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-muted/40 overflow-hidden">
        <TenantTable tenancies={tenancies} />
      </div>
    </div>
  );
}
