"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Droplets, 
  Wrench, 
  Settings,
  LogOut,
  ChevronLeft,
  Home,
  Layers,
  FileText
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LandlordNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Detect if we're inside a property-scoped route
  // Path format: /dashboard/[propertyId]/[section]
  const pathParts = pathname.split('/').filter(Boolean);
  const isPropertyScoped = pathParts.length >= 2 && pathParts[0] === 'dashboard' && pathParts[1] !== 'analytics' && pathParts[1] !== 'settings';
  const propertyId = isPropertyScoped ? pathParts[1] : null;

  const propertyItems = isPropertyScoped ? [
    { label: "Property & Units", href: `/dashboard/${propertyId}/overview`, icon: Building2 },
    { label: "Units", href: `/dashboard/${propertyId}/units`, icon: Layers },
    { label: "Tenants", href: `/dashboard/${propertyId}/tenants`, icon: Users },
    { label: "Payments & Rent", href: `/dashboard/${propertyId}/payments`, icon: CreditCard },
    { label: "Water Bills", href: `/dashboard/${propertyId}/water`, icon: Droplets },
    { label: "Maintenance", href: `/dashboard/${propertyId}/maintenance`, icon: Wrench },
    { label: "Settings", href: `/dashboard/${propertyId}/settings`, icon: Settings },
  ] : [];

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== `/dashboard/${propertyId}` && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 flex-shrink-0 bg-[#0F172A] text-white min-h-screen border-r border-white/5 shadow-2xl sticky top-0">
        {/* Logo */}
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0F172A] font-black text-xl shadow-xl shadow-white/10">
            R
          </div>
          <span className="text-2xl font-black tracking-tight text-white">Renzo</span>
        </div>

        {/* Back Button / Context */}
        <div className="px-4 mb-6">
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
          >
            <ChevronLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Portfolio</p>
              <p className="text-xs font-bold text-white truncate">Back to List</p>
            </div>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-4 mb-4">Management Dashboard</p>
          {propertyItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative",
                  active
                    ? "bg-white/10 text-white font-bold"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform duration-500", active ? "text-white" : "group-hover:scale-110")} />
                <span className="text-sm tracking-tight">{item.label}</span>
                {active && (
                  <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <Avatar className="h-10 w-10 border-2 border-white/10">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
              <AvatarFallback className="bg-white/10 text-white font-bold">
                {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "LL"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden flex-1">
              <span className="text-sm font-bold text-white truncate">{session?.user?.name || "Landlord"}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Landlord</span>
            </div>
          </div>
          
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-white/5 z-50 flex justify-around items-center h-20 px-2 shadow-2xl overflow-x-auto no-scrollbar">
        {propertyItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[70px] h-full transition-all duration-300",
                active ? "text-white scale-110 font-bold" : "text-white/40"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[8px] uppercase font-black tracking-tighter text-center">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
