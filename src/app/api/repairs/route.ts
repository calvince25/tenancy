import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const repairSchema = z.object({
  tenancyId: z.string(),
  category: z.string(),
  urgency: z.enum(["EMERGENCY", "URGENT", "SOON", "NORMAL", "WHEN_POSSIBLE"]),
  description: z.string().min(5),
  issue: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = repairSchema.parse(body);

    const tenancy = await prisma.tenancy.findUnique({
        where: { id: data.tenancyId },
        select: { tenantId: true }
    });

    if (!tenancy) return NextResponse.json({ message: "Tenancy not found" }, { status: 404 });

    const report = await prisma.repairReport.create({
      data: {
        tenancyId: data.tenancyId,
        tenantId: tenancy.tenantId,
        category: data.category,
        urgency: data.urgency,
        description: data.description,
        issue: data.issue || data.category,
        status: session.user.role === "LANDLORD" ? "IN_PROGRESS" : "SUBMITTED",
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error("Repair Error:", error);
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
    const { id, status, resolutionNote, cost } = body;

    const report = await prisma.repairReport.update({
      where: { id },
      data: {
        status,
        resolutionNote,
        cost: cost ? parseFloat(cost) : undefined,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
      },
    });

    return NextResponse.json(report, { status: 200 });
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
  
      if (!id) return NextResponse.json({ message: "ID is required" }, { status: 400 });
  
      await prisma.repairReport.delete({
        where: { id },
      });
  
      return NextResponse.json({ message: "Request deleted" });
    } catch (error: any) {
      return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
    }
}
