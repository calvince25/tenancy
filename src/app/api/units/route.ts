import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const unitSchema = z.object({
  propertyId: z.string(),
  unitNumber: z.string().min(1, "Unit number is required"),
  ownerName: z.string().optional().nullable(),
  ownerPhone: z.string().optional().nullable(),
  type: z.enum(["HOUSE", "APARTMENT", "ROOM", "OTHER"]),
  status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE"]),
  monthlyRent: z.number().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ message: "Property ID is required" }, { status: 400 });
    }

    const units = await prisma.unit.findMany({
      where: { propertyId },
      include: {
        tenancies: {
          where: { status: "ACTIVE" },
          include: { tenant: true }
        }
      },
      orderBy: { unitNumber: "asc" }
    });

    return NextResponse.json(units);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = unitSchema.parse(body);

    // Check for uniqueness within the same property
    const existingUnit = await prisma.unit.findFirst({
      where: {
        propertyId: data.propertyId,
        unitNumber: data.unitNumber
      }
    });

    if (existingUnit) {
      return NextResponse.json({ message: `Unit ${data.unitNumber} already exists in this property` }, { status: 400 });
    }

    const unit = await prisma.unit.create({
      data: {
        propertyId: data.propertyId,
        unitNumber: data.unitNumber,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        type: data.type,
        status: data.status,
        monthlyRent: data.monthlyRent,
      },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
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
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ message: "Unit ID is required" }, { status: 400 });
    }

    // Check for uniqueness if unitNumber is changed
    if (data.unitNumber) {
        const existingUnit = await prisma.unit.findFirst({
            where: {
              propertyId: data.propertyId,
              unitNumber: data.unitNumber,
              NOT: { id }
            }
          });
      
          if (existingUnit) {
            return NextResponse.json({ message: `Unit ${data.unitNumber} already exists in this property` }, { status: 400 });
          }
    }

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        unitNumber: data.unitNumber,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        type: data.type,
        status: data.status,
        monthlyRent: data.monthlyRent,
      },
    });

    return NextResponse.json(unit);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ message: "Unit ID is required" }, { status: 400 });
    }

    await prisma.unit.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Unit deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
