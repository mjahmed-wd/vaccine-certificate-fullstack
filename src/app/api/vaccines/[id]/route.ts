import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

const vaccineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  totalDose: z.coerce.number().min(1, "Total doses must be at least 1"),
  providers: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Provider name is required"),
    })
  ),
});

async function checkAdminAccess() {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden: Admin access required", status: 403 };
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const id = (await params).id;
  try {
    const accessCheck = await checkAdminAccess();
    if (accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const vaccine = await db.vaccine.findUnique({
      where: {
        id: id,
      },
      include: {
        providers: true,
      },
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const id = (await params).id;
    const accessCheck = await checkAdminAccess();
    if (accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const json = await request.json();
    const validatedData = vaccineSchema.parse(json);

    // First, update the vaccine with basic info
    await db.vaccine.update({
      where: {
        id: id,
      },
      data: {
        name: validatedData.name,
        totalDose: validatedData.totalDose,
      },
    });

    // Delete all existing providers for this vaccine
    await db.vaccineProvider.deleteMany({
      where: {
        vaccineId: id,
      },
    });

    // Create all providers from the request
    await db.vaccineProvider.createMany({
      data: validatedData.providers.map((provider) => ({
        name: provider.name,
        vaccineId: id,
      })),
    });

    // Fetch the updated vaccine with providers
    const finalVaccine = await db.vaccine.findUnique({
      where: {
        id: id,
      },
      include: {
        providers: true,
      },
    });

    return NextResponse.json(finalVaccine);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const id = (await params).id;
    const accessCheck = await checkAdminAccess();
    if (accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    await db.vaccine.delete({
      where: {
        id: id,
      },
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
