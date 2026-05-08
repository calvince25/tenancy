"use client";

import { usePathname } from "next/navigation";
import { LandlordNav } from "@/components/layout/landlord-nav";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Layer 2 is exactly /dashboard. Layer 3 is /dashboard/[propertyId]
  const isLayer2 = pathname === "/dashboard";

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex w-full flex-col md:flex-row">
        {!isLayer2 && <LandlordNav />}
        <main 
          className={cn(
            "flex-1 pb-20 md:pb-0 transition-all duration-300",
            !isLayer2 ? "md:pl-72" : "md:pl-0"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
