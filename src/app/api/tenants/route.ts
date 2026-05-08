import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const tenantSchema = z.object({
  propertyId: z.string(),
  unitId: z.string(),
  name: z.string().min(2),
  phone: z.string().min(10),
  nationalId: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  monthlyRent: z.number(),
  depositAmount: z.number().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = tenantSchema.parse(body);

    // 1. Find or Create User
    // If no email provided, we generate a dummy one based on phone
    const email = data.email || `${data.phone}@renzo.com`;
    
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone: data.phone }
        ]
      }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(data.phone, 12); // Default password is phone
      user = await prisma.user.create({
        data: {
          name: data.name,
          email,
          phone: data.phone,
          nationalId: data.nationalId,
          password: hashedPassword,
          role: "TENANT",
          isApproved: true,
        }
      });
    }

    // 2. Check if unit is vacant
    const unit = await prisma.unit.findUnique({
      where: { id: data.unitId }
    });

    if (!unit || unit.status !== "VACANT") {
      return NextResponse.json({ message: "Selected unit is not vacant" }, { status: 400 });
    }

    // 3. Create Tenancy
    const tenancy = await prisma.tenancy.create({
      data: {
        propertyId: data.propertyId,
        unitId: data.unitId,
        tenantId: user.id,
        landlordId: session.user.id,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        monthlyRent: data.monthlyRent,
        depositAmount: data.depositAmount || 0,
        rentDueDay: 1, // Default to 1st of month
        status: "ACTIVE",
      }
    });

    // 4. Mark unit as occupied
    await prisma.unit.update({
      where: { id: data.unitId },
      data: { status: "OCCUPIED" }
    });

    return NextResponse.json(tenancy, { status: 201 });
  } catch (error: any) {
    console.error("Add Tenant Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
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

    if (!id) return NextResponse.json({ message: "Tenancy ID is required" }, { status: 400 });

    const tenancy = await prisma.tenancy.update({
      where: { id },
      data: {
        monthlyRent: data.monthlyRent,
        depositAmount: data.depositAmount,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: { tenant: true }
    });

    // Update user details if provided
    if (data.name || data.phone || data.nationalId) {
        await prisma.user.update({
            where: { id: tenancy.tenantId },
            data: {
                name: data.name,
                phone: data.phone,
                nationalId: data.nationalId,
            }
        });
    }

    return NextResponse.json(tenancy);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
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

    if (!id) return NextResponse.json({ message: "Tenancy ID is required" }, { status: 400 });

    const tenancy = await prisma.tenancy.findUnique({
        where: { id },
        include: { unit: true }
    });

    if (!tenancy) return NextResponse.json({ message: "Tenancy not found" }, { status: 404 });

    // Mark unit as vacant again
    if (tenancy.unitId) {
        await prisma.unit.update({
            where: { id: tenancy.unitId },
            data: { status: "VACANT" }
        });
    }

    // Delete tenancy (we keep the User record for history/security)
    await prisma.tenancy.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tenant record removed and unit marked vacant" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
  }
}
