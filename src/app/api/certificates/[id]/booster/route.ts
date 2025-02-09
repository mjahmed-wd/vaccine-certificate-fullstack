import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const boosterDoseSchema = z.object({
  vaccineId: z.string().min(1, "Vaccine is required"),
  providerId: z.string().min(1, "Provider is required"),
  dateAdministered: z.string().min(1, "Date administered is required"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = (await params).id;
    const json = await request.json();
    const validatedData = boosterDoseSchema.parse(json);

    // Check if certificate exists
    const certificate = await db.certificate.findUnique({
      where: { id },
      include: {
        vaccinations: true,
        vaccine: true
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Check if all required doses are completed
    if (certificate.vaccinations.length < certificate.doseNumber) {
      return NextResponse.json(
        { error: "Cannot add booster dose before completing all required doses" },
        { status: 400 }
      );
    }

    // Create booster dose record
    const boosterDose = await db.boosterDose.create({
      data: {
        certificateId: id,
        vaccineId: validatedData.vaccineId,
        dateAdministered: new Date(validatedData.dateAdministered),
        vaccinationCenter: session.user.center,
        vaccinatedById: session.user.id,
        vaccinatedByName: `${session.user.firstName} ${session.user.lastName}`,
        providerId: validatedData.providerId,
      },
      include: {
        vaccine: true,
        provider: true,
      }
    });

    // Fetch the updated certificate with all records
    const updatedCertificate = await db.certificate.findUnique({
      where: { id },
      include: {
        vaccinations: {
          include: {
            vaccine: true,
            provider: true
          }
        },
        vaccine: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Booster dose added successfully",
      data: {
        boosterDose,
        certificate: updatedCertificate
      }
    });

  } catch (error) {
    // Log the full error for debugging
    const err = error as Error;
    console.log('Booster dose error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation error",
        details: error.errors
      }, { status: 400 });
    }

    // Return a proper error response
    return NextResponse.json({
      success: false,
      error: "Failed to create booster dose",
      message: err.message || "Unknown error occurred"
    }, { status: 500 });
  }
} 