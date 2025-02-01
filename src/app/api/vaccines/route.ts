import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const vaccineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  totalDose: z.coerce.number().min(1, 'Total doses must be at least 1'),
});

export async function GET() {
  try {
    const vaccines = await db.vaccine.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(vaccines);
  } catch (error) {
    console.error("Error fetching vaccines:", error);
    return NextResponse.json(
      { error: "Failed to fetch vaccines" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { name, totalDose } = json;

    const vaccine = await db.vaccine.create({
      data: {
        name,
        totalDose,
      },
    });

    return NextResponse.json(vaccine);
  } catch (error) {
    console.error("Error creating vaccine:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create vaccine" },
      { status: 500 }
    );
  }
} 