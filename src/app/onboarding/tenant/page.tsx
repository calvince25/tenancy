"use client";

import { useState, useEffect, Suspense } from "react";
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

function TenantOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [propertyInfo, setPropertyInfo] = useState<any>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      handleJoinByCode(code);
    }
  }, [searchParams]);

  async function handleSearch() {
    if (searchQuery.length < 3) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/properties?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoinByCode(code: string) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setPropertyInfo(result);
      setStep(2);
      toast.success("Joined property!");
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
            <h1 className="text-4xl font-serif text-primary mb-2 font-bold">Welcome Home!</h1>
            <p className="text-muted-foreground">You've successfully joined the property.</p>
          </div>

          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <div className="h-40 bg-primary/5 flex items-center justify-center">
              <CheckCircle2 className="w-20 h-20 text-success animate-bounce" />
            </div>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-3xl font-bold">{propertyInfo.property.address}</CardTitle>
              <CardDescription className="text-base">Managed by {propertyInfo.landlordName}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                className="w-full h-12 bg-primary text-white text-lg font-bold"
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
          <h1 className="text-4xl font-serif text-primary mb-2 font-bold">Find Your Home</h1>
          <p className="text-muted-foreground italic">Search for your property or enter an invite code.</p>
        </div>

        <Card className="border-none shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Property Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Search by Address</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Garden View"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>Search</Button>
              </div>
            </div>

            <div className="space-y-2">
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      className="w-full text-left p-3 rounded-xl border border-muted hover:border-primary hover:bg-primary/5 transition-all flex flex-col gap-1 group"
                      onClick={() => handleJoinByCode(p.inviteCode)}
                    >
                      <span className="font-bold text-sm group-hover:text-primary transition-colors">{p.address}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">Landlord: {p.landlord.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-bold">Or use code</span></div>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="INVITE CODE"
                className="h-12 text-center font-mono tracking-widest text-xl"
                maxLength={6}
                onChange={(e) => e.target.value.length === 6 && handleJoinByCode(e.target.value.toUpperCase())}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TenantOnboarding() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-4 sm:p-8"><p>Loading...</p></div>}>
      <TenantOnboardingContent />
    </Suspense>
  );
}
