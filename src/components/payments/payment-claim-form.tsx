"use client";

import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Wallet, Info } from "lucide-react";

export function PaymentClaimForm({ tenancy }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    amount: tenancy.monthlyRent.toString(),
    period: format(new Date(), "MMMM yyyy"),
    paymentReference: "",
  });

  const periods = [
    format(new Date(), "MMMM yyyy"),
    format(new Date(new Date().setMonth(new Date().getMonth() - 1)), "MMMM yyyy"),
  ];

  async function handleSubmit() {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          tenancyId: tenancy.id,
        }),
      });

      if (response.ok) {
        toast.success("Payment claim submitted! Your landlord will verify it.");
        setIsOpen(false);
        window.location.reload(); // Quick way to refresh history
      }
    } catch (error) {
      toast.error("Failed to submit claim");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-white gap-2 h-12">
          <Wallet className="w-4 h-4" />
          I've Paid Rent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif">Report Rent Payment</DialogTitle>
          <p className="text-sm text-muted-foreground">Confirm you've sent the funds to your landlord.</p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/30 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-primary">Payment Instructions</p>
              <p>{tenancy.paymentInstructions || "Please send to the landlord's registered number/account."}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Period</Label>
            <Select onValueChange={(v) => setForm({ ...form, period: v })} defaultValue={form.period}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Paid (KES)</Label>
            <Input
              id="amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref">Reference Number / Transaction ID</Label>
            <Input
              id="ref"
              placeholder="e.g. MPESA XYZ123"
              value={form.paymentReference}
              onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
              className="bg-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-accent text-white h-12">
            {isLoading ? "Submitting..." : "Submit Payment Claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { format } from "date-fns";
