"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Save, 
  Trash2, 
  Shield, 
  Bell, 
  CreditCard,
  Building2,
  Image as ImageIcon,
  AlertTriangle,
  RefreshCw,
  Copy,
  Camera,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PropertySettingsFormProps {
  property: any;
}

export function PropertySettingsForm({ property }: PropertySettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    address: property.address,
    type: property.type,
    photoUrl: property.photoUrl || "",
    waterRate: property.waterRate || 0,
    autoWaterBills: property.autoWaterBills || false,
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: property.id,
          ...formData,
          waterRate: parseFloat(formData.waterRate.toString()),
        }),
      });

      if (!res.ok) throw new Error("Failed to update settings");

      toast.success("Property settings updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you absolutely sure? This will delete all units, tenants, and history for this property.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/properties?id=${property.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete property");

      toast.success("Property deleted successfully");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Property Settings</h1>
        <p className="text-muted-foreground mt-1 font-medium italic">Configure preferences and details for {property.address}.</p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* General Settings */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> General Configuration
            </h3>
            <Badge variant="outline" className="rounded-lg font-bold text-[10px] text-slate-400">ID: {property.id}</Badge>
          </div>
          <form onSubmit={handleUpdate} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Property Name / Address</Label>
                <Input 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-bold text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Property Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="APARTMENT">Apartment</SelectItem>
                    <SelectItem value="HOUSE">House</SelectItem>
                    <SelectItem value="ROOM">Room</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Property Photo</Label>
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div 
                        className="w-32 h-32 rounded-3xl bg-slate-100 flex items-center justify-center shrink-0 border-2 border-dashed border-slate-200 overflow-hidden relative group cursor-pointer hover:border-primary transition-all"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                        {formData.photoUrl ? (
                            <>
                                <img src={formData.photoUrl} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </>
                        ) : (
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                        )}
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                        <Input 
                            value={formData.photoUrl}
                            onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-bold text-slate-700"
                            placeholder="Enter image URL or upload below..."
                        />
                        <p className="text-[10px] text-slate-400 font-medium italic">Click the square to upload a new photo directly to your Supabase storage.</p>
                        <input 
                            type="file" 
                            id="photo-upload" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setIsLoading(true);
                                try {
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `${Math.random()}.${fileExt}`;
                                    const filePath = `property-photos/${fileName}`;

                                    const { error: uploadError } = await supabase.storage
                                        .from('properties')
                                        .upload(filePath, file);

                                    if (uploadError) throw uploadError;

                                    const { data: { publicUrl } } = supabase.storage
                                        .from('properties')
                                        .getPublicUrl(filePath);
                                    
                                    setFormData({ ...formData, photoUrl: publicUrl });
                                    toast.success("Photo uploaded successfully");
                                } catch (err: any) {
                                    console.error(err);
                                    toast.error("Upload failed: " + err.message);
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Billing Settings inside General Form */}
            <div className="pt-8 border-t border-slate-50 space-y-8">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Billing & Water Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Water Rate (KES per Unit)</Label>
                        <Input 
                            type="number"
                            value={formData.waterRate}
                            onChange={(e) => setFormData({...formData, waterRate: parseFloat(e.target.value) || 0})}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all font-bold text-slate-700"
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 h-12 self-end">
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold text-slate-700">Auto-Generate Bills</span>
                        </div>
                        <Switch 
                            checked={formData.autoWaterBills}
                            onCheckedChange={(v) => setFormData({...formData, autoWaterBills: v})}
                        />
                    </div>
                </div>
            </div>

            <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 px-8 h-12 shadow-lg shadow-primary/20"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              Save All Changes
            </Button>
          </form>
        </section>

        {/* Tenant Access */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" /> Tenant Access
                </h3>
            </div>
            <div className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/60">Invite Code</p>
                        <p className="text-3xl font-black text-indigo-900 tracking-tighter">{property.inviteCode}</p>
                        <p className="text-xs text-indigo-700/60 font-medium">Tenants use this code to join your property.</p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="rounded-xl font-bold gap-2 border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        onClick={() => {
                            navigator.clipboard.writeText(property.inviteCode);
                            toast.success("Code copied to clipboard");
                        }}
                    >
                        <Copy className="w-4 h-4" /> Copy Code
                    </Button>
                </div>
            </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-[2.5rem] border border-red-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-red-50 bg-red-50/30">
            <h3 className="font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Danger Zone
            </h3>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
             <div>
                <p className="font-bold text-slate-900">Delete this property</p>
                <p className="text-sm text-slate-500 max-w-md">Once you delete a property, there is no going back. All associated data will be purged.</p>
             </div>
             <Button 
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive" 
                className="rounded-xl font-bold px-8 h-12 shadow-lg shadow-red-200"
             >
                {isDeleting ? "Deleting..." : "Delete Property"}
             </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

import { Users, Badge } from "lucide-react";
