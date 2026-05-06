import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  User, 
  MapPin, 
  ChevronLeft, 
  MoreVertical,
  Calendar,
  CreditCard,
  Droplets,
  Wrench,
  TrendingUp,
  Mail,
  Phone,
  AlertTriangle,
  History
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default async function TenantProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const tenant = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      tenantTenancies: {
        include: {
          property: true,
          unit: true,
          payments: { orderBy: { submittedAt: "desc" } },
          waterBills: { orderBy: { createdAt: "desc" } },
          repairReports: { orderBy: { submittedAt: "desc" } }
        }
      }
    }
  });

  if (!tenant) {
    notFound();
  }

  const activeTenancy = tenant.tenantTenancies.find(t => t.status === "ACTIVE");

  if (!activeTenancy) {
    // Handle tenant without active tenancy
    return (
       <div className="p-10 text-center">
          <p>This tenant has no active tenancy.</p>
          <Link href="/dashboard/tenants">
            <Button variant="outline" className="mt-4">Back to Tenants</Button>
          </Link>
       </div>
    );
  }

  // Calculate balance
  const totalRentPaid = activeTenancy.payments.filter(p => p.type === "RENT" && p.status === "CONFIRMED").reduce((acc, p) => acc + p.amount, 0);
  const totalWaterPaid = activeTenancy.payments.filter(p => p.type === "WATER" && p.status === "CONFIRMED").reduce((acc, p) => acc + p.amount, 0);
  const totalWaterBilled = activeTenancy.waterBills.reduce((acc, w) => acc + w.totalAmount, 0);
  
  // Simplified arrears calculation (just for demonstration)
  const rentArrears = activeTenancy.monthlyRent * 1 - totalRentPaid; // Assuming 1 month due for demo
  const waterArrears = totalWaterBilled - totalWaterPaid;
  const totalOwed = Math.max(0, rentArrears) + Math.max(0, waterArrears);

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tenants">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-primary">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
             <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                <AvatarImage src={tenant.profilePhotoUrl || ""} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold text-xl">
                  {tenant.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
             </Avatar>
             <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">{tenant.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className="bg-success/10 text-success border-none font-bold uppercase text-[10px] tracking-widest">Active Resident</Badge>
                  <span className="text-muted-foreground text-sm flex items-center gap-1 font-medium">
                    Unit {activeTenancy.unit?.unitNumber} • {activeTenancy.property.address}
                  </span>
                </div>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-muted-foreground/10 font-bold gap-2 h-11 px-6">
             End Lease
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Pencil className="w-4 h-4" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1 space-y-8">
           {/* Balance Summary Card */}
          <Card className="border-none shadow-xl card-gradient-3 text-white rounded-[2rem] overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Total Outstanding</p>
                <AlertTriangle className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-1 mb-8">
                <p className="text-4xl font-bold">KES {totalOwed.toLocaleString()}</p>
                <p className="text-xs opacity-70 flex items-center gap-2">
                   Includes Rent & Water Arrears
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-70">Rent Arrears</span>
                  <span className="font-bold">KES {Math.max(0, rentArrears).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-70">Water Arrears</span>
                  <span className="font-bold">KES {Math.max(0, waterArrears).toLocaleString()}</span>
                </div>
              </div>
              
              <Button className="w-full mt-8 bg-white text-destructive hover:bg-white/90 font-bold rounded-xl border-none">
                Send Payment Reminder
              </Button>
            </CardContent>
          </Card>

          {/* Personal Details Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-muted/40 space-y-6">
             <h3 className="font-bold text-primary uppercase text-xs tracking-widest">Personal Details</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-primary border border-muted/30">
                      <Mail className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</span>
                      <span className="text-sm font-medium text-primary">{tenant.email}</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-primary border border-muted/30">
                      <Phone className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number</span>
                      <span className="text-sm font-medium text-primary">{tenant.phone}</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-primary border border-muted/30">
                      <Users className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Emergency Contact</span>
                      <span className="text-sm font-medium text-primary">Jane Doe (Sister)</span>
                      <span className="text-[10px] text-muted-foreground">0712 345 678</span>
                   </div>
                </div>
             </div>

             <div className="h-px bg-muted/50 my-6" />

             <h3 className="font-bold text-primary uppercase text-xs tracking-widest">Lease Summary</h3>
             <div className="space-y-3">
                <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Start Date</span>
                   <span className="font-bold">{new Date(activeTenancy.startDate).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">End Date</span>
                   <span className="font-bold">{activeTenancy.endDate ? new Date(activeTenancy.endDate).toLocaleDateString('en-GB') : "Ongoing"}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Deposit Paid</span>
                   <span className="font-bold text-success">KES {activeTenancy.depositAmount?.toLocaleString() || 0}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-8">
           {/* Navigation Tabs for History */}
           <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
              <Button className="bg-white text-primary font-bold rounded-xl shadow-sm border-none px-6">Payment History</Button>
              <Button variant="ghost" className="text-muted-foreground font-bold hover:text-primary rounded-xl px-6">Water Bills</Button>
              <Button variant="ghost" className="text-muted-foreground font-bold hover:text-primary rounded-xl px-6">Maintenance</Button>
           </div>

           {/* History Table */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-muted/40">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-primary">Rent Payment History</h2>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl font-bold h-10 px-6 gap-2">
                       <CreditCard className="w-4 h-4" /> Record Payment
                    </Button>
                 </div>
              </div>

              <div className="space-y-4">
                 {activeTenancy.payments.filter(p => p.type === "RENT").map((payment, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-muted/30 group hover:border-primary/30 transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                             "w-12 h-12 rounded-xl flex items-center justify-center font-bold",
                             payment.status === "CONFIRMED" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          )}>
                             {payment.status === "CONFIRMED" ? "✓" : "!"}
                          </div>
                          <div>
                             <p className="font-bold text-primary">{payment.period || "Current Month"}</p>
                             <p className="text-[10px] text-muted-foreground font-medium uppercase">{new Date(payment.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} • {payment.method}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-lg font-bold text-primary">KES {payment.amount.toLocaleString()}</p>
                          <Badge variant="outline" className={cn(
                             "text-[8px] font-bold border-none",
                             payment.status === "CONFIRMED" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          )}>
                             {payment.status}
                          </Badge>
                       </div>
                    </div>
                 ))}
                 {activeTenancy.payments.filter(p => p.type === "RENT").length === 0 && (
                    <div className="py-12 text-center text-muted-foreground italic">
                       No payment history found for this tenancy.
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
