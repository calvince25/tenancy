"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check, Share2 } from "lucide-react";

const propertySchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  type: z.enum(["HOUSE", "APARTMENT", "ROOM", "OTHER"]),
  monthlyRent: z.number().min(1, "Monthly rent must be at least 1"),
  rentDueDay: z.number().min(1).max(28),
});

type PropertyValues = z.infer<typeof propertySchema>;

export default function LandlordOnboarding() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [createdProperty, setCreatedProperty] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PropertyValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: "APARTMENT",
    },
  });

  async function onSubmit(data: PropertyValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      setCreatedProperty(result.property);
      setStep(2);
      toast.success("Property added successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const inviteLink = createdProperty
    ? `${window.location.origin}/join?code=${createdProperty.inviteCode}`
    : "";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h1 className="text-4xl font-serif text-primary mb-2">You're ready!</h1>
            <p className="text-muted-foreground">Now invite your tenant to join NestSync.</p>
          </div>

          <Card className="border-none shadow-lg bg-white">
            <CardHeader className="text-center">
              <CardTitle className="font-serif">{createdProperty.address}</CardTitle>
              <CardDescription>Share this code or QR code with your tenant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="p-4 bg-muted/30 rounded-2xl">
                <QRCodeSVG value={inviteLink} size={180} />
              </div>

              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Label>Invite Code</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted/50 h-12 flex items-center px-4 rounded-lg font-mono text-xl tracking-widest justify-center">
                      {createdProperty.inviteCode}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => copyToClipboard(createdProperty.inviteCode)}
                    >
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 flex gap-2"
                  onClick={() => copyToClipboard(inviteLink)}
                >
                  <Share2 className="w-4 h-4" />
                  Copy Invite Link
                </Button>

                <Button
                  className="w-full h-12 bg-primary text-white"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-primary mb-2">Welcome!</h1>
          <p className="text-muted-foreground">Let's set up your first property.</p>
        </div>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">Property Details</CardTitle>
            <CardDescription>
              This information will be shared with your tenant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address">Property Address</Label>
                <Input
                  id="address"
                  placeholder="123 Maple Street, Nairobi"
                  {...register("address")}
                  className="bg-white"
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select onValueChange={(v) => setValue("type", v as any)} defaultValue="APARTMENT">
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOUSE">House</SelectItem>
                      <SelectItem value="APARTMENT">Apartment</SelectItem>
                      <SelectItem value="ROOM">Single Room</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rentDueDay">Rent Due Day</Label>
                  <Input
                    id="rentDueDay"
                    type="number"
                    placeholder="1"
                    {...register("rentDueDay", { valueAsNumber: true })}
                    className="bg-white"
                  />
                  {errors.rentDueDay && (
                    <p className="text-xs text-destructive">{errors.rentDueDay.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent (KES)</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="45000"
                  {...register("monthlyRent", { valueAsNumber: true })}
                  className="bg-white"
                />
                {errors.monthlyRent && (
                  <p className="text-xs text-destructive">{errors.monthlyRent.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 bg-accent hover:bg-accent/90 text-white mt-4" disabled={isLoading}>
                {isLoading ? "Setting up..." : "Create Property & Generate Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

