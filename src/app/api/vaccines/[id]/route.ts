import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";


export async function GET(request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params;
    const vaccine = await db.vaccine.findUnique({
      where: {
        id: id,
      },
    });

    if (!vaccine) {
      return NextResponse.json(
        { error: "Vaccine not found" },
        { status: 404 }
      );
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

export async function PUT(request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { name, totalDose } = json;

    const vaccine = await db.vaccine.update({
      where: {
        id: id,
      },
      data: {
        name,
        totalDose,
      },
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

export async function DELETE(request: Request, { params }: { params: Promise<Record<string, string>> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if vaccine is being used in any certificates
    const vaccineInUse = await db.vaccinationRecord.findFirst({
      where: { vaccineId: id },
    });

    if (vaccineInUse) {
      return NextResponse.json(
        { error: "Cannot delete vaccine as it is being used in vaccination records" },
        { status: 400 }
      );
    }

    // Delete vaccine
    await db.vaccine.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting vaccine:", error);
    return NextResponse.json(
      { error: "Failed to delete vaccine" },
      { status: 500 }
    );
  }
} 