import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const joinSchema = z.object({
  inviteCode: z.string().length(6, "Code must be 6 characters"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TENANT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { inviteCode } = joinSchema.parse(body);

    const property = await prisma.property.findUnique({
      where: { inviteCode },
      include: { landlord: true },
    });

    if (!property) {
      return NextResponse.json({ message: "Invalid invite code" }, { status: 404 });
    }

    // Check if invite expired
    if (new Date() > property.inviteExpiresAt) {
      return NextResponse.json({ message: "Invite code has expired" }, { status: 400 });
    }

    // Check if property already has an active tenancy
    const existingTenancy = await prisma.tenancy.findFirst({
      where: { propertyId: property.id, status: "ACTIVE" },
    });

    if (existingTenancy) {
      return NextResponse.json({ message: "This property already has an active tenant" }, { status: 400 });
    }

    // Create the Tenancy record
    const tenancy = await prisma.tenancy.create({
      data: {
        propertyId: property.id,
        landlordId: property.landlordId,
        tenantId: session.user.id,
        startDate: new Date(),
        status: "ACTIVE",
        monthlyRent: 0, // Should be pulled from property settings in a more complex app, 
                        // for now we'll let landlord set it or use property default if we had it.
                        // For simplicity, we'll initialize it to 0 and landlord can update.
        rentDueDay: 1, 
      },
    });

    return NextResponse.json(
      { message: "Joined successfully", property, landlordName: property.landlord.name },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
