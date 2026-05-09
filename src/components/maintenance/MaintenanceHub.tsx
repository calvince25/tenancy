"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Wrench, 
  Plus, 
  Search, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Filter,
  History,
  Tool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MaintenanceHubProps {
  tenancies: any[];
  reports: any[];
  propertyId: string;
  propertyName: string;
}

export function MaintenanceHub({ tenancies, reports, propertyId, propertyName }: MaintenanceHubProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
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

      toast.success("Maintenance request logged successfully");
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

      toast.success("Issue marked as resolved");
      setIsResolveModalOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/repairs?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete request");
      toast.success("Request deleted");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const activeReports = reports.filter(r => r.status !== 'RESOLVED');
  const resolvedReports = reports.filter(r => r.status === 'RESOLVED');
  const urgentReports = activeReports.filter(r => r.urgency === 'URGENT' || r.urgency === 'EMERGENCY');

  const getFilteredReports = () => {
    let base = activeTab === 'active' ? activeReports : activeTab === 'urgent' ? urgentReports : resolvedReports;
    return base.filter(r => 
      (r?.tenancy?.tenant?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (r?.tenancy?.unit?.unitNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (r?.issue?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );
  };

  const filteredReports = getFilteredReports();

  return (
    <div className="space-y-10 pb-32 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Tool className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Maintenance Hub</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-lg">
            Complete management of property upkeep for <span className="text-primary font-bold">{propertyName}</span>.
          </p>
        </div>
        <Button 
            onClick={handleOpenLog}
            className="bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold gap-3 h-14 px-8 shadow-2xl shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Log New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Active Jobs", value: activeReports.length, icon: Clock, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
          { label: "Urgent Priority", value: urgentReports.length, icon: AlertTriangle, color: "from-red-500 to-rose-600", bg: "bg-red-50" },
          { label: "Resolved Total", value: resolvedReports.length, icon: CheckCircle2, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <div key={i} className={cn("relative p-8 rounded-[3rem] border border-white shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500", stat.bg)}>
            <div className={cn("absolute -right-8 -bottom-8 opacity-[0.05] group-hover:opacity-[0.1] transition-all rotate-12")}>
               <stat.icon className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br", stat.color)}>
                <stat.icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs and Content */}
      <Tabs defaultValue="active" onValueChange={setActiveTab} className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto self-start border border-slate-200/50">
            <TabsTrigger value="active" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Active Requests
            </TabsTrigger>
            <TabsTrigger value="urgent" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm">
              Urgent Only
            </TabsTrigger>
            <TabsTrigger value="resolved" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">
              History
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by unit, tenant or issue..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-14 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filteredReports.length === 0 ? (
              <div className="col-span-full py-32 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
                  <Wrench className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 italic">No maintenance jobs in this view.</h3>
                <p className="text-slate-300 text-sm mt-2 max-w-xs mx-auto">Try clearing your filters or logging a new maintenance request.</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group flex flex-col h-full min-w-0 border-l-8 border-l-transparent hover:border-l-primary/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          "rounded-full px-4 py-1 text-[10px] font-black tracking-widest border-none shadow-sm",
                          report.urgency === 'EMERGENCY' ? 'bg-red-50 text-red-600' : 
                          report.urgency === 'URGENT' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                        )}>
                          {report.urgency}
                        </Badge>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {new Date(report.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase italic">{report.issue}</h4>
                    </div>
                    
                    <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100/50 sm:text-right w-full sm:w-auto">
                      <p className="font-black text-primary text-lg leading-none">Unit {report.tenancy?.unit?.unitNumber || "N/A"}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">{report.tenancy?.tenant?.name || "No Tenant Assigned"}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl mb-8 flex-grow">
                    <div className="flex items-center gap-2 text-primary mb-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{report.category || "General Repair"}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium italic break-words line-clamp-4">
                      "{report.description}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div className="flex flex-col">
                      {report.status === "RESOLVED" && report.cost ? (
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Cost</span>
                          <p className="text-xl font-black text-emerald-600 tracking-tighter">KES {report.cost.toLocaleString()}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">In Progress</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {report.status !== "RESOLVED" ? (
                        <Button 
                          onClick={() => {
                            setSelectedReport(report);
                            setIsResolveModalOpen(true);
                          }}
                          className="rounded-2xl font-bold text-xs h-12 px-6 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition-all active:scale-95"
                        >
                          Mark Resolved
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Done</span>
                        </div>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(report.id)}
                        className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Log Modal */}
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white relative overflow-hidden">
            <Tool className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" />
            <DialogHeader>
              <DialogTitle className="text-3xl font-black italic tracking-tight">Log Maintenance</DialogTitle>
              <DialogDescription className="text-white/70 font-medium italic">Create a new service ticket for your property.</DialogDescription>
            </DialogHeader>
          </div>
          
          <form onSubmit={handleLogRequest} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Unit / Resident</Label>
              <Select value={formData.tenancyId} onValueChange={(v) => setFormData({...formData, tenancyId: v})}>
                <SelectTrigger className="rounded-2xl h-14 border-slate-200 bg-slate-50 font-bold">
                  <SelectValue placeholder="Which unit needs attention?" />
                </SelectTrigger>
                <SelectContent className="rounded-3xl p-2">
                    {(tenancies || []).map(t => (
                        <SelectItem key={t.id} value={t.id} className="rounded-xl py-3 font-medium">
                            Unit {t.unit?.unitNumber || "N/A"} — {t.tenant?.name || "Unknown"}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Issue Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                        <SelectTrigger className="rounded-2xl h-14 border-slate-200 bg-slate-50 font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-3xl p-2">
                            <SelectItem value="PLUMBING" className="rounded-xl py-3">Plumbing</SelectItem>
                            <SelectItem value="ELECTRICAL" className="rounded-xl py-3">Electrical</SelectItem>
                            <SelectItem value="STRUCTURAL" className="rounded-xl py-3">Structural</SelectItem>
                            <SelectItem value="APPLIANCE" className="rounded-xl py-3">Appliance</SelectItem>
                            <SelectItem value="OTHER" className="rounded-xl py-3">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Urgency Level</Label>
                    <Select value={formData.urgency} onValueChange={(v) => setFormData({...formData, urgency: v})}>
                        <SelectTrigger className="rounded-2xl h-14 border-slate-200 bg-slate-50 font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-3xl p-2">
                            <SelectItem value="EMERGENCY" className="rounded-xl py-3 text-red-600 font-bold italic">Emergency</SelectItem>
                            <SelectItem value="URGENT" className="rounded-xl py-3 text-orange-600 font-bold">Urgent</SelectItem>
                            <SelectItem value="NORMAL" className="rounded-xl py-3">Normal</SelectItem>
                            <SelectItem value="WHEN_POSSIBLE" className="rounded-xl py-3">Low Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="issue" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quick Summary</Label>
                <Input 
                    id="issue"
                    value={formData.issue}
                    onChange={(e) => setFormData({...formData, issue: e.target.value})}
                    placeholder="e.g. Leaking shower head"
                    required
                    className="rounded-2xl h-14 border-slate-200 bg-slate-50 font-bold focus:bg-white"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Detailed Description</Label>
                <Textarea 
                    id="desc"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tell us more about the issue..."
                    required
                    className="rounded-2xl min-h-[120px] border-slate-200 bg-slate-50 font-medium focus:bg-white p-4"
                />
            </div>

            <DialogFooter className="pt-4 gap-4">
              <Button type="button" variant="ghost" onClick={() => setIsLogModalOpen(false)} className="rounded-2xl font-bold h-14 flex-1">
                Discard
              </Button>
              <Button type="submit" disabled={isLoading || !formData.tenancyId} className="flex-[2] rounded-2xl font-bold h-14 shadow-xl shadow-primary/20">
                {isLoading ? "Creating Ticket..." : "Log Maintenance Hub Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-emerald-500 p-8 text-white relative overflow-hidden">
            <CheckCircle className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" />
            <DialogHeader>
              <DialogTitle className="text-3xl font-black italic tracking-tight">Close Ticket</DialogTitle>
              <DialogDescription className="text-white/70 font-medium italic">Record the final resolution and cost of repair.</DialogDescription>
            </DialogHeader>
          </div>
          
          <form onSubmit={handleResolve} className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Repair Cost (KES)</Label>
              <Input 
                id="cost" 
                type="number"
                value={resolveData.cost}
                onChange={(e) => setResolveData({...resolveData, cost: e.target.value})}
                required
                autoFocus
                className="rounded-2xl h-16 border-emerald-100 bg-emerald-50/50 text-emerald-900 text-3xl font-black focus:bg-white transition-all text-center"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Resolution Summary</Label>
              <Textarea 
                id="note" 
                value={resolveData.resolutionNote}
                onChange={(e) => setResolveData({...resolveData, resolutionNote: e.target.value})}
                className="rounded-2xl min-h-[100px] border-slate-200 bg-slate-50 font-medium focus:bg-white p-4"
                placeholder="Briefly describe what was fixed..."
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full rounded-2xl font-bold h-14 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200 uppercase tracking-widest">
                {isLoading ? "Updating Hub..." : "Confirm & Resolve Job"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
