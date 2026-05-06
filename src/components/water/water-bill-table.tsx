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
  Droplets,
  Eye,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function WaterBillTable({ bills }: { bills: any[] }) {
  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow className="border-muted/50">
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-8 py-5">Tenant & Unit</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Readings (Prev/Curr)</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Units Used</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Rate</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Amount Due</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Status</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest text-right px-8">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills?.map((bill) => (
          <TableRow key={bill.id} className="group hover:bg-slate-50/30 border-muted/30 transition-colors">
            <TableCell className="px-8 py-6">
              <div className="flex flex-col">
                <span className="font-bold text-primary">{bill.tenancy.tenant.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Unit {bill.tenancy.unit.unitNumber} • {bill.month}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-muted-foreground">{bill.previousReading}</span>
                 <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                 <span className="text-sm font-bold text-primary">{bill.currentReading}</span>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-bold text-primary">{bill.unitsUsed} Units</span>
            </TableCell>
            <TableCell>
              <span className="text-[10px] font-bold text-muted-foreground">KES 200/U</span>
            </TableCell>
            <TableCell>
              <span className="font-bold text-primary">KES {(bill.totalAmount || 0).toLocaleString()}</span>
            </TableCell>
            <TableCell>
              <Badge className={cn(
                "rounded-full px-3 py-1 text-[9px] font-bold border-none",
                bill.status === "PAID" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              )}>
                {bill.status}
              </Badge>
            </TableCell>
            <TableCell className="px-8 text-right">
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 text-primary">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 text-primary">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {bills.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium italic">
              No water billing records found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
