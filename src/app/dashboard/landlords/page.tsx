import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LandlordApprovalList } from "@/components/admin/landlord-approval-list";

export default async function LandlordsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isDefault) {
    redirect("/dashboard");
  }

  const landlords = await prisma.user.findMany({
    where: { 
      role: "LANDLORD",
      isDefault: false 
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-serif text-primary">Landlord Approvals</h1>
        <p className="text-muted-foreground">Manage registration requests from other landlords.</p>
      </header>

      <LandlordApprovalList initialLandlords={landlords} />
    </div>
  );
}
