import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const repairSchema = z.object({
  tenancyId: z.string(),
  category: z.string(),
  urgency: z.enum(["EMERGENCY", "SOON", "WHEN_POSSIBLE"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TENANT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tenancyId, category, urgency, description } = repairSchema.parse(body);

    const report = await prisma.repairReport.create({
      data: {
        tenancyId,
        tenantId: session.user.id,
        category,
        urgency,
        description,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json(report, { status: 201 });
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

    const { id, status, resolutionNote } = await req.json();

    const report = await prisma.repairReport.update({
      where: { id },
      data: {
        status,
        resolutionNote,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
        seenAt: status === "SEEN" ? new Date() : undefined,
      },
    });

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
