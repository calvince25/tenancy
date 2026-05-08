"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Layers, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2,
  Building2,
  User,
  Phone
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Unit {
  id: string;
  unitNumber: string;
  ownerName: string | null;
  ownerPhone: string | null;
  type: string;
  status: string;
  monthlyRent: number | null;
  tenancies: any[];
}

interface UnitListProps {
  units: Unit[];
  propertyId: string;
}

export function UnitList({ units, propertyId }: UnitListProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    unitNumber: "",
    ownerName: "",
    ownerPhone: "",
    type: "APARTMENT",
    status: "VACANT",
    monthlyRent: "",
  });

  const handleOpenAdd = () => {
    setFormData({
      unitNumber: "",
      ownerName: "",
      ownerPhone: "",
      type: "APARTMENT",
      status: "VACANT",
      monthlyRent: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setFormData({
      unitNumber: unit.unitNumber,
      ownerName: unit.ownerName || "",
      ownerPhone: unit.ownerPhone || "",
      type: unit.type,
      status: unit.status,
      monthlyRent: unit.monthlyRent?.toString() || "",
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteModalOpen(true);
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          propertyId,
          monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add unit");
      }

      toast.success("Unit added successfully");
      setIsAddModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/units", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: selectedUnit.id,
          propertyId,
          monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update unit");
      }

      toast.success("Unit updated successfully");
      setIsEditModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUnit = async () => {
    if (!selectedUnit) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/units?id=${selectedUnit.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete unit");
      }

      toast.success("Unit deleted successfully");
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveTenant = selectedUnit?.tenancies?.some((t: any) => t.status === "ACTIVE");

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Units Management</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage individual units and their occupancy.</p>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add Unit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {units.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <Layers className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">No units added yet</p>
            <Button variant="ghost" onClick={handleOpenAdd} className="mt-4 text-primary font-bold">Add your first unit</Button>
          </div>
        ) : (
          units.map((unit) => (
            <div key={unit.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-bold">
                  {unit.unitNumber}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "uppercase tracking-widest text-[10px] font-black",
                    unit.status === 'OCCUPIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    unit.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  )}>
                    {unit.status}
                  </Badge>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">Unit {unit.unitNumber}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">{unit.type}</p>
              
              {unit.ownerName && (
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">{unit.ownerName}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  {unit.tenancies[0] ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                        {unit.tenancies[0].tenant.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{unit.tenancies[0].tenant.name}</span>
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">Vacant</p>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenView(unit)} className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(unit)} className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(unit)} className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Unit Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Unit</DialogTitle>
            <DialogDescription>Enter the details of the new unit below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUnit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unitNumber" className="font-bold">Unit Name / Number</Label>
              <Input 
                id="unitNumber" 
                placeholder="e.g. House 1, Flat A" 
                value={formData.unitNumber}
                onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="font-bold">Owner Name</Label>
                <Input 
                  id="ownerName" 
                  placeholder="Landlord or Subletter" 
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerPhone" className="font-bold">Owner Phone</Label>
                <Input 
                  id="ownerPhone" 
                  placeholder="Phone Number" 
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Unit Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOUSE">House</SelectItem>
                    <SelectItem value="APARTMENT">Apartment</SelectItem>
                    <SelectItem value="ROOM">Room</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Initial Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VACANT">Vacant</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent" className="font-bold">Default Monthly Rent (KES)</Label>
              <Input 
                id="rent" 
                type="number"
                placeholder="Optional" 
                value={formData.monthlyRent}
                onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20">
                {isLoading ? "Saving..." : "Create Unit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Unit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Unit {selectedUnit?.unitNumber}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUnit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-unitNumber" className="font-bold">Unit Name / Number</Label>
              <Input 
                id="edit-unitNumber" 
                value={formData.unitNumber}
                onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ownerName" className="font-bold">Owner Name</Label>
                <Input 
                  id="edit-ownerName" 
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ownerPhone" className="font-bold">Owner Phone</Label>
                <Input 
                  id="edit-ownerPhone" 
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Unit Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOUSE">House</SelectItem>
                    <SelectItem value="APARTMENT">Apartment</SelectItem>
                    <SelectItem value="ROOM">Room</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VACANT">Vacant</SelectItem>
                    <SelectItem value="OCCUPIED">Occupied</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rent" className="font-bold">Monthly Rent (KES)</Label>
              <Input 
                id="edit-rent" 
                type="number"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20">
                {isLoading ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Unit Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Building2 className="w-6 h-6 text-primary" />
              Unit {selectedUnit?.unitNumber} Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p>
                <Badge className={cn(
                    "uppercase tracking-widest text-[10px] font-black",
                    selectedUnit?.status === 'OCCUPIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    selectedUnit?.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  )}>
                  {selectedUnit?.status}
                </Badge>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Type</p>
                <p className="font-bold text-slate-900">{selectedUnit?.type}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-400">Ownership Information</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold">{selectedUnit?.ownerName || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold">{selectedUnit?.ownerPhone || "Not set"}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-primary/60 mb-1">Monthly Rent</p>
                <p className="text-xl font-black text-primary">KES {selectedUnit?.monthlyRent?.toLocaleString() || "0"}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary/20" />
            </div>

            {selectedUnit?.tenancies[0] && (
              <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3">Current Active Tenant</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {selectedUnit.tenancies[0].tenant.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{selectedUnit.tenancies[0].tenant.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lease Active</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="w-full rounded-xl font-bold">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">Delete Unit?</DialogTitle>
            <DialogDescription className="font-bold">
              Are you sure you want to permanently delete Unit {selectedUnit?.unitNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {hasActiveTenant && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-4">
              <p className="text-red-600 font-bold text-sm">
                WARNING: This unit has an active tenant. Deleting the unit will also terminate the associated tenancy record.
              </p>
            </div>
          )}

          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUnit} disabled={isLoading} className="rounded-xl font-bold shadow-lg shadow-red-200">
              {isLoading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
