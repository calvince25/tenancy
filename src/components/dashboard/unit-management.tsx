"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Users, 
  Droplets, 
  Wallet,
  X,
  Check
} from "lucide-react";
import { toast } from "sonner";

export function UnitManagement({ propertyId }: { propertyId: string }) {
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);

  // Form state
  const [unitNumber, setUnitNumber] = useState("");
  const [unitType, setUnitType] = useState("APARTMENT");
  const [monthlyRent, setMonthlyRent] = useState("");

  useEffect(() => {
    fetchUnits();
  }, [propertyId]);

  async function fetchUnits() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/units?propertyId=${propertyId}`);
      const data = await res.json();
      setUnits(data);
    } catch (error) {
      toast.error("Failed to fetch units");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddUnit() {
    if (!unitNumber) return toast.error("Unit number is required");

    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          unitNumber,
          type: unitType,
          status: "VACANT",
          monthlyRent: monthlyRent ? parseFloat(monthlyRent) : undefined,
        }),
      });

      if (res.ok) {
        toast.success("Unit added successfully");
        setIsAddingUnit(false);
        setUnitNumber("");
        setMonthlyRent("");
        fetchUnits();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to add unit");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  async function handleUpdateUnit() {
    try {
      const res = await fetch("/api/units", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUnit.id,
          unitNumber,
          type: unitType,
          status: editingUnit.status,
          monthlyRent: monthlyRent ? parseFloat(monthlyRent) : undefined,
        }),
      });

      if (res.ok) {
        toast.success("Unit updated successfully");
        setEditingUnit(null);
        setUnitNumber("");
        setMonthlyRent("");
        fetchUnits();
      }
    } catch (error) {
      toast.error("Failed to update unit");
    }
  }

  async function handleDeleteUnit(id: string) {
    if (!confirm("Are you sure you want to delete this unit?")) return;

    try {
      const res = await fetch(`/api/units?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Unit deleted");
        fetchUnits();
      }
    } catch (error) {
      toast.error("Failed to delete unit");
    }
  }

  const [activeUnitForm, setActiveUnitForm] = useState<{ id: string, type: "WATER" | "PAYMENT" } | null>(null);

  const startEdit = (unit: any) => {
    setEditingUnit(unit);
    setUnitNumber(unit.unitNumber);
    setUnitType(unit.type);
    setMonthlyRent(unit.monthlyRent?.toString() || "");
    setIsAddingUnit(true);
    setActiveUnitForm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-primary">Units Management</h2>
          <p className="text-sm text-muted-foreground">Manage units and tenant billing within this property.</p>
        </div>
        <Button 
          onClick={() => {
            setEditingUnit(null);
            setUnitNumber("");
            setMonthlyRent("");
            setIsAddingUnit(!isAddingUnit);
            setActiveUnitForm(null);
          }}
          variant={isAddingUnit ? "outline" : "default"}
          className="gap-2"
        >
          {isAddingUnit ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAddingUnit ? "Cancel" : "Add Unit"}
        </Button>
      </div>

      {isAddingUnit && (
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label>Unit Number</Label>
                <Input 
                  placeholder="e.g. A1" 
                  value={unitNumber} 
                  onChange={(e) => setUnitNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={unitType} onValueChange={setUnitType}>
                  <SelectTrigger>
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
                <Label>Monthly Rent (KES)</Label>
                <Input 
                  type="number" 
                  placeholder="Optional" 
                  value={monthlyRent} 
                  onChange={(e) => setMonthlyRent(e.target.value)}
                />
              </div>
              <Button onClick={editingUnit ? handleUpdateUnit : handleAddUnit} className="w-full">
                {editingUnit ? "Update Unit" : "Create Unit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeUnitForm && (
        <div className="space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-primary">
              {activeUnitForm.type === "WATER" ? "Water Bill Recording" : "Rent Payment Recording"} 
              - Unit {units.find(u => u.id === activeUnitForm.id)?.unitNumber}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveUnitForm(null)}>
              <X className="w-4 h-4 mr-2" /> Close Form
            </Button>
          </div>
          {activeUnitForm.type === "WATER" ? (
            <WaterBillManagement 
              tenancyId={units.find(u => u.id === activeUnitForm.id)?.tenancies[0]?.id} 
              unitNumber={units.find(u => u.id === activeUnitForm.id)?.unitNumber} 
            />
          ) : (
            <PaymentRecording 
              tenancyId={units.find(u => u.id === activeUnitForm.id)?.tenancies[0]?.id} 
              tenantId={units.find(u => u.id === activeUnitForm.id)?.tenancies[0]?.tenantId}
              defaultAmount={units.find(u => u.id === activeUnitForm.id)?.monthlyRent || units.find(u => u.id === activeUnitForm.id)?.tenancies[0]?.monthlyRent}
            />
          )}
          <div className="h-px bg-muted my-6" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p>Loading units...</p>
        ) : units.length === 0 ? (
          <p className="text-muted-foreground italic col-span-full">No units added yet.</p>
        ) : (
          units.map((unit) => (
            <Card key={unit.id} className={`group overflow-hidden transition-all ${activeUnitForm?.id === unit.id ? 'ring-2 ring-primary border-transparent' : ''}`}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {unit.unitNumber}
                  </div>
                  <div>
                    <CardTitle className="text-base">{unit.type}</CardTitle>
                    <Badge variant={unit.status === "VACANT" ? "outline" : "default"} className="text-[10px] h-4">
                      {unit.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(unit)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteUnit(unit.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> Tenant
                    </span>
                    <span className="font-medium">
                      {unit.tenancies[0]?.tenant.name || "None"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Wallet className="w-3 h-3" /> Rent
                    </span>
                    <span className="font-medium">
                      KES {(unit.monthlyRent || unit.tenancies[0]?.monthlyRent || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                {unit.tenancies[0] && (
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex-1 text-xs gap-1 h-8 ${activeUnitForm?.id === unit.id && activeUnitForm.type === "WATER" ? 'bg-primary text-white' : ''}`}
                      onClick={() => setActiveUnitForm({ id: unit.id, type: "WATER" })}
                    >
                      <Droplets className="w-3 h-3" /> Water
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex-1 text-xs gap-1 h-8 ${activeUnitForm?.id === unit.id && activeUnitForm.type === "PAYMENT" ? 'bg-primary text-white' : ''}`}
                      onClick={() => setActiveUnitForm({ id: unit.id, type: "PAYMENT" })}
                    >
                      <Check className="w-3 h-3" /> Pay Rent
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
