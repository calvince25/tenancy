"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Wrench, Clock, CheckCircle2, AlertTriangle, Plus, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function RepairList({ reports: initialReports, userRole, tenancyId }: any) {
  const [reports, setReports] = useState(initialReports);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newReport, setNewReport] = useState({
    category: "PLUMBING",
    urgency: "SOON",
    description: "",
  });

  async function handleAddReport() {
    if (newReport.description.length < 10) {
      toast.error("Please describe the issue in more detail (min 10 characters)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newReport, tenancyId }),
      });

      if (response.ok) {
        const report = await response.json();
        setReports([report, ...reports]);
        setIsAdding(false);
        setNewReport({ category: "PLUMBING", urgency: "SOON", description: "" });
        toast.success("Report submitted!");
      }
    } catch (error) {
      toast.error("Failed to submit report");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateStatus(reportId: string, status: string) {
    try {
      const response = await fetch("/api/repairs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId, status }),
      });

      if (response.ok) {
        setReports(reports.map((r: any) => r.id === reportId ? { ...r, status } : r));
        toast.success(`Status updated to ${status}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="space-y-6">
      {userRole === "TENANT" && (
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white gap-2 h-12 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Report a Problem
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="font-serif">New Repair Report</DialogTitle>
              <p className="text-sm text-muted-foreground">What's happening? When did it start?</p>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={(v) => setNewReport({ ...newReport, category: v })} defaultValue="PLUMBING">
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLUMBING">🚿 Plumbing</SelectItem>
                      <SelectItem value="ELECTRICAL">⚡ Electrical</SelectItem>
                      <SelectItem value="HVAC">🌡 HVAC</SelectItem>
                      <SelectItem value="STRUCTURAL">🏚 Structural</SelectItem>
                      <SelectItem value="OTHER">📝 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select onValueChange={(v: any) => setNewReport({ ...newReport, urgency: v })} defaultValue="SOON">
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMERGENCY">🔴 Emergency</SelectItem>
                      <SelectItem value="SOON">🟡 Soon</SelectItem>
                      <SelectItem value="WHEN_POSSIBLE">⚪ When possible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe the problem here..." 
                  className="bg-white min-h-[120px]"
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddReport} disabled={isLoading} className="w-full bg-accent text-white">
                {isLoading ? "Submitting..." : "Send Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid gap-6">
        {reports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-muted text-muted-foreground">
            <Wrench className="w-10 h-10 mx-auto mb-4 opacity-20" />
            <p>No repair reports yet.</p>
          </div>
        ) : (
          reports.map((report: any) => (
            <Card key={report.id} className="border-none shadow-sm bg-white overflow-hidden group">
              <div className="flex flex-col md:flex-row">
                <div className={cn(
                  "p-6 flex flex-col items-center justify-center text-center md:w-32 shrink-0 border-b md:border-b-0 md:border-r border-muted/50",
                  report.urgency === "EMERGENCY" ? "bg-destructive/5" : "bg-muted/30"
                )}>
                  {report.status === "RESOLVED" ? (
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  ) : report.urgency === "EMERGENCY" ? (
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  ) : (
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  )}
                  <Badge variant="outline" className={cn(
                    "mt-3 border-none",
                    report.status === "RESOLVED" ? "bg-success/10 text-success" : 
                    report.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                  )}>
                    {report.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg text-primary">{report.category}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs font-medium text-muted-foreground">{format(new Date(report.submittedAt), "MMM d, yyyy")}</span>
                    </div>
                    {report.urgency === "EMERGENCY" && (
                      <Badge className="bg-destructive text-white border-none">EMERGENCY</Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {report.description}
                  </p>
                  
                  {userRole === "LANDLORD" && report.status !== "RESOLVED" && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateStatus(report.id, "IN_PROGRESS")}
                        disabled={report.status === "IN_PROGRESS"}
                      >
                        In Progress
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-success hover:bg-success/90 text-white"
                        onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                      >
                        Mark Fixed
                      </Button>
                    </div>
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
