import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const roleEnum = z.enum(["ADMIN", "TECHNICIAN", "MEDICAL_OFFICER"]);

const userCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: roleEnum,
  center: z.string().min(1, 'Center is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users
    const users = await db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        center: true,
        phone: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = userCreateSchema.parse(body);

    // Check if username is already taken
    const existingUser = await db.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        username: validatedData.username,
        passwordHash: hashedPassword,
        role: validatedData.role,
        center: validatedData.center,
        phone: validatedData.phone,
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

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
} 