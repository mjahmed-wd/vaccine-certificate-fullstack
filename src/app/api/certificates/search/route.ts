import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { type Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const query = searchParams.get("query");

    if (!field || !query) {
      return NextResponse.json(
        { error: "Missing search parameters" },
        { status: 400 }
      );
    }

    // Build the where clause based on the search field
    const where: Prisma.CertificateWhereInput =
      field === "certificateNo"
        ? {
            certificateNo: parseInt(query),
          }
        : field === "nidNumber"
        ? {
            nidNumber: query,
          }
        : field === "passportNumber"
        ? {
            passportNumber: query,
          }
        : field === "patientName"
        ? {
            patientName: query,
          }
        : {
            [field]: {
              contains: query,
              mode: "insensitive",
            },
          };

    // Special handling for certificate number
    if (field === "certificateNo") {
      const certificateNo = parseInt(query);
      if (isNaN(certificateNo)) {
        return NextResponse.json(
          { error: "Invalid certificate number" },
          { status: 400 }
        );
      }
    }

    const certificates = await db.certificate.findMany({
      where,
      select: {
        id: true,
        certificateNo: true,
        nidNumber: true,
        passportNumber: true,
        nationality: true,
        patientName: true,
        dateOfBirth: true,
        gender: true,
        doseNumber: true,
        dateAdministered: true,
        isActive: true,
        vaccine: {
          select: {
            name: true,
          },
        },
        vaccinations: {
          select: {
            doseNumber: true,
            dateAdministered: true,
            vaccinationCenter: true,
            vaccinatedByName: true,
          },
          orderBy: {
            doseNumber: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit results
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Failed to search certificates:", error);
    return NextResponse.json(
      { error: "Failed to search certificates" },
      { status: 500 }
    );
  }
}
