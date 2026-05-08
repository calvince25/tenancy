import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const waterBillSchema = z.object({
  tenancyId: z.string(),
  previousReading: z.number(),
  currentReading: z.number(),
  ratePerUnit: z.number().default(100),
  month: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = waterBillSchema.parse(body);

    const unitsUsed = data.currentReading - data.previousReading;
    const totalAmount = unitsUsed * data.ratePerUnit;

    const waterBill = await prisma.waterBill.create({
      data: {
        tenancyId: data.tenancyId,
        previousReading: data.previousReading,
        currentReading: data.currentReading,
        unitsUsed,
        ratePerUnit: data.ratePerUnit,
        totalAmount,
        month: data.month,
      },
    });

    return NextResponse.json(waterBill, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, currentReading, unitsUsed, totalAmount, status } = body;

    const bill = await prisma.waterBill.update({
      where: { id },
      data: {
        currentReading,
        unitsUsed,
        totalAmount,
        status,
      },
    });

    return NextResponse.json(bill);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenancyId = searchParams.get("tenancyId");
    const propertyId = searchParams.get("propertyId");

    if (tenancyId) {
      const bills = await prisma.waterBill.findMany({
        where: { tenancyId },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(bills);
    }

    if (propertyId) {
      const bills = await prisma.waterBill.findMany({
        where: {
          tenancy: {
            propertyId: propertyId
          }
        },
        include: {
          tenancy: {
            include: {
              tenant: true,
              unit: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(bills);
    }

    return NextResponse.json({ message: "Tenancy ID or Property ID is required" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
