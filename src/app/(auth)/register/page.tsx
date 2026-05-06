"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Home, Key } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"LANDLORD" | "TENANT">("LANDLORD");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      toast.success("Account created! Please log in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-cover bg-center"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>
      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center text-white">
          <h1 className="text-4xl font-serif mb-2">NestSync</h1>
          <p className="text-white/80">Your home. Sorted.</p>
        </div>

        <Card className="border border-white/20 shadow-xl bg-white/10 backdrop-blur-md text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-center">Create an account</CardTitle>
            <CardDescription className="text-center text-white/70">
              Choose your role and fill in your details to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="LANDLORD" onValueChange={(v) => setRole(v as any)} className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-black/20 p-1 border border-white/10">
                <TabsTrigger value="LANDLORD" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                  <Home className="w-4 h-4 mr-2" />
                  Landlord
                </TabsTrigger>
                <TabsTrigger value="TENANT" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                  <Key className="w-4 h-4 mr-2" />
                  Tenant
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register("name")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                />
                {errors.name && (
                  <p className="text-xs text-red-300">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                />
                {errors.email && (
                  <p className="text-xs text-red-300">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+254 700 000 000"
                  {...register("phone")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                />
                {errors.phone && (
                  <p className="text-xs text-red-300">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="bg-white/10 border-white/20 text-white focus-visible:ring-white/30"
                />
                {errors.password && (
                  <p className="text-xs text-red-300">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/10 p-6 mt-4">
            <p className="text-sm text-white/70">
              Already have an account?{" "}
              <Link href="/login" className="text-white font-medium hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
