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

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isDefault) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 });
    }

    // Prevent deleting self
    if (userId === session.user.id) {
        return NextResponse.json({ message: "Cannot delete yourself" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId, role: "LANDLORD" },
    });

    return NextResponse.json(
      { message: "Landlord deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
