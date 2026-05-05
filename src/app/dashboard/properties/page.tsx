import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PropertiesList } from "@/components/properties/properties-list";

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "LANDLORD") {
    redirect("/dashboard");
  }

  const properties = await prisma.property.findMany({
    where: { landlordId: session.user.id },
    include: {
      tenancies: {
        where: { status: "ACTIVE" },
        include: { tenant: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">Your Properties</h1>
          <p className="text-muted-foreground">Manage your units and tenant invites.</p>
        </div>
        {/* Placeholder for Add Property dialog - similar to onboarding form */}
      </header>

      <PropertiesList properties={properties} />
    </div>
  );
}
