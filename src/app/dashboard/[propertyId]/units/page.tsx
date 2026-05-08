import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UnitList } from "@/components/units/UnitList";

export default async function PropertyUnitsPage({ params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
    include: {
      units: {
        include: {
          tenancies: {
            where: { status: "ACTIVE" },
            include: { tenant: true }
          }
        },
        orderBy: { unitNumber: "asc" }
      }
    }
  });

  if (!property || property.landlordId !== session.user.id) {
    redirect("/dashboard");
  }

  // Cast units to match expected interface if necessary, though prisma types should be close
  const units = property.units.map(unit => ({
    ...unit,
    tenancies: unit.tenancies || []
  }));

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <UnitList units={units as any} propertyId={params.propertyId} />
    </div>
  );
}
