"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start gap-3 text-destructive hover:bg-destructive/5 h-12"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="w-5 h-5" />
      <span>Log out from all devices</span>
    </Button>
  );
}
