import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LandlordDashboard } from "@/components/dashboard/landlord-dashboard";

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
          units: {
            include: {
              tenancies: {
                where: { status: "ACTIVE" },
                include: { 
                  tenant: true,
                  payments: true,
                  waterBills: true,
                  repairReports: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Redirect to onboarding if no property exists yet
  if (user.properties.length === 0) {
    redirect("/onboarding/landlord");
  }

  return <LandlordDashboard user={user} />;
}
