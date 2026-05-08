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
import { 
  UserPlus, 
  Download, 
  Search, 
  Filter,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { TenantTable } from "./tenant-table";

interface TenantManagerProps {
  initialTenancies: any[];
  vacantUnits: any[];
  propertyId: string;
  propertyName: string;
}

export function TenantManager({ initialTenancies, vacantUnits, propertyId, propertyName }: TenantManagerProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTenancy, setSelectedTenancy] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nationalId: "",
    unitId: "",
    monthlyRent: "",
    depositAmount: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      phone: "",
      nationalId: "",
      unitId: "",
      monthlyRent: "",
      depositAmount: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
    });
    setIsAddModalOpen(true);
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          propertyId,
          monthlyRent: parseFloat(formData.monthlyRent),
          depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : 0,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add tenant");
      }

      toast.success("Tenant added and unit updated");
      setIsAddModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!selectedTenancy) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tenants?id=${selectedTenancy.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete tenant record");
      }

      toast.success("Tenant record deleted and unit is now vacant");
      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTenancies = initialTenancies.filter(t => 
    (t.tenant?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (t.unit?.unitNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (t.tenant?.phone || "").includes(searchQuery)
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tenants Directory</h1>
          <p className="text-muted-foreground mt-1 font-medium">Residents currently staying at {propertyName}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold gap-2 px-6 shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button 
            onClick={handleOpenAdd}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20"
          >
            <UserPlus className="w-4 h-4" /> Add Tenant
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by name, phone, or unit number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl border-slate-200 bg-white focus:ring-primary shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 rounded-xl border-slate-200 bg-white px-6 font-bold gap-2 shadow-sm">
            <Filter className="w-4 h-4" /> Status: Active
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <TenantTable 
            tenancies={filteredTenancies} 
            propertyId={propertyId}
            onDelete={(t) => {
                setSelectedTenancy(t);
                setIsDeleteModalOpen(true);
            }}
        />
      </div>

      {/* Add Tenant Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Tenant</DialogTitle>
            <DialogDescription>Assign a tenant to a vacant unit in {propertyName}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTenant} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="rounded-xl"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className="rounded-xl"
                  placeholder="e.g. 0712345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationalId" className="font-bold">National ID Number</Label>
                <Input 
                  id="nationalId" 
                  value={formData.nationalId}
                  onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                  className="rounded-xl"
                  placeholder="ID Number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="font-bold">Unit (Vacant Only)</Label>
                <Select value={formData.unitId} onValueChange={(v) => {
                    const unit = vacantUnits.find(u => u.id === v);
                    setFormData({
                        ...formData, 
                        unitId: v,
                        monthlyRent: unit?.monthlyRent?.toString() || formData.monthlyRent
                    });
                }}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {vacantUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        Unit {unit.unitNumber} ({unit.type})
                      </SelectItem>
                    ))}
                    {vacantUnits.length === 0 && (
                      <div className="p-2 text-center text-xs text-slate-400">No vacant units available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRent" className="font-bold">Rent Amount (KES)</Label>
                <Input 
                  id="monthlyRent" 
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositAmount" className="font-bold">Deposit Amount (KES)</Label>
                <Input 
                  id="depositAmount" 
                  type="number"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({...formData, depositAmount: e.target.value})}
                  className="rounded-xl"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="font-bold">Lease Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="font-bold">Lease End Date</Label>
                <Input 
                  id="endDate" 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading || !formData.unitId} className="w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20">
                {isLoading ? "Processing..." : "Confirm & Add Tenant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Remove Tenant?
            </DialogTitle>
            <DialogDescription className="font-bold">
              Are you sure you want to permanently remove {selectedTenancy?.tenant?.name}? This will mark the unit as vacant.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTenant} disabled={isLoading} className="rounded-xl font-bold shadow-lg shadow-red-200">
              {isLoading ? "Deleting..." : "Confirm Removal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
