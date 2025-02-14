import { db } from "../../../lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const userCount = await db.user.count();

    if (userCount > 0) {
      return NextResponse.json(
        { error: "Setup has already been completed" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await db.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        username: "admin",
        passwordHash: hashedPassword,
        role: "ADMIN",
        center: "Main Center",
        phone: "1234567890",
      },
    });

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        username: admin.username,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
} 