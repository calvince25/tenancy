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
  AlertTriangle,
  Clock,
  CheckCircle2,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MaintenanceTable({ reports }: { reports: any[] }) {
  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow className="border-muted/50">
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest px-8 py-5">Request Date</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Unit & Tenant</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Category</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Description</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Priority</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest">Status</TableHead>
          <TableHead className="font-bold text-primary uppercase text-[10px] tracking-widest text-right px-8">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id} className="group hover:bg-slate-50/30 border-muted/30 transition-colors">
            <TableCell className="px-8 py-6">
              <div className="flex flex-col">
                <span className="font-bold text-primary">
                  {new Date(report.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                   {new Date(report.submittedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-bold text-primary">Unit {report.tenancy.unit.unitNumber}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{report.tenancy.tenant.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-slate-50 text-primary border-muted-foreground/10 text-[9px] font-bold uppercase tracking-wider">
                {report.type || "PLUMBING"}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[200px]">
              <p className="text-xs text-primary font-medium truncate">{report.description}</p>
            </TableCell>
            <TableCell>
               <Badge className={cn(
                  "rounded-full px-3 py-0.5 text-[9px] font-bold border-none",
                  report.priority === "URGENT" ? "bg-destructive/10 text-destructive" : 
                  report.priority === "HIGH" ? "bg-warning/10 text-warning" : 
                  "bg-primary/10 text-primary"
               )}>
                  {report.priority || "NORMAL"}
               </Badge>
            </TableCell>
            <TableCell>
              <Badge className={cn(
                "rounded-full px-3 py-1 text-[9px] font-bold border-none",
                report.status === "RESOLVED" ? "bg-success/10 text-success" : 
                report.status === "IN_PROGRESS" ? "bg-warning/10 text-warning" : 
                "bg-slate-100 text-muted-foreground"
              )}>
                {report.status}
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
        {reports.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium italic">
              No maintenance requests found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
