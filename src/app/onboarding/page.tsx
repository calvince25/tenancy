import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      properties: true,
      landlordTenancies: true,
      tenantTenancies: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.role === "LANDLORD") {
    if (user.properties.length > 0) {
      redirect("/dashboard");
    }
    return redirect("/onboarding/landlord");
  } else {
    if (user.tenantTenancies.length > 0) {
      redirect("/dashboard");
    }
    return redirect("/onboarding/tenant");
  }
}
