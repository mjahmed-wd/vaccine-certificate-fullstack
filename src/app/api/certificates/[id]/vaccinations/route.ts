import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const vaccinationSchema = z.object({
  vaccineId: z.string(),
  providerId: z.string(),
  doseNumber: z.number(),
  dateAdministered: z.string(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const id = (await params).id;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const body = vaccinationSchema.parse(json);

    // Get the certificate
    const certificate = await db.certificate.findUnique({
      where: { id },
      include: {
        vaccinations: true,
        vaccine: true,
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Validate vaccine matches
    if (certificate.vaccineId !== body.vaccineId) {
      return NextResponse.json(
        { error: "Vaccine mismatch with existing certificate" },
        { status: 400 }
      );
    }

    // Validate dose number is sequential
    const existingDoses = certificate.vaccinations.map((v) => v.doseNumber);
    const maxExistingDose = Math.max(...existingDoses, 0);
    if (body.doseNumber !== maxExistingDose + 1) {
      return NextResponse.json(
        { error: "Dose number must be sequential" },
        { status: 400 }
      );
    }

    // Validate total doses
    if (body.doseNumber > certificate.vaccine.totalDose) {
      return NextResponse.json(
        { error: "Dose number exceeds maximum allowed doses" },
        { status: 400 }
      );
    }

    // Add the new vaccination record
    const updatedCertificate = await db.certificate.update({
      where: { id },
      data: {
        vaccinations: {
          create: {
            vaccineId: body.vaccineId,
            vaccineName: certificate.vaccine.name,
            doseNumber: body.doseNumber,
            dateAdministered: body.dateAdministered,
            vaccinationCenter: session.user.center,
            vaccinatedById: session.user.id,
            vaccinatedByName: session.user.name || "Unknown",
            providerId: body.providerId,
          },
        },
        doseNumber: body.doseNumber,
        dateAdministered: body.dateAdministered,
      },
      include: {
        vaccine: true,
        vaccinations: {
          include: {
            provider: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCertificate);
  } catch (error) {
    console.error("Failed to add vaccination:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add vaccination" },
      { status: 500 }
    );
  }
}
