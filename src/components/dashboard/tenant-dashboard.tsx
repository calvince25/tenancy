"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Wrench, 
  MessageSquare, 
  FileText,
  ChevronRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  User,
  AlertCircle,
  Droplets,
  Download
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { generatePaymentReceipt } from "@/lib/pdf-utils";

export function TenantDashboard({ user, tenancy }: { user: any, tenancy: any }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [waterBills, setWaterBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [payRes, waterRes] = await Promise.all([
          fetch(`/api/payments?tenancyId=${tenancy.id}`),
          fetch(`/api/water-bills?tenancyId=${tenancy.id}`)
        ]);
        const [payData, waterData] = await Promise.all([payRes.json(), waterRes.json()]);
        setPayments(payData);
        setWaterBills(waterData);
      } catch (error) {
        console.error("Failed to fetch tenant data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [tenancy.id]);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentMonthRent = payments.find(p => p.type === "RENT" && p.period === currentMonth && p.status === "CONFIRMED");
  const currentMonthWater = waterBills.find(b => b.month === currentMonth);
  const isRentPaid = !!currentMonthRent;
  
  const dueDate = new Date(new Date().getFullYear(), new Date().getMonth(), tenancy.rentDueDay);
  const isRentDueSoon = !isRentPaid && new Date().getDate() >= (tenancy.rentDueDay - 5);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-primary">My Home</h1>
          <p className="text-muted-foreground">{tenancy.property.address} - Unit {tenancy.unit?.unitNumber || "N/A"}</p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-8 px-4">
          Active Tenancy
        </Badge>
      </header>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rent Card */}
        <Card className={cn(
          "border-none shadow-md overflow-hidden transition-all hover:shadow-lg",
          isRentPaid ? "bg-success/5" : isRentDueSoon ? "bg-amber-50" : "bg-destructive/5"
        )}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "p-4 rounded-full",
                isRentPaid ? "bg-success/20 text-success" : isRentDueSoon ? "bg-amber-100 text-amber-600" : "bg-destructive/20 text-destructive"
              )}>
                {isRentPaid ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
              </div>
              
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-widest font-semibold text-muted-foreground">
                  {isRentPaid ? "Rent Paid" : "Rent Due"}
                </p>
                <p className="text-4xl font-bold">KES {(tenancy.monthlyRent || 0).toLocaleString()}</p>
                <p className="text-muted-foreground text-sm">
                  For {currentMonth}
                </p>
              </div>

              <div className="w-full pt-4">
                {isRentPaid ? (
                  <Button 
                    variant="outline" 
                    className="w-full bg-white h-12 flex gap-2"
                    onClick={() => generatePaymentReceipt(currentMonthRent, tenancy)}
                  >
                    <Download className="w-4 h-4" />
                    Download Receipt
                  </Button>
                ) : (
                  <Link href="/dashboard/payments">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 flex gap-2">
                      <Wallet className="w-4 h-4" />
                      Pay Rent Now
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Bill Card */}
        <Card className={cn(
          "border-none shadow-md overflow-hidden transition-all hover:shadow-lg",
          currentMonthWater?.status === "PAID" ? "bg-blue-50" : "bg-blue-50"
        )}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-blue-100 text-blue-600">
                <Droplets className="w-10 h-10" />
              </div>
              
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-widest font-semibold text-muted-foreground">
                  Water Bill
                </p>
                <p className="text-4xl font-bold text-blue-700">
                  KES {currentMonthWater ? (currentMonthWater.totalAmount || 0).toLocaleString() : "0"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {currentMonthWater ? `${currentMonthWater.unitsUsed} units used` : "No reading yet"}
                </p>
              </div>

              <div className="w-full pt-4">
                {currentMonthWater?.status === "PAID" ? (
                  <Badge className="bg-success/10 text-success border-none h-12 w-full flex items-center justify-center text-base font-bold">
                    Bill Paid
                  </Badge>
                ) : currentMonthWater ? (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 flex gap-2">
                    <Wallet className="w-4 h-4" />
                    Pay Water Bill
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full h-12 italic text-muted-foreground">
                    Waiting for Reading
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Payment History
          </CardTitle>
          <CardDescription>View and download your previous payment statements.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground italic">
              No payments recorded yet.
            </div>
          ) : (
            <div className="divide-y">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      payment.type === "RENT" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-600"
                    )}>
                      {payment.type === "RENT" ? <Wallet className="w-4 h-4" /> : <Droplets className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{payment.type} - {payment.period}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.submittedAt), "PPP")} • {payment.method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">KES {(payment.amount || 0).toLocaleString()}</p>
                      <Badge variant="outline" className={cn(
                        "text-[10px] h-4",
                        payment.status === "CONFIRMED" ? "text-success border-success/20 bg-success/5" : "text-amber-500 border-amber-200 bg-amber-50"
                      )}>
                        {payment.status}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full"
                      onClick={() => generatePaymentReceipt(payment, tenancy)}
                      disabled={payment.status !== "CONFIRMED"}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
