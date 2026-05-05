import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/messages/chat-interface";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      properties: {
        include: {
          tenancies: {
            where: { status: "ACTIVE" },
            include: { tenant: true, landlord: true }
          }
        }
      },
      tenantTenancies: {
        where: { status: "ACTIVE" },
        include: {
          property: true,
          landlord: true,
          tenant: true,
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  let activeTenancy = null;

  if (user.role === "LANDLORD") {
    // For MVP, if multiple tenancies, we might need a list. 
    // But let's pick the first one for now or provide a list.
    activeTenancy = user.properties.flatMap((p: any) => p.tenancies)[0];
  } else {
    activeTenancy = user.tenantTenancies[0];
  }

  if (!activeTenancy) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-serif text-primary">No active conversations</h1>
        <p className="text-muted-foreground">Join a property or invite a tenant to start messaging.</p>
      </div>
    );
  }

  const messages = await prisma.message.findMany({
    where: { tenancyId: activeTenancy.id },
    orderBy: { sentAt: "asc" },
  });

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen flex flex-col">
      <ChatInterface 
        tenancy={activeTenancy} 
        initialMessages={messages} 
        currentUser={user} 
      />
    </div>
  );
}
