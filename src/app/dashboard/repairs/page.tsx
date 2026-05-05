import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RepairList } from "@/components/repairs/repair-list";

export default async function RepairsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      properties: {
        include: {
          tenancies: {
            where: { status: "ACTIVE" },
            include: { tenant: true, landlord: true, repairReports: { include: { comments: true }, orderBy: { submittedAt: "desc" } } }
          }
        }
      },
      tenantTenancies: {
        where: { status: "ACTIVE" },
        include: {
          property: true,
          landlord: true,
          tenant: true,
          repairReports: { include: { comments: true }, orderBy: { submittedAt: "desc" } }
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  let activeTenancy = null;
  let reports: any[] = [];

  if (user.role === "LANDLORD") {
    const allTenancies = user.properties.flatMap((p: any) => p.tenancies);
    activeTenancy = allTenancies[0];
    reports = allTenancies.flatMap((t: any) => t.repairReports);
  } else {
    activeTenancy = user.tenantTenancies[0];
    reports = activeTenancy?.repairReports || [];
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-primary">Repairs</h1>
          <p className="text-muted-foreground">Report and track maintenance issues.</p>
        </div>
      </header>

      <RepairList 
        reports={reports} 
        userRole={user.role} 
        tenancyId={activeTenancy?.id} 
      />
    </div>
  );
}
