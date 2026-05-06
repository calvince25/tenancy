import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PropertiesList } from "@/components/properties/properties-list";
import { Button } from "@/components/ui/button";
import { Plus, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const properties = await prisma.property.findMany({
    where: { landlordId: session.user.id },
    include: {
      units: {
        include: {
          tenancies: {
            where: { status: "ACTIVE" },
            include: { tenant: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Properties & Units</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage your entire real estate portfolio and track unit status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-muted-foreground/10 font-bold gap-2 h-11 px-6">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Property
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search properties by name or address..." 
            className="pl-10 h-12 rounded-xl border-muted-foreground/10 bg-white focus:ring-primary shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 rounded-xl border-muted-foreground/10 bg-white px-6 font-bold">Type: All</Button>
          <Button variant="outline" className="h-12 rounded-xl border-muted-foreground/10 bg-white px-6 font-bold">Status: All</Button>
        </div>
      </div>

      <PropertiesList properties={properties} />
    </div>
  );
}
