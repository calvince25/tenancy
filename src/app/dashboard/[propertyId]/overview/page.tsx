import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LandlordDashboard } from "@/components/dashboard/landlord-dashboard";
import { redirect } from "next/navigation";

export default async function PropertyOverviewPage({ params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      properties: {
        where: { id: params.propertyId },
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

  if (!user || user.properties.length === 0) {
    redirect("/dashboard");
  }

  return <LandlordDashboard user={user} propertyId={params.propertyId} />;
}
