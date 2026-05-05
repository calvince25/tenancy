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
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TENANT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tenancyId, amount, period, paymentReference } = paymentSchema.parse(body);

    const payment = await prisma.payment.create({
      data: {
        tenancyId,
        tenantId: session.user.id,
        amount,
        period,
        paymentReference,
        status: "PENDING",
      },
    });

    // Create a system message in the chat
    await prisma.message.create({
      data: {
        tenancyId,
        senderId: session.user.id,
        senderRole: "SYSTEM",
        type: "SYSTEM",
        content: `Rent paid for ${period} - KES ${amount.toLocaleString()}. Reference: ${paymentReference || "N/A"}`,
      }
    });

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
        content: `Rent payment for ${payment.period} was ${status.toLowerCase()} by landlord.`,
      }
    });

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
