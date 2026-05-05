"use client";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building2, User, Key, Share2, MoreHorizontal, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

export function PropertiesList({ properties }: any) {
  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
  };

  return (
    <div className="grid gap-6">
      {properties.map((property: any) => {
        const activeTenancy = property.tenancies[0];
        const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/join?code=${property.inviteCode}`;

        return (
          <Card key={property.id} className="border-none shadow-sm bg-white overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-72 h-48 lg:h-auto bg-muted shrink-0 relative">
                {property.photoUrl ? (
                  <img src={property.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                    <Building2 className="w-20 h-20" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-primary/90 text-white border-none backdrop-blur-sm">
                    {property.type}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-serif text-primary">{property.address}</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        "border-none",
                        activeTenancy ? "bg-success/10 text-success" : "bg-amber-100 text-amber-700"
                      )}>
                        {activeTenancy ? "Active Tenancy" : "Waiting for Tenant"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {activeTenancy ? (
                    <div className="bg-muted/30 p-4 rounded-2xl space-y-3">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Tenant Information</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {activeTenancy.tenant.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{activeTenancy.tenant.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <a href={`tel:${activeTenancy.tenant.phone}`} className="text-muted-foreground hover:text-primary"><Phone className="w-3 h-3" /></a>
                            <a href={`mailto:${activeTenancy.tenant.email}`} className="text-muted-foreground hover:text-primary"><Mail className="w-3 h-3" /></a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-4 rounded-2xl flex flex-col justify-between">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Invite Pending</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-mono tracking-widest text-primary">{property.inviteCode}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">Expires in 7 days</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-accent gap-2"
                          onClick={() => copyInviteCode(property.inviteCode)}
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border border-dashed border-muted rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Invite QR Code</p>
                      <p className="text-xs text-muted-foreground">Tenant scans to join</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <QRCodeSVG value={inviteLink} size={48} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
