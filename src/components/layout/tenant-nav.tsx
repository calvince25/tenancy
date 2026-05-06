"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Wallet, Wrench, MessageSquare, User } from "lucide-react";

const items = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Pay Rent", href: "/dashboard/payments", icon: Wallet },
  { label: "Reports", href: "/dashboard/repairs", icon: Wrench },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Account", href: "/dashboard/account", icon: User },
];

export function TenantNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-muted z-50 flex justify-around items-center h-20 px-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          <item.icon className={cn("w-6 h-6", pathname === item.href && "text-primary")} />
          <span className="text-[10px] uppercase font-bold tracking-tight text-center">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
