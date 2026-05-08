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
  History,
  CreditCard,
  Calendar,
  MoreVertical,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  period: string;
  method: string;
  status: string;
  submittedAt: string;
  paymentReference: string | null;
}

interface PaymentListProps {
  initialPayments: Payment[];
  tenancyId: string;
  tenantId: string;
  rentAmount: number;
}

export function PaymentList({ initialPayments, tenancyId, tenantId, rentAmount }: PaymentListProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: rentAmount.toString(),
    period: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    method: "MPESA",
    paymentReference: "",
  });

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tenancyId,
          tenantId,
          amount: parseFloat(formData.amount),
          type: "RENT",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to log payment");
      }

      toast.success("Payment recorded successfully");
      setIsAddModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Transaction History
        </h3>
        <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl font-bold gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800"
        >
            <Plus className="w-4 h-4" /> Log Payment
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="px-8 py-4">Date of Payment</th>
                    <th className="px-8 py-4">Amount Paid</th>
                    <th className="px-8 py-4">Arrears</th>
                    <th className="px-8 py-4">Mode</th>
                    <th className="px-8 py-4">Month Covered</th>
                    <th className="px-8 py-4 text-right">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {initialPayments.map((p) => {
                    const arrears = rentAmount - p.amount;
                    return (
                        <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-8 py-5 text-sm font-bold text-slate-700">{new Date(p.submittedAt).toLocaleDateString()}</td>
                            <td className="px-8 py-5 text-sm font-black text-slate-900">KES {p.amount.toLocaleString()}</td>
                            <td className="px-8 py-5">
                                <span className={cn("text-sm font-bold", arrears > 0 ? "text-red-500" : "text-emerald-500")}>
                                    KES {arrears.toLocaleString()}
                                </span>
                            </td>
                            <td className="px-8 py-5">
                                <Badge variant="outline" className="rounded-lg font-bold text-[10px] border-slate-200">
                                    {p.method}
                                </Badge>
                            </td>
                            <td className="px-8 py-5 text-sm font-medium text-slate-600">{p.period}</td>
                            <td className="px-8 py-5 text-right">
                                <Badge className={cn(
                                    "rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest border-none shadow-sm",
                                    p.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                )}>
                                    {p.status}
                                </Badge>
                            </td>
                        </tr>
                    );
                })}
                {initialPayments.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold italic">No payment history found.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Log New Payment</DialogTitle>
            <DialogDescription>Manually record a payment from the tenant.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-bold">Amount Paid (KES)</Label>
              <Input 
                id="amount" 
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period" className="font-bold">Month Covered</Label>
              <Input 
                id="period" 
                value={formData.period}
                onChange={(e) => setFormData({...formData, period: e.target.value})}
                required
                className="rounded-xl"
                placeholder="e.g. June 2026"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Mode of Payment</Label>
              <Select value={formData.method} onValueChange={(v) => setFormData({...formData, method: v})}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MPESA">M-Pesa</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref" className="font-bold">Payment Reference / Receipt No.</Label>
              <Input 
                id="ref" 
                value={formData.paymentReference}
                onChange={(e) => setFormData({...formData, paymentReference: e.target.value})}
                className="rounded-xl"
                placeholder="Optional"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20">
                {isLoading ? "Saving..." : "Confirm & Save Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
