import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only the default landlord can approve others
    if (!session || !session.user.isDefault) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, approve } = await req.json();

    const user = await prisma.user.update({
      where: { id: userId, role: "LANDLORD" },
      data: {
        isApproved: approve,
      },
    });

    return NextResponse.json(
      { message: approve ? "Landlord approved" : "Landlord unapproved", user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
