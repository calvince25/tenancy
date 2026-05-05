import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, Shield, LogOut } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-serif text-primary">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and security.</p>
      </header>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 pb-6">
          <Avatar className="h-16 w-16 border-4 border-muted">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-serif">
              {session.user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-serif text-2xl">{session.user.name}</CardTitle>
            <CardDescription>{session.user.role.toLowerCase()}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Email</p>
              <p className="font-medium">{session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl text-muted-foreground italic">
            <Shield className="w-5 h-5" />
            <p className="text-sm">Two-factor authentication is disabled</p>
          </div>
          
          <div className="pt-4">
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
