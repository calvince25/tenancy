"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, User, CheckCircle2 } from "lucide-react";

export default function TenantOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [propertyInfo, setPropertyInfo] = useState<any>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setInviteCode(code);
    }
  }, [searchParams]);

  async function onVerify() {
    if (inviteCode.length !== 6) {
      toast.error("Invite code must be 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      setPropertyInfo(result);
      setStep(2);
      toast.success("Property found!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (step === 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h1 className="text-4xl font-serif text-primary mb-2">Welcome Home!</h1>
            <p className="text-muted-foreground">You've successfully joined the property.</p>
          </div>

          <Card className="border-none shadow-lg bg-white overflow-hidden">
            <div className="h-32 bg-accent/10 flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-accent animate-bounce" />
            </div>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">{propertyInfo.property.address}</CardTitle>
              <CardDescription>Managed by {propertyInfo.landlordName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                <Home className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Property Type</p>
                  <p className="font-medium capitalize">{propertyInfo.property.type.toLowerCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Landlord</p>
                  <p className="font-medium">{propertyInfo.landlordName}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full h-12 bg-primary text-white"
                onClick={() => router.push("/dashboard")}
              >
                Go to My Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-primary mb-2">Join a Property</h1>
          <p className="text-muted-foreground">Enter the invite code shared by your landlord.</p>
        </div>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-center">Enter Invite Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-center">
              <Label htmlFor="code" className="sr-only">Invite Code</Label>
              <Input
                id="code"
                placeholder="A1B2C3"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="h-16 text-center text-3xl font-mono tracking-[0.5em] bg-white border-2 focus:border-accent"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                The 6-character code can be found in the link shared with you.
              </p>
            </div>

            <Button 
              className="w-full h-12 bg-accent hover:bg-accent/90 text-white mt-4" 
              onClick={onVerify}
              disabled={isLoading || inviteCode.length !== 6}
            >
              {isLoading ? "Verifying..." : "Join Property"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
