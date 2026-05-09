import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PropertyList } from "@/components/dashboard/property-list";

export default async function LandlordDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true }
  });

  const properties = await prisma.property.findMany({
    where: { landlordId: session.user.id },
    include: {
      units: { select: { id: true } },
      tenancies: {
        where: { status: "ACTIVE" },
        select: { id: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Serialize for client component (remove non-serializable types)
  const serialized = properties.map(p => ({
    id: p.id,
    address: p.address,
    type: p.type,
    photoUrl: p.photoUrl ?? null,
    units: p.units,
    tenancies: p.tenancies,
  }));

  return (
    <PropertyList
      properties={serialized}
      landlordName={user?.name ?? "Landlord"}
      isAdmin={session.user.isDefault}
    />
  );
}
