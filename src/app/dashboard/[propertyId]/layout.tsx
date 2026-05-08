import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { LandlordNav } from "@/components/layout/landlord-nav";

export default async function PropertyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { propertyId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
    select: { address: true, landlordId: true }
  });

  if (!property || property.landlordId !== session.user.id) {
    notFound();
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <LandlordNav />

      {/* Main Content Area */}
      <main className="flex-1 md:pl-72 flex flex-col min-h-screen">
        {/* Sticky Header Banner */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Managing Property</p>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{property.address}</h2>
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-4 md:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
