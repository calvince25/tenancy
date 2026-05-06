import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  CreditCard, 
  HelpCircle,
  Mail,
  Phone,
  Camera,
  Globe,
  Settings as SettingsIcon,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage your professional profile and property preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-3 bg-primary/5 text-primary font-bold rounded-xl h-12">
               <User className="w-4 h-4" /> Profile Details
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/5 font-bold rounded-xl h-12">
               <Building2 className="w-4 h-4" /> Property Defaults
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/5 font-bold rounded-xl h-12">
               <Bell className="w-4 h-4" /> Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/5 font-bold rounded-xl h-12">
               <Shield className="w-4 h-4" /> Security
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/5 font-bold rounded-xl h-12">
               <CreditCard className="w-4 h-4" /> Billing
            </Button>
         </div>

         <div className="lg:col-span-3 space-y-8">
            <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
               <CardContent className="p-8">
                  <div className="flex items-center gap-8 mb-10">
                     <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-md">
                           <AvatarImage src={user?.profilePhotoUrl || ""} />
                           <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                              {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
                           </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                           <Camera className="w-6 h-6 text-white" />
                        </div>
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-primary">{user?.name}</h3>
                        <p className="text-sm text-muted-foreground font-medium">Administrator Profile</p>
                        <div className="flex gap-2 mt-4">
                           <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-lg font-bold h-8 text-[10px] uppercase tracking-wider px-4">Change Photo</Button>
                           <Button size="sm" variant="outline" className="rounded-lg font-bold h-8 text-[10px] uppercase tracking-wider px-4 border-muted-foreground/10">Remove</Button>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                        <Input defaultValue={user?.name || ""} className="h-11 rounded-xl border-muted-foreground/10 bg-slate-50/50" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Professional Email</Label>
                        <Input defaultValue={user?.email || ""} className="h-11 rounded-xl border-muted-foreground/10 bg-slate-50/50" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                        <Input defaultValue={user?.phone || ""} className="h-11 rounded-xl border-muted-foreground/10 bg-slate-50/50" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Company Name</Label>
                        <Input placeholder="Optional" className="h-11 rounded-xl border-muted-foreground/10 bg-slate-50/50" />
                     </div>
                  </div>

                  <div className="mt-10 pt-10 border-t border-muted/30">
                     <h4 className="font-bold text-primary uppercase text-xs tracking-widest mb-6">Notification Preferences</h4>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-primary/10 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                                 <Mail className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-primary">Email Notifications</p>
                                 <p className="text-[10px] text-muted-foreground font-medium">Receive weekly summaries and urgent alerts</p>
                              </div>
                           </div>
                           <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-primary/10 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                                 <Globe className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-primary">System Updates</p>
                                 <p className="text-[10px] text-muted-foreground font-medium">Stay informed about new Renzo features</p>
                              </div>
                           </div>
                           <Switch />
                        </div>
                     </div>
                  </div>

                  <div className="mt-10 flex justify-end gap-3">
                     <Button variant="outline" className="rounded-xl font-bold h-11 px-8 border-muted-foreground/10">Discard Changes</Button>
                     <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold h-11 px-8 shadow-lg shadow-primary/20">Save Profile</Button>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
