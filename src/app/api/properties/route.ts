import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { nanoid } from "nanoid";

const propertySchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  type: z.enum(["HOUSE", "APARTMENT", "ROOM", "OTHER"]),
  monthlyRent: z.number().min(1),
  rentDueDay: z.number().min(1).max(28),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { address, type, monthlyRent, rentDueDay } = propertySchema.parse(body);

    const inviteCode = nanoid(6).toUpperCase();

    const property = await prisma.property.create({
      data: {
        address,
        type,
        landlordId: session.user.id,
        inviteCode,
        inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create a "pending" tenancy structure if needed, or just keep the property
    // For MVP, we'll wait for the tenant to join to create the Tenancy record.

    return NextResponse.json(
      { message: "Property created successfully", property },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
