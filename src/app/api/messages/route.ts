import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { tenancyId, content, type = "TEXT" } = await req.json();

    if (!tenancyId || !content) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        tenancyId,
        senderId: session.user.id,
        senderRole: session.user.role,
        content,
        type,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
