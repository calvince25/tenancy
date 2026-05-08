import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings, Save, Trash2, Shield, Bell, CreditCard } from "lucide-react";

export default async function PropertySettingsPage({ params }: { params: { propertyId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const property = await prisma.property.findUnique({
    where: { id: params.propertyId },
    select: { address: true, type: true, landlordId: true }
  });

  if (!property || property.landlordId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-32">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Property Settings</h1>
        <p className="text-muted-foreground mt-1 font-medium">Configure preferences and details for {property.address}.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* General Settings */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> General Configuration
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Property Name</label>
                <input 
                  defaultValue={property.address}
                  className="w-full h-12 px-5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Property Type</label>
                <select 
                  defaultValue={property.type}
                  className="w-full h-12 px-5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700 appearance-none"
                >
                   <option value="APARTMENT">Apartment</option>
                   <option value="HOUSE">House</option>
                   <option value="ROOM">Room</option>
                   <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 px-8 h-12 shadow-lg shadow-primary/20">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </div>

        {/* Billing Settings */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-secondary" /> Billing & Payments
            </h3>
          </div>
          <div className="p-8 space-y-6">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Bell className="w-5 h-5 text-slate-400" />
                   </div>
                   <div>
                      <p className="font-bold text-slate-800">Payment Reminders</p>
                      <p className="text-xs text-slate-500">Send automatic SMS/Email to tenants on due date.</p>
                   </div>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
             </div>
             
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Shield className="w-5 h-5 text-slate-400" />
                   </div>
                   <div>
                      <p className="font-bold text-slate-800">Auto-Generate Water Bills</p>
                      <p className="text-xs text-slate-500">Automatically create invoices after reading is logged.</p>
                   </div>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                   <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
             </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-[2rem] border border-red-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-red-50 bg-red-50/30">
            <h3 className="font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Danger Zone
            </h3>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
             <div>
                <p className="font-bold text-slate-900">Delete this property</p>
                <p className="text-sm text-slate-500 max-w-md">Once you delete a property, there is no going back. Please be certain.</p>
             </div>
             <Button variant="destructive" className="rounded-xl font-bold px-8 h-12 shadow-lg shadow-red-200">
                Delete Property
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
