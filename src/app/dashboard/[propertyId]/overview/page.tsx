import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PropertyOverviewHub } from "@/components/dashboard/PropertyOverviewHub";

export default async function PropertyOverviewPage({ params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const property = await prisma.property.findUnique({
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
  });

  if (!property || property.landlordId !== session.user.id) {
    redirect("/dashboard");
  }

  return <PropertyOverviewHub property={JSON.parse(JSON.stringify(property))} />;
}
