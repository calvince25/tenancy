import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LandlordNav } from "@/components/layout/landlord-nav";
import { TenantNav } from "@/components/layout/tenant-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {session.user.role === "LANDLORD" ? (
        <div className="flex w-full flex-col md:flex-row">
          <LandlordNav />
          <main className="flex-1 pb-20 md:pb-0 md:pl-64">
            {children}
          </main>
        </div>
      ) : (
        <div className="flex w-full flex-col">
          <main className="flex-1 pb-20">
            {children}
          </main>
          <TenantNav />
        </div>
      )}
    </div>
  );
}
