import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LandlordDashboard } from "@/components/dashboard/landlord-dashboard";
import { TenantDashboard } from "@/components/dashboard/tenant-dashboard";

export default async function DashboardPage() {
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
            include: { tenant: true }
          }
        }
      },
      tenantTenancies: {
        where: { status: "ACTIVE" },
        include: {
          property: true,
          landlord: true,
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Redirect to onboarding if no property/tenancy
  if (user.role === "LANDLORD" && user.properties.length === 0) {
    redirect("/onboarding");
  }

  if (user.role === "TENANT" && user.tenantTenancies.length === 0) {
    redirect("/onboarding");
  }

  if (user.role === "LANDLORD") {
    return <LandlordDashboard user={user} />;
  } else {
    const activeTenancy = user.tenantTenancies[0];
    return <TenantDashboard user={user} tenancy={activeTenancy} />;
  }
}
