"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"LANDLORD" | "TENANT">("LANDLORD");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginValues) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        role: role,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          throw new Error("Invalid email or password");
        }
        throw new Error(result.error);
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
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
            <CardTitle className="text-2xl font-serif text-center">Log in</CardTitle>
            <CardDescription className="text-center text-white/70">
              Enter your email and password to access your dashboard.
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Link href="#" className="text-xs text-white/70 hover:text-white hover:underline">
                    Forgot password?
                  </Link>
                </div>
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
                {isLoading ? "Logging in..." : "Log in"}
              </Button>

            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/10 p-6 mt-4">
            <p className="text-sm text-white/70">
              Don't have an account?{" "}
              <Link href="/register" className="text-white font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
