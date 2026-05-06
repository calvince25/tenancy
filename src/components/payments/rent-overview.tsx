"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function RentOverview({ tenancies }: { tenancies: any[] }) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow className="border-muted/50">
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-8 py-5">Tenant & Unit</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Rent Due</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Amount Paid</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Balance</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Status</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Last Payment</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest text-right px-8">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenancies.map((tenancy) => {
          const latestPayment = tenancy.payments[0];
          const amountPaid = tenancy.payments.filter((p: any) => p.type === "RENT" && p.status === "CONFIRMED").reduce((acc: number, p: any) => acc + p.amount, 0);
          const balance = Math.max(0, tenancy.monthlyRent - amountPaid);
          
          let status = "PAID";
          if (balance > 0) status = amountPaid > 0 ? "PARTIAL" : "OVERDUE";

          return (
            <TableRow key={tenancy.id} className="group hover:bg-slate-50/30 border-muted/30 transition-colors">
              <TableCell className="px-8 py-6">
                <div className="flex flex-col">
                  <span className="font-bold text-primary">{tenancy.tenant.name}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Unit {tenancy.unit.unitNumber} • {tenancy.property.address.substring(0, 20)}...</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-bold text-primary">KES {tenancy.monthlyRent.toLocaleString()}</span>
              </TableCell>
              <TableCell>
                <span className="font-bold text-success">KES {amountPaid.toLocaleString()}</span>
              </TableCell>
              <TableCell>
                <span className={cn("font-bold", balance > 0 ? "text-destructive" : "text-primary")}>
                  KES {balance.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <Badge className={cn(
                  "rounded-full px-3 py-1 text-[9px] font-bold border-none",
                  status === "PAID" ? "bg-success/10 text-success" : 
                  status === "PARTIAL" ? "bg-warning/10 text-warning" : 
                  "bg-destructive/10 text-destructive"
                )}>
                  {status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-primary">
                    {typeof window !== 'undefined' ? (latestPayment ? new Date(latestPayment.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : "N/A") : "..."}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">
                    {latestPayment?.method || ""}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-8 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-8 px-4 text-[10px] font-bold uppercase tracking-wider">
                    Record
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 text-primary">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
