"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Receipt, 
  Droplets, 
  MessageSquare, 
  User, 
  LogOut, 
  ShieldCheck 
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

export function LandlordNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isDefault = session?.user?.role === "LANDLORD" && (session.user as any).isDefault;

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Properties", href: "/dashboard/properties", icon: Building2 },
    { label: "Tenants", href: "/dashboard/tenants", icon: Users },
    { label: "Payments", href: "/dashboard/payments", icon: Receipt },
    { label: "Water Bills", href: "/dashboard/water", icon: Droplets },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  ];

  if (isDefault) {
    items.push({ label: "Approvals", href: "/dashboard/landlords", icon: ShieldCheck });
  }

  items.push({ label: "Account", href: "/dashboard/account", icon: User });

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed left-0 top-0 z-40">
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-serif text-primary font-bold">NestSync</h1>
          {isDefault && <Badge variant="secondary" className="mt-2 bg-primary/5 text-primary border-none text-[10px]">ADMIN</Badge>}
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                pathname === item.href
                  ? "bg-primary/5 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-primary"
              )}
            >
              <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-primary" : "text-muted-foreground")} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-muted/50">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-muted z-50 flex justify-around items-center h-20 px-2 overflow-x-auto">
        {items.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-colors",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-tight">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
