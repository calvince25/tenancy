"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wallet, 
  Banknote,
  Smartphone,
  Calendar,
  Save,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function PaymentRecording({ tenancyId, tenantId, defaultAmount = 0, type = "RENT" }: { tenancyId: string, tenantId: string, defaultAmount?: number, type?: "RENT" | "WATER" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [period, setPeriod] = useState(format(new Date(), "MMMM yyyy"));
  const [method, setMethod] = useState("MPESA");
  const [reference, setReference] = useState("");

  async function handleRecordPayment() {
    if (!amount) return toast.error("Amount is required");
    setIsLoading(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenancyId,
          tenantId,
          amount: parseFloat(amount),
          period,
          type,
          method,
          paymentReference: reference,
        }),
      });

      if (res.ok) {
        toast.success(`${type} payment recorded successfully`);
        setReference("");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to record payment");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-success/20 bg-success/5">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success text-white rounded-lg">
              {type === "RENT" ? <Wallet className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold">Record {type} Payment</h3>
              <p className="text-xs text-muted-foreground">Manually record a payment made by the tenant.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Amount (KES)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Input 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. June 2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MPESA">M-Pesa</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reference (Optional)</Label>
              <Input 
                value={reference} 
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. ABC123XYZ"
              />
            </div>
          </div>

          <Button 
            onClick={handleRecordPayment} 
            className="w-full bg-success hover:bg-success/90 text-white gap-2 h-11"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
