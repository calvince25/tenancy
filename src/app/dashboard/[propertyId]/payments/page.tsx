import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function PropertyPaymentsPage({ params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
    select: { address: true, landlordId: true }
  });

  if (!property || property.landlordId !== session.user.id) {
    redirect("/dashboard");
  }

  const tenancies = await prisma.tenancy.findMany({
    where: { propertyId: params.propertyId, status: "ACTIVE" },
    include: {
      tenant: true,
      unit: true,
      payments: {
        orderBy: { submittedAt: "desc" }
      }
    }
  });

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      <PaymentManager 
        tenancies={JSON.parse(JSON.stringify(tenancies))}
        propertyId={params.propertyId}
        propertyName={property.address || "this property"}
      />
    </div>
  );
}

import { PaymentManager } from "@/components/payments/PaymentManager";
