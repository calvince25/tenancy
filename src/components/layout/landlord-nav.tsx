"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Droplets, 
  Wrench, 
  BarChart3, 
  Settings,
  LogOut,
  Bell
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LandlordNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Properties & Units", href: "/dashboard/properties", icon: Building2 },
    { label: "Tenants", href: "/dashboard/tenants", icon: Users },
    { label: "Payments & Rent", href: "/dashboard/payments", icon: CreditCard },
    { label: "Water Bills", href: "/dashboard/water", icon: Droplets },
    { label: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
    { label: "Revenue Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r h-screen fixed left-0 top-0 z-40 shadow-sm">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
            R
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary">Renzo</span>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "active-nav-gradient text-primary font-semibold shadow-sm border border-primary/10"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-primary"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-muted/50 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "LL"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-primary truncate">{session?.user?.name || "Landlord"}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Administrator</span>
            </div>
          </div>
          
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-muted z-50 flex justify-around items-center h-20 px-2 shadow-lg">
        {items.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-all duration-200",
                isActive ? "text-primary scale-110" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[9px] uppercase font-bold tracking-tight">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
