"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Building2, MapPin, Users, ArrowRight,
  Edit3, Trash2, X, Loader2, AlertTriangle, Home, LogOut,
  Image as ImageIcon,
  Camera
} from "lucide-react";
import { signOut } from "next-auth/react";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  address: string; // We'll use this as name
  type: string;
  photoUrl?: string | null;
  units: { id: string }[];
  tenancies: { id: string }[];
};

type Props = {
  properties: Property[];
  landlordName: string;
  isAdmin?: boolean;
};

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function PropertyList({ properties: initialProperties, landlordName, isAdmin }: Props) {
  const router = useRouter();
  const [properties, setProperties] = useState(initialProperties);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Property | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [form, setForm] = useState({ address: "", type: "APARTMENT", photoFile: null as File | null, photoPreview: "" });

  const resetForm = () => { setForm({ address: "", type: "APARTMENT", photoFile: null, photoPreview: "" }); setError(""); };
  const openAdd = () => { resetForm(); setShowAdd(true); };
  const openEdit = (p: Property) => { 
    setForm({ address: p.address, type: p.type, photoFile: null, photoPreview: p.photoUrl ?? "" }); 
    setEditTarget(p); 
    setError(""); 
  };
  const closeAll = () => { setShowAdd(false); setEditTarget(null); setDeleteTarget(null); resetForm(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ 
        ...prev, 
        photoFile: file, 
        photoPreview: URL.createObjectURL(file) 
      }));
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `property-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload image. Please ensure 'properties' bucket exists and is public in Supabase.");
    }

    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  // ADD
  const handleAdd = async () => {
    if (!form.address.trim()) { setError("Please enter a property name."); return; }
    setLoading(true); setError("");
    try {
      let photoUrl = "";
      if (form.photoFile) {
        photoUrl = await uploadImage(form.photoFile);
      }

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: form.address, type: form.type, photoUrl: photoUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create property");
      setProperties(prev => [...prev, { ...data, units: [], tenancies: [] }]);
      closeAll();
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // EDIT
  const handleEdit = async () => {
    if (!editTarget || !form.address.trim()) { setError("Please enter a property name."); return; }
    setLoading(true); setError("");
    try {
      let photoUrl = editTarget.photoUrl ?? "";
      if (form.photoFile) {
        photoUrl = await uploadImage(form.photoFile);
      }

      const res = await fetch("/api/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editTarget.id, address: form.address, type: form.type, photoUrl: photoUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update property");
      setProperties(prev => prev.map(p => p.id === editTarget.id ? { ...p, address: data.address, type: data.type, photoUrl: data.photoUrl } : p));
      closeAll();
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/properties?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed to delete"); }
      setProperties(prev => prev.filter(p => p.id !== deleteTarget.id));
      closeAll();
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 md:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/30">
                R
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Renzo <span className="text-primary/40 font-medium">Portfolio</span>
              </h1>
            </div>
            <p className="text-slate-500 text-lg font-medium max-w-lg leading-relaxed">
              Welcome back, <span className="text-primary font-bold">{landlordName?.split(" ")[0] ?? "Landlord"}</span>. 
              Manage your properties or add a new one.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Button
                onClick={() => router.push("/dashboard/landlords")}
                variant="outline"
                className="h-14 px-6 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 shadow-sm"
              >
                <Users className="w-5 h-5 text-primary" />
                User Management
              </Button>
            )}
            <Button
              onClick={() => signOut({ callbackUrl: "/login" })}
              variant="outline"
              className="h-14 px-6 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
            <Button
              onClick={openAdd}
              className="bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold gap-3 h-14 px-8 shadow-2xl shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Building2 className="w-20 h-20 text-slate-300 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900">No properties yet</h3>
              <p className="text-slate-500 font-medium mb-8">Click "Add Property" to get started.</p>
              <Button size="lg" onClick={openAdd} className="rounded-2xl px-12 h-14 gap-2">
                <Plus className="w-5 h-5" /> Add First Property
              </Button>
            </div>
          ) : (
            properties.map((property) => {
              const occupancy = property.units.length > 0
                ? Math.round((property.tenancies.length / property.units.length) * 100)
                : 0;
              return (
                <div key={property.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden relative">
                  
                  {/* Property Image / Card Top */}
                  <div 
                    className="relative aspect-[4/3] cursor-pointer overflow-hidden"
                    onClick={() => router.push(`/dashboard/${property.id}`)}
                  >
                    <img
                      src={property.photoUrl || `https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800`}
                      alt={property.address}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Badge */}
                    <div className="absolute top-5 left-5">
                      <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
                        {property.type}
                      </Badge>
                    </div>

                    {/* Quick Info Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="text-xl font-bold tracking-tight mb-1">{property.address}</h3>
                      <div className="flex items-center gap-3 text-white/80 text-xs font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {property.units.length} Units</span>
                        <span className="w-1 h-1 rounded-full bg-white/40" />
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {occupancy}% Occupied</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="p-6 flex items-center justify-between border-t border-slate-50 bg-slate-50/30">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); openEdit(property); }}
                        className="h-10 px-4 rounded-xl font-bold text-primary hover:bg-primary/5 gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(property); }}
                        className="h-10 px-4 rounded-xl font-bold text-red-500 hover:bg-red-50 gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/${property.id}`)}
                      className="h-10 w-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 transition-transform"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── ADD / EDIT MODAL ─── */}
      <Modal open={showAdd || !!editTarget} onClose={closeAll}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{showAdd ? "Add Property" : "Edit Property"}</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">
                {showAdd ? "Create a new property in your portfolio." : "Update your property information."}
              </p>
            </div>
            <button onClick={closeAll} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Property Name <span className="text-primary">*</span>
              </label>
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="e.g. Riverside Apartments"
                className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Property Type
              </label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base font-bold outline-none appearance-none"
              >
                {["APARTMENT", "HOUSE", "ROOM", "OTHER"].map(t => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Property Photo
              </label>
              <div 
                className="relative h-40 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-primary/30 transition-all overflow-hidden group"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                {form.photoPreview ? (
                  <>
                    <img src={form.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Click to upload photo</p>
                  </>
                )}
                <input 
                  type="file" 
                  id="photo-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <Button variant="ghost" onClick={closeAll} className="flex-1 h-14 rounded-2xl font-bold text-slate-500" disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={showAdd ? handleAdd : handleEdit} 
              className="flex-1 h-14 rounded-2xl font-bold gap-3 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (showAdd ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />)}
              {loading ? (showAdd ? "Creating..." : "Saving...") : (showAdd ? "Create Property" : "Save Changes")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── DELETE CONFIRM MODAL ─── */}
      <Modal open={!!deleteTarget} onClose={closeAll}>
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Delete Property?</h2>
          <p className="text-slate-500 font-medium mb-8">
            Are you sure you want to delete <span className="text-slate-900 font-bold">"{deleteTarget?.address}"</span>? This action cannot be undone.
          </p>
          
          <div className="flex gap-4">
            <Button variant="ghost" onClick={closeAll} className="flex-1 h-14 rounded-2xl font-bold text-slate-500" disabled={loading}>
              No, Keep it
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 h-14 rounded-2xl font-bold gap-3 bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-200"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              {loading ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
