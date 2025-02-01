import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { z } from "zod";

const vaccineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  totalDose: z.coerce.number().min(1, 'Total doses must be at least 1'),
});

type Context = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(request: Request, context: Context) {
  try {
    const params = await context.params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get vaccine
    const vaccine = await db.vaccine.findUnique({
      where: { id: params.id },
    });

    if (!vaccine) {
      return NextResponse.json({ error: "Vaccine not found" }, { status: 404 });
    }

    return NextResponse.json(vaccine);
  } catch (error) {
    console.error("Error fetching vaccine:", error);
    return NextResponse.json(
      { error: "Failed to fetch vaccine" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    const params = await context.params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = vaccineSchema.parse(body);

    // Check if vaccine name is already taken by another vaccine
    const existingVaccine = await db.vaccine.findFirst({
      where: {
        name: validatedData.name,
        NOT: { id: params.id },
      },
    });

    if (existingVaccine) {
      return NextResponse.json(
        { error: "Vaccine name is already taken" },
        { status: 400 }
      );
    }

    // Update vaccine
    const vaccine = await db.vaccine.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(vaccine);
  } catch (error) {
    console.error("Error updating vaccine:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update vaccine" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const params = await context.params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if vaccine is being used in any certificates
    const vaccineInUse = await db.vaccinationRecord.findFirst({
      where: { vaccineId: params.id },
    });

    if (vaccineInUse) {
      return NextResponse.json(
        { error: "Cannot delete vaccine as it is being used in vaccination records" },
        { status: 400 }
      );
    }

    // Delete vaccine
    await db.vaccine.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vaccine:", error);
    return NextResponse.json(
      { error: "Failed to delete vaccine" },
      { status: 500 }
    );
  }
} 