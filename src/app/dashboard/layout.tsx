import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LandlordNav } from "@/components/layout/landlord-nav";

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
      <div className="flex w-full flex-col md:flex-row">
        <LandlordNav />
        <main className="flex-1 pb-20 md:pb-0 md:pl-72 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
