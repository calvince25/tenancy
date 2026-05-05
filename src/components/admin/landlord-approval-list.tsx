"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";

export function LandlordApprovalList({ initialLandlords }: { initialLandlords: any[] }) {
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
        toast.success(approve ? "Landlord approved!" : "Landlord unapproved");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  if (landlords.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-muted text-muted-foreground">
        <User className="w-10 h-10 mx-auto mb-4 opacity-20" />
        <p>No other landlords have registered yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {landlords.map((landlord) => (
        <Card key={landlord.id} className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {landlord.name?.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-xl text-primary">{landlord.name}</p>
                  <Badge variant="outline" className={landlord.isApproved ? "bg-success/10 text-success border-none" : "bg-amber-100 text-amber-700 border-none"}>
                    {landlord.isApproved ? "Approved" : "Pending"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{landlord.email} • Joined {format(new Date(landlord.createdAt), "MMM d, yyyy")}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {landlord.isApproved ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/5 gap-2"
                  onClick={() => handleAction(landlord.id, false)}
                >
                  <X className="w-4 h-4" />
                  Unapprove
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-success hover:bg-success/90 text-white gap-2"
                  onClick={() => handleAction(landlord.id, true)}
                >
                  <Check className="w-4 h-4" />
                  Approve Access
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
