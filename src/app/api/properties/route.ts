import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { nanoid } from "nanoid";

const propertySchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  type: z.enum(["HOUSE", "APARTMENT", "ROOM", "OTHER"]),
  photoUrl: z.string().optional(),
  waterRate: z.number().optional(),
  autoWaterBills: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = propertySchema.parse(body);

    const inviteCode = nanoid(6).toUpperCase();

    const property = await prisma.property.create({
      data: {
        address: data.address,
        type: data.type,
        photoUrl: data.photoUrl,
        landlordId: session.user.id,
        inviteCode,
        inviteExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;
    const data = propertySchema.partial().parse(updateData);

    const property = await prisma.property.update({
      where: { id, landlordId: session.user.id },
      data,
    });

    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await prisma.property.delete({
      where: { id, landlordId: session.user.id },
    });

    return NextResponse.json({ message: "Property deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete property" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (query) {
      const properties = await prisma.property.findMany({
        where: {
          address: {
            contains: query,
            mode: 'insensitive'
          }
        },
        include: {
          landlord: {
            select: { name: true }
          }
        },
        take: 10
      });
      return NextResponse.json(properties);
    }

    return NextResponse.json({ message: "Query required" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "Search failed" }, { status: 500 });
  }
}
