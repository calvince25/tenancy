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
import { Building2 } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
        body: JSON.stringify({ ...data, role: "LANDLORD" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      toast.success("Account created! Welcome to Renzo.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-0"></div>
      <div className="w-full max-w-md space-y-8 z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center text-white space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-[2rem] backdrop-blur-xl border border-white/20 shadow-2xl mb-4 group hover:bg-white/20 transition-all duration-500">
            <Building2 className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Renzo</h1>
          <p className="text-white/60 font-medium tracking-wide uppercase text-[10px]">Landlord Registration Portal</p>
        </div>

        <Card className="border-white/10 shadow-2xl bg-white/5 backdrop-blur-2xl text-white rounded-[2.5rem] overflow-hidden p-2">
          <div className="bg-white/5 p-8 rounded-[2rem]">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl font-bold text-center tracking-tight">
                Create Account
              </CardTitle>
              <CardDescription className="text-center text-white/50 font-medium">
                Join the premium property management suite
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/70 text-xs font-bold uppercase tracking-widest ml-1">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...register("name")}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-primary focus:border-primary transition-all duration-300"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400 font-medium mt-1 ml-1">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70 text-xs font-bold uppercase tracking-widest ml-1">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-primary focus:border-primary transition-all duration-300"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 font-medium mt-1 ml-1">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/70 text-xs font-bold uppercase tracking-widest ml-1">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-primary focus:border-primary transition-all duration-300"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-400 font-medium mt-1 ml-1">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/70 text-xs font-bold uppercase tracking-widest ml-1">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-primary focus:border-primary transition-all duration-300"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 font-medium mt-1 ml-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full h-14 bg-white text-[#0F172A] hover:bg-white/90 rounded-2xl font-bold text-lg shadow-xl shadow-white/5 transition-all duration-300 active:scale-[0.98] mt-4" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </div>

          <CardFooter className="flex justify-center p-6 bg-white/5 border-t border-white/5 rounded-b-[2rem]">
            <p className="text-sm text-white/40 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-white font-bold hover:underline underline-offset-4">
                Login here
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="text-center pt-4">
          <Link href="/" className="text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold uppercase tracking-[0.2em]">
            &larr; Back to Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
