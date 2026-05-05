"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function PaymentHistory({ payments: initialPayments, userRole }: any) {
  const [payments, setPayments] = useState(initialPayments);

  async function handleUpdateStatus(paymentId: string, status: string) {
    try {
      const response = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paymentId, status }),
      });

      if (response.ok) {
        setPayments(payments.map((p: any) => p.id === paymentId ? { ...p, status } : p));
        toast.success(`Payment ${status.toLowerCase()}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {payments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-muted text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-4 opacity-20" />
            <p>No payment history found.</p>
          </div>
        ) : (
          payments.map((payment: any) => (
            <Card key={payment.id} className="border-none shadow-sm bg-white overflow-hidden group">
              <div className="flex flex-col sm:flex-row sm:items-center p-6 gap-6">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
                  payment.status === "CONFIRMED" ? "bg-success/10 text-success" : 
                  payment.status === "PENDING" ? "bg-amber-100 text-amber-600" : "bg-destructive/10 text-destructive"
                )}>
                  {payment.status === "CONFIRMED" ? <CheckCircle2 className="w-7 h-7" /> : 
                   payment.status === "PENDING" ? <Clock className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-serif text-xl text-primary">{payment.period}</p>
                    <Badge variant="outline" className={cn(
                      "border-none",
                      payment.status === "CONFIRMED" ? "bg-success/10 text-success" : 
                      payment.status === "PENDING" ? "bg-amber-100 text-amber-600" : "bg-destructive/10 text-destructive"
                    )}>
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {format(new Date(payment.submittedAt), "MMM d, yyyy")}
                    {payment.paymentReference && ` • Ref: ${payment.paymentReference}`}
                  </p>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-2xl font-bold">KES {payment.amount.toLocaleString()}</p>
                  
                  {userRole === "LANDLORD" && payment.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:bg-destructive/5"
                        onClick={() => handleUpdateStatus(payment.id, "DISPUTED")}
                      >
                        Dispute
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-success hover:bg-success/90 text-white"
                        onClick={() => handleUpdateStatus(payment.id, "CONFIRMED")}
                      >
                        Confirm
                      </Button>
                    </div>
                  )}

                  {payment.status === "CONFIRMED" && (
                    <Button variant="ghost" size="sm" className="text-accent gap-2">
                      <Download className="w-4 h-4" />
                      Receipt
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
