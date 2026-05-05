import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PaymentHistory } from "@/components/payments/payment-history";
import { PaymentClaimForm } from "@/components/payments/payment-claim-form";

export default async function PaymentsPage() {
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
            include: { tenant: true, landlord: true, payments: { orderBy: { submittedAt: "desc" } } }
          }
        }
      },
      tenantTenancies: {
        where: { status: "ACTIVE" },
        include: {
          property: true,
          landlord: true,
          tenant: true,
          payments: { orderBy: { submittedAt: "desc" } }
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  let activeTenancy = null;
  let payments: any[] = [];

  if (user.role === "LANDLORD") {
    const allTenancies = user.properties.flatMap((p: any) => p.tenancies);
    activeTenancy = allTenancies[0];
    payments = allTenancies.flatMap((t: any) => t.payments);
  } else {
    activeTenancy = user.tenantTenancies[0];
    payments = activeTenancy?.payments || [];
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary">Rent Payments</h1>
          <p className="text-muted-foreground">Track and manage your rent history.</p>
        </div>
        {user.role === "TENANT" && activeTenancy && (
          <PaymentClaimForm tenancy={activeTenancy} />
        )}
      </header>

      <PaymentHistory payments={payments} userRole={user.role} />
    </div>
  );
}
