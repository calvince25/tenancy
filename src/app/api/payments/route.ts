import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const paymentSchema = z.object({
  tenancyId: z.string(),
  amount: z.number().min(1),
  period: z.string(),
  paymentReference: z.string().optional(),
  type: z.enum(["RENT", "WATER", "DEPOSIT", "OTHER"]).default("RENT"),
  method: z.enum(["MPESA", "CASH", "BANK_TRANSFER"]).default("MPESA"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = paymentSchema.parse(body);

    const payment = await prisma.payment.create({
      data: {
        tenancyId: data.tenancyId,
        tenantId: session.user.role === "TENANT" ? session.user.id : body.tenantId,
        amount: data.amount,
        period: data.period,
        type: data.type,
        method: data.method,
        paymentReference: data.paymentReference,
        status: session.user.role === "LANDLORD" ? "CONFIRMED" : "PENDING",
        confirmedAt: session.user.role === "LANDLORD" ? new Date() : undefined,
      },
    });

    // Create a system message in the chat
    await prisma.message.create({
      data: {
        tenancyId: data.tenancyId,
        senderId: session.user.id,
        senderRole: "SYSTEM",
        type: "SYSTEM",
        content: `${data.type} paid for ${data.period} - KES ${data.amount.toLocaleString()} via ${data.method}. Reference: ${data.paymentReference || "N/A"}`,
      }
    });

    // If it's a water bill payment, we should also mark the latest water bill for that month as paid
    if (data.type === "WATER") {
      await prisma.waterBill.updateMany({
        where: {
          tenancyId: data.tenancyId,
          month: data.period,
          status: "PENDING"
        },
        data: {
          status: "PAID"
        }
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
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

    const { id, status } = await req.json();

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        confirmedAt: status === "CONFIRMED" ? new Date() : undefined,
      },
    });

    // Create a system message in the chat
    await prisma.message.create({
      data: {
        tenancyId: payment.tenancyId,
        senderId: session.user.id,
        senderRole: "SYSTEM",
        type: "SYSTEM",
        content: `${payment.type} payment for ${payment.period} was ${status.toLowerCase()} by landlord.`,
      }
    });

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenancyId = searchParams.get("tenancyId");

    const payments = await prisma.payment.findMany({
      where: tenancyId ? { tenancyId } : { tenantId: session.user.id },
      orderBy: { submittedAt: "desc" }
    });

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
