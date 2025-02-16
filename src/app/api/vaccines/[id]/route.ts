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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get existing providers
    const existingProviders = await db.vaccineProvider.findMany({
      where: {
        vaccineId: id,
      },
    });

    // Create a map of existing providers by name for easy lookup
    const existingProviderMap = new Map(
      existingProviders.map(provider => [provider.name, provider])
    );

    // Process each provider in the request
    for (const provider of validatedData.providers) {
      const existingProvider = existingProviderMap.get(provider.name);
      
      if (!existingProvider) {
        // If provider doesn't exist, create it
        await db.vaccineProvider.create({
          data: {
            name: provider.name,
            vaccineId: id,
          },
        });
      }
      // If provider exists, no need to update as only name is stored
    }

    // Delete providers that are no longer in the list
    const newProviderNames = new Set(validatedData.providers.map(p => p.name));
    const providersToDelete = existingProviders.filter(
      provider => !newProviderNames.has(provider.name)
    );

    // Check if any providers to be deleted are in use
    for (const provider of providersToDelete) {
      const inUseCount = await db.vaccinationRecord.count({
        where: {
          providerId: provider.id,
        },
      });

      if (inUseCount > 0) {
        return NextResponse.json(
          { 
            error: "Cannot delete provider that is in use", 
            details: `Provider "${provider.name}" is used in ${inUseCount} vaccination records`
          },
          { status: 400 }
        );
      }
    }

    // Safe to delete unused providers
    for (const provider of providersToDelete) {
      await db.vaccineProvider.delete({
        where: {
          id: provider.id,
        },
      });
    }

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
