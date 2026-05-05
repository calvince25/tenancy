"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Building2, MessageSquare, User, LogOut, ShieldCheck } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function LandlordNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isDefault = session?.user?.isDefault;

  const baseItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Properties", href: "/dashboard/properties", icon: Building2 },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  ];

  if (isDefault) {
    baseItems.push({ label: "Approvals", href: "/dashboard/landlords", icon: ShieldCheck });
  }

  const items = [...baseItems, { label: "Account", href: "/dashboard/account", icon: User }];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white h-screen fixed left-0 top-0 z-40">
        <div className="p-8">
          <h1 className="text-2xl font-serif">NestSync</h1>
          {isDefault && <Badge variant="secondary" className="mt-2 bg-white/10 text-white border-none text-[10px]">ADMIN</Badge>}
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-muted z-50 flex justify-around items-center h-20 px-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
              pathname === item.href ? "text-accent" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] uppercase font-medium tracking-wider">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

import { Badge } from "@/components/ui/badge";
