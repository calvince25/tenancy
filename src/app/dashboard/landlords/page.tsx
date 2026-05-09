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
      role: "LANDLORD"
    },
    orderBy: { isDefault: "desc" }
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">User Management</h1>
        <p className="text-slate-500 font-medium italic">Manage administrators and system access for your portfolio.</p>
      </header>

      <LandlordApprovalList 
        initialLandlords={landlords} 
        currentUserId={session.user.id}
      />
    </div>
  );
}
