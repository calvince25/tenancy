"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Check, X, Clock, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function LandlordApprovalList({ 
    initialLandlords, 
    currentUserId 
}: { 
    initialLandlords: any[], 
    currentUserId: string 
}) {
  const [landlords, setLandlords] = useState(initialLandlords);

  async function handleAction(userId: string, approve: boolean) {
    try {
      const response = await fetch("/api/admin/approve-landlord", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, approve }),
      });

      if (response.ok) {
        setLandlords(landlords.map((l: any) => 
          l.id === userId ? { ...l, isApproved: approve } : l
        ));
        toast.success(approve ? "Access authorized" : "Access revoked");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    
    try {
      const response = await fetch(`/api/admin/approve-landlord?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLandlords(landlords.filter((l: any) => l.id !== userId));
        toast.success("User deleted successfully");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="space-y-6">
      {landlords.map((landlord) => (
        <Card key={landlord.id} className={cn(
            "border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden transition-all",
            landlord.id === currentUserId ? "ring-2 ring-primary/20 shadow-xl" : "hover:shadow-md"
        )}>
          <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl shadow-sm",
                  landlord.isDefault ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
              )}>
                {landlord.name?.charAt(0)}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-black text-2xl text-slate-900 tracking-tight italic">
                    {landlord.name} {landlord.id === currentUserId && <span className="text-primary/40 font-medium not-italic">(You)</span>}
                  </p>
                  {landlord.isDefault ? (
                      <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                          Default Landlord
                      </Badge>
                  ) : (
                      <Badge variant="outline" className={cn(
                          "font-black text-[10px] uppercase tracking-widest px-3 py-1 border-none shadow-sm",
                          landlord.isApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                          {landlord.isApproved ? "Authorized" : "Pending Authorization"}
                      </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium italic">
                    {landlord.email} • {landlord.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              {!landlord.isDefault && (
                  <>
                      {landlord.isApproved ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-12 px-6 rounded-2xl font-bold text-amber-600 hover:bg-amber-50 gap-2 border border-amber-100/50"
                          onClick={() => handleAction(landlord.id, false)}
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Revoke
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="h-12 px-6 rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white gap-2 shadow-lg shadow-emerald-200"
                          onClick={() => handleAction(landlord.id, true)}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Authorize
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        onClick={() => handleDelete(landlord.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                  </>
              )}
              {landlord.isDefault && (
                   <div className="px-4 py-2 bg-slate-50 rounded-xl flex items-center gap-2 text-slate-400">
                        <Check className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active System Root</span>
                   </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
