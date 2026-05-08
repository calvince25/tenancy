"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, 
  Plus, 
  Download, 
  Search, 
  History,
  Pencil,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WaterManagerProps {
  tenancies: any[];
  waterBills: any[];
  propertyId: string;
  propertyName: string;
  waterRate: number;
}

export function WaterManager({ tenancies, waterBills, propertyId, propertyName, waterRate }: WaterManagerProps) {
  const router = useRouter();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    tenancyId: "",
    previousReading: "0",
    currentReading: "",
    month: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
  });

  const handleOpenLog = () => {
    setFormData({
      tenancyId: "",
      previousReading: "0",
      currentReading: "",
      month: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    });
    setIsLogModalOpen(true);
  };

  const handleTenancyChange = (v: string) => {
    const tenancy = tenancies.find(t => t.id === v);
    const lastBill = tenancy?.waterBills?.[0];
    setFormData({
      ...formData,
      tenancyId: v,
      previousReading: lastBill ? lastBill.currentReading.toString() : "0",
    });
  };

  const handleLogReading = async (e: React.FormEvent) => {
    e.preventDefault();
    const prev = parseFloat(formData.previousReading);
    const curr = parseFloat(formData.currentReading);
    
    if (curr < prev) {
        toast.error("Current reading cannot be less than previous reading");
        return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/water-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          previousReading: prev,
          currentReading: curr,
          ratePerUnit: waterRate,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to log water reading");
      }

      toast.success("Water bill generated successfully");
      setIsLogModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBills = waterBills.filter(b => 
    (b.tenancy?.tenant?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (b.tenancy?.unit?.unitNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Water Billing</h1>
          <p className="text-muted-foreground mt-1 font-medium">Meter readings and billing cycles for {propertyName}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2 h-11 px-6 shadow-sm">
            <History className="w-4 h-4" /> Export History
          </Button>
          <Button 
            onClick={handleOpenLog}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Log Reading
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Billing Log</h3>
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="Search unit or tenant..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 rounded-xl border-slate-200 bg-white"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="px-8 py-4">Unit / Tenant</th>
                        <th className="px-8 py-4 text-center">Prev. Reading</th>
                        <th className="px-8 py-4 text-center">Curr. Reading</th>
                        <th className="px-8 py-4 text-center">Consumption</th>
                        <th className="px-8 py-4">Total Amount</th>
                        <th className="px-8 py-4 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredBills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-8 py-5">
                                <p className="font-bold text-slate-900 text-sm">Unit {bill.tenancy.unit?.unitNumber || "N/A"}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{bill.tenancy.tenant.name}</p>
                            </td>
                            <td className="px-8 py-5 text-center">
                                <span className="text-sm font-medium text-slate-500">{bill.previousReading}</span>
                            </td>
                            <td className="px-8 py-5 text-center">
                                <span className="text-sm font-bold text-slate-900">{bill.currentReading}</span>
                            </td>
                            <td className="px-8 py-5 text-center">
                                <Badge variant="outline" className="rounded-lg font-bold text-[10px] border-blue-100 bg-blue-50 text-blue-600">
                                    {bill.unitsUsed.toFixed(1)} Units
                                </Badge>
                            </td>
                            <td className="px-8 py-5">
                                <p className="font-black text-slate-900 text-sm">KES {bill.totalAmount.toLocaleString()}</p>
                                <p className="text-[9px] font-bold text-slate-400 italic">@ KES {bill.ratePerUnit}/unit</p>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Badge className={cn(
                                        "rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest border-none shadow-sm",
                                        bill.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                    )}>
                                        {bill.status}
                                    </Badge>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredBills.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold italic">No water billing records found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Droplets className="w-6 h-6 text-blue-500" />
                Log Water Reading
            </DialogTitle>
            <DialogDescription>Record the latest meter reading for a tenant.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogReading} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Select Tenant / Unit</Label>
              <Select value={formData.tenancyId} onValueChange={handleTenancyChange}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Choose a unit" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                    {tenancies.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                            Unit {t.unit?.unitNumber || "N/A"} - {t.tenant.name}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Previous Reading</Label>
                    <Input 
                        value={formData.previousReading}
                        disabled
                        className="rounded-xl h-12 bg-slate-50 border-slate-100"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Current Reading</Label>
                    <Input 
                        type="number"
                        step="0.01"
                        value={formData.currentReading}
                        onChange={(e) => setFormData({...formData, currentReading: e.target.value})}
                        required
                        autoFocus
                        className="rounded-xl h-12 border-primary/20 focus:ring-primary"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="font-bold text-slate-700">Billing Month</Label>
                <Input 
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    required
                    className="rounded-xl h-12"
                    placeholder="e.g. June 2026"
                />
            </div>

            {formData.currentReading && parseFloat(formData.currentReading) >= parseFloat(formData.previousReading) && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-600/70 uppercase">Consumption</span>
                        <span className="font-black text-blue-600">{(parseFloat(formData.currentReading) - parseFloat(formData.previousReading)).toFixed(1)} Units</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-600/70 uppercase">Total Amount</span>
                        <span className="text-lg font-black text-blue-700">KES {((parseFloat(formData.currentReading) - parseFloat(formData.previousReading)) * waterRate).toLocaleString()}</span>
                    </div>
                </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading || !formData.tenancyId || !formData.currentReading} className="w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20">
                {isLoading ? "Saving..." : "Generate Water Bill"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
