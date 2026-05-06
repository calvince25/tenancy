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
  Eye, 
  Pencil, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TenantTable({ tenancies }: { tenancies: any[] }) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow className="border-muted/50">
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-8">Tenant</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Unit & Property</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Rent Amount</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Lease End</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Rent Status</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Water Status</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest text-right px-8">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenancies.map((tenancy) => {
          const latestPayment = tenancy.payments[0];
          const latestWater = tenancy.waterBills[0];
          
          return (
            <TableRow key={tenancy.id} className="group hover:bg-slate-50/30 border-muted/30 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/tenants/${tenancy.tenant.id}`)}>
              <TableCell className="px-8 py-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage src={tenancy.tenant.profilePhotoUrl || ""} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {tenancy.tenant.name ? tenancy.tenant.name.substring(0, 2).toUpperCase() : "TN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">{tenancy.tenant.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{tenancy.tenant.phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">Unit {tenancy.unit.unitNumber}</span>
                    <Badge variant="outline" className="text-[9px] h-4 font-bold border-muted-foreground/20">{tenancy.property.type}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{tenancy.property.address}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-bold text-primary">KES {tenancy.monthlyRent.toLocaleString()}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-primary">
                    {typeof window !== 'undefined' ? (tenancy.endDate ? new Date(tenancy.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Ongoing") : "..."}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                    Started {typeof window !== 'undefined' ? new Date(tenancy.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : "..."}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={cn(
                  "rounded-full px-3 py-0.5 text-[9px] font-bold border-none",
                  latestPayment?.status === "CONFIRMED" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {latestPayment?.status === "CONFIRMED" ? "PAID" : "OVERDUE"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={cn(
                  "rounded-full px-3 py-0.5 text-[9px] font-bold border-none",
                  latestWater?.status === "PAID" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                )}>
                  {latestWater?.status === "PAID" ? "PAID" : "UNPAID"}
                </Badge>
              </TableCell>
              <TableCell className="px-8 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 text-primary">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 text-primary">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5 text-primary">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {tenancies.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium italic">
              No active tenants found in your portfolio.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
