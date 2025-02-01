import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { z } from "zod";

const vaccineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  totalDose: z.coerce.number().min(1, 'Total doses must be at least 1'),
});

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all vaccines
    const vaccines = await db.vaccine.findMany({
      orderBy: {
        name: 'asc',
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = vaccineSchema.parse(body);

    // Check if vaccine name is already taken
    const existingVaccine = await db.vaccine.findFirst({
      where: {
        name: validatedData.name,
      },
    });

    if (existingVaccine) {
      return NextResponse.json(
        { error: "Vaccine name is already taken" },
        { status: 400 }
      );
    }

    // Create vaccine
    const vaccine = await db.vaccine.create({
      data: validatedData,
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