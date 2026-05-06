import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["LANDLORD", "TENANT"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password, role } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let isApproved = false;
    let isDefault = false;

    if (role === "LANDLORD") {
      // Check if this is the first landlord
      const landlordCount = await prisma.user.count({
        where: { role: "LANDLORD" },
      });

      if (landlordCount >= 2) {
        return NextResponse.json(
          { message: "Maximum number of landlords reached." },
          { status: 403 }
        );
      }

      if (landlordCount === 0) {
        isApproved = true;
        isDefault = true;
      } else {
        isApproved = false;
        isDefault = false;
      }
    } else {
      // Tenants are approved if they join via code (handled in join API)
      // or we can just default them to true if they are registered manually?
      // Usually, tenants register then join. We'll set them to approved for login.
      isApproved = true;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        isApproved,
        isDefault,
      },
    });

    return NextResponse.json(
      { 
        message: isApproved 
          ? "User created successfully" 
          : "Registration successful. Please wait for the administrator to approve your account.",
        user: { id: user.id, email: user.email, isApproved } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
