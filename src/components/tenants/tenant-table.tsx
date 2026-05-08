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

export function TenantTable({ 
  tenancies, 
  propertyId,
  onDelete
}: { 
  tenancies: any[]; 
  propertyId: string;
  onDelete: (tenancy: any) => void;
}) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow className="border-muted/50">
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-8 h-12">Tenant</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest h-12">Unit</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest h-12">Rent Amount</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest h-12">Lease End</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest h-12">Rent Status</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest h-12">Water Status</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest text-right px-8 h-12">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenancies?.map((tenancy) => {
          const latestPayment = tenancy.payments?.[0];
          const latestWater = tenancy.waterBills?.[0];
          
          return (
            <TableRow key={tenancy.id} className="group hover:bg-slate-50/30 border-muted/30 transition-colors">
              <TableCell className="px-8 py-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage src={tenancy.tenant.profilePhotoUrl || ""} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {tenancy.tenant.name ? tenancy.tenant.name.substring(0, 2).toUpperCase() : "TN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-primary text-sm">{tenancy.tenant.name}</span>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{tenancy.tenant.phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-primary text-sm">Unit {tenancy.unit?.unitNumber || "N/A"}</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">{tenancy.property.type}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-bold text-primary text-sm">KES {(tenancy.monthlyRent || 0).toLocaleString()}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-primary">
                    {tenancy.endDate ? new Date(tenancy.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Ongoing"}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">
                    Started {new Date(tenancy.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={cn(
                  "rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest border-none shadow-sm",
                  latestPayment?.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                  {latestPayment?.status === "CONFIRMED" ? "PAID" : "OVERDUE"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={cn(
                  "rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest border-none shadow-sm",
                  latestWater?.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  {latestWater?.status === "PAID" ? "PAID" : "PENDING"}
                </Badge>
              </TableCell>
              <TableCell className="px-8 text-right">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-primary/5 text-slate-400 hover:text-primary"
                    onClick={() => router.push(`/dashboard/${propertyId}/tenants/${tenancy.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                    onClick={() => onDelete(tenancy)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {tenancies.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-bold italic">
              No active tenants found in this property.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
