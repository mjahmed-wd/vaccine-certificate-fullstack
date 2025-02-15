import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const roleEnum = z.enum(["ADMIN", "TECHNICIAN", "MEDICAL_OFFICER"]);

const userUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: roleEnum,
  center: z.string().min(1, 'Center is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        center: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    // Check if username is already taken by another user
    const existingUser = await db.user.findFirst({
      where: {
        username: validatedData.username,
        NOT: { id: id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Update user
    const user = await db.user.update({
      where: { id: id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        username: validatedData.username,
        role: validatedData.role,
        center: validatedData.center,
        phone: validatedData.phone,
        ...(validatedData.password && {
          passwordHash: await bcrypt.hash(validatedData.password, 10)
        })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        center: true,
        phone: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
} 