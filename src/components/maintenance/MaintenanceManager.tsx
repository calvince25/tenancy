"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MaintenanceManagerProps {
  tenancies: any[];
  reports: any[];
  propertyId: string;
  propertyName: string;
}

export function MaintenanceManager({ tenancies, reports, propertyId, propertyName }: MaintenanceManagerProps) {
  const router = useRouter();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    tenancyId: "",
    category: "PLUMBING",
    urgency: "NORMAL",
    description: "",
    issue: "",
  });

  const [resolveData, setResolveData] = useState({
    cost: "",
    resolutionNote: "",
  });

  const handleOpenLog = () => {
    setFormData({
      tenancyId: "",
      category: "PLUMBING",
      urgency: "NORMAL",
      description: "",
      issue: "",
    });
    setIsLogModalOpen(true);
  };

  const handleLogRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to log maintenance request");
      }

      toast.success("Request logged and unit marked for attention");
      setIsLogModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedReport.id,
          status: "RESOLVED",
          ...resolveData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to resolve request");
      }

      toast.success("Maintenance request resolved and cost recorded");
      setIsResolveModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(r => 
    (r?.tenancy?.tenant?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (r?.tenancy?.unit?.unitNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (r?.issue?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const stats = {
    open: (reports || []).filter(r => r.status !== 'RESOLVED').length,
    urgent: (reports || []).filter(r => (r.urgency === 'URGENT' || r.urgency === 'EMERGENCY') && r.status !== 'RESOLVED').length,
    resolved: (reports || []).filter(r => r.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Maintenance & Repairs</h1>
          <p className="text-muted-foreground mt-1 font-medium">Tracking and managing repair requests for {propertyName}.</p>
        </div>
        <Button 
            onClick={handleOpenLog}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Open Requests", value: stats.open, icon: Clock, color: "text-orange-600 bg-orange-50" },
          { label: "Urgent Issues", value: stats.urgent, icon: AlertCircle, color: "text-red-600 bg-red-50" },
          { label: "Resolved (All time)", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
               <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-900">Maintenance Records</h3>
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="Search unit or issue..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 rounded-xl border-slate-200 bg-white"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {filteredReports.length === 0 ? (
             <div className="col-span-full py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <Wrench className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold italic">No maintenance records found matching your search.</p>
             </div>
           ) : (
             filteredReports.map((report) => (
                <div key={report.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group relative overflow-hidden hover:-translate-y-1 flex flex-col h-full min-w-0 break-words">
                  {report.status === "RESOLVED" ? (
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-20 transition-opacity rotate-12">
                        <CheckCircle className="w-32 h-32 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-20 transition-opacity rotate-12">
                        <Wrench className="w-32 h-32 text-amber-600" />
                    </div>
                  )}
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-2">
                           <Badge className={cn(
                                "w-fit rounded-full px-3 py-1 text-[9px] font-black tracking-widest border-none shadow-sm",
                                report.urgency === 'EMERGENCY' ? 'bg-red-50 text-red-600' : 
                                report.urgency === 'URGENT' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                           )}>
                               {report.urgency}
                           </Badge>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                               <Clock className="w-3 h-3" /> {new Date(report.createdAt).toLocaleDateString()}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="font-black text-slate-900">Unit {report.tenancy?.unit?.unitNumber || "N/A"}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{report.tenancy?.tenant?.name || "Unknown Tenant"}</p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-6 flex-grow">
                        <h4 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">{report.issue}</h4>
                        <p className="text-sm text-slate-500 line-clamp-3">{report.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex flex-col">
                            {report.status === "RESOLVED" && report.cost && (
                                <span className="text-xs font-black text-emerald-600 mt-1">Cost: KES {report.cost.toLocaleString()}</span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {report.status !== "RESOLVED" ? (
                                <Button 
                                    size="sm" 
                                    className="rounded-xl font-bold text-[10px] h-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                                    onClick={() => {
                                        setSelectedReport(report);
                                        setIsResolveModalOpen(true);
                                    }}
                                >
                                    Mark Resolved
                                </Button>
                            ) : (
                                <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 text-[9px] font-black tracking-widest">
                                    RESOLVED
                                </Badge>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                  </div>
                </div>
              ))
           )}
        </div>
      </div>

      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Wrench className="w-6 h-6 text-primary" />
                Log Maintenance Request
            </DialogTitle>
            <DialogDescription>Submit a new repair or maintenance request.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogRequest} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="font-bold">Unit / Tenant</Label>
              <Select value={formData.tenancyId} onValueChange={(v) => setFormData({...formData, tenancyId: v})}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                    {(tenancies || []).map(t => (
                        <SelectItem key={t.id} value={t.id}>
                            Unit {t.unit?.unitNumber || "N/A"} - {t.tenant?.name || "Unknown"}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-bold">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                        <SelectTrigger className="rounded-xl h-12">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="PLUMBING">Plumbing</SelectItem>
                            <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                            <SelectItem value="STRUCTURAL">Structural</SelectItem>
                            <SelectItem value="APPLIANCE">Appliance</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="font-bold">Urgency</Label>
                    <Select value={formData.urgency} onValueChange={(v) => setFormData({...formData, urgency: v})}>
                        <SelectTrigger className="rounded-xl h-12">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="EMERGENCY">Emergency</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                            <SelectItem value="WHEN_POSSIBLE">Low Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="issue" className="font-bold">Issue Title</Label>
                <Input 
                    id="issue"
                    value={formData.issue}
                    onChange={(e) => setFormData({...formData, issue: e.target.value})}
                    placeholder="e.g. Broken kitchen tap"
                    required
                    className="rounded-xl h-12"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="desc" className="font-bold">Full Description</Label>
                <Textarea 
                    id="desc"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the issue in detail..."
                    required
                    className="rounded-xl min-h-[100px]"
                />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading || !formData.tenancyId} className="w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20">
                {isLoading ? "Saving..." : "Log Maintenance Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Mark as Resolved</DialogTitle>
            <DialogDescription>Close this maintenance request and record the cost.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResolve} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="cost" className="font-bold text-slate-700">Total Repair Cost (KES)</Label>
              <Input 
                id="cost" 
                type="number"
                value={resolveData.cost}
                onChange={(e) => setResolveData({...resolveData, cost: e.target.value})}
                required
                autoFocus
                className="rounded-xl h-12 border-emerald-200 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note" className="font-bold text-slate-700">Resolution Note</Label>
              <Textarea 
                id="note" 
                value={resolveData.resolutionNote}
                onChange={(e) => setResolveData({...resolveData, resolutionNote: e.target.value})}
                className="rounded-xl"
                placeholder="Briefly describe what was fixed..."
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full rounded-xl font-bold h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">
                {isLoading ? "Updating..." : "Confirm & Close Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
