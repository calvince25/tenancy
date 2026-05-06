"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Droplets, 
  Plus, 
  History,
  TrendingUp,
  Calendar,
  Save,
  X
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function WaterBillManagement({ tenancyId, unitNumber }: { tenancyId: string, unitNumber: string }) {
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingReading, setIsAddingReading] = useState(false);

  // Form state
  const [prevReading, setPrevReading] = useState("");
  const [currReading, setCurrReading] = useState("");
  const [rate, setRate] = useState("100");
  const [month, setMonth] = useState(format(new Date(), "MMMM yyyy"));

  useEffect(() => {
    fetchBills();
  }, [tenancyId]);

  async function fetchBills() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/water-bills?tenancyId=${tenancyId}`);
      const data = await res.json();
      setBills(data);
      if (data.length > 0) {
        setPrevReading(data[0].currentReading.toString());
      } else {
        setPrevReading("0");
      }
    } catch (error) {
      toast.error("Failed to fetch water bills");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit() {
    if (!currReading) return toast.error("Current reading is required");
    const units = parseFloat(currReading) - parseFloat(prevReading);
    if (units < 0) return toast.error("Current reading cannot be less than previous");

    try {
      const res = await fetch("/api/water-bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenancyId,
          previousReading: parseFloat(prevReading),
          currentReading: parseFloat(currReading),
          ratePerUnit: parseFloat(rate),
          month,
        }),
      });

      if (res.ok) {
        toast.success("Water bill recorded");
        setIsAddingReading(false);
        setCurrReading("");
        fetchBills();
      }
    } catch (error) {
      toast.error("Failed to record bill");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          Water Bills - Unit {unitNumber}
        </h3>
        <Button 
          variant={isAddingReading ? "outline" : "default"} 
          size="sm" 
          onClick={() => setIsAddingReading(!isAddingReading)}
          className="gap-2"
        >
          {isAddingReading ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAddingReading ? "Cancel" : "Add Reading"}
        </Button>
      </div>

      {isAddingReading && (
        <Card className="border-blue-100 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label>Month</Label>
                <Input value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Prev Reading</Label>
                <Input type="number" value={prevReading} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Curr Reading</Label>
                <Input type="number" placeholder="0.00" value={currReading} onChange={(e) => setCurrReading(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Rate per Unit</Label>
                <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
              </div>
              <Button onClick={handleSubmit} className="gap-2">
                <Save className="w-4 h-4" /> Save
              </Button>
            </div>
            {currReading && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg flex justify-between items-center text-blue-700 text-sm font-medium">
                <span>Units: {(parseFloat(currReading) - parseFloat(prevReading)).toFixed(2)}</span>
                <span>Total: KES {((parseFloat(currReading) - parseFloat(prevReading)) * parseFloat(rate)).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground italic">Loading history...</p>
        ) : bills.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No billing history found.</p>
        ) : (
          bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-muted-foreground/10 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-full">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">{bill.month}</p>
                  <p className="text-xs text-muted-foreground">
                    {bill.previousReading} → {bill.currentReading} ({bill.unitsUsed} units)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">KES {bill.totalAmount.toLocaleString()}</p>
                <p className={`text-[10px] font-bold uppercase ${bill.status === 'PAID' ? 'text-success' : 'text-amber-500'}`}>
                  {bill.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
