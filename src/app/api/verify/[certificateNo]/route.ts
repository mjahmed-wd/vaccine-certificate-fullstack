import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const certificateNo = (await params).certificateNo;
    
    const certificate = await db.certificate.findUnique({
      where: {
        certificateNo: parseInt(certificateNo),
      },
      include: {
        vaccine: {
          select: {
            id: true,
            name: true,
            totalDose: true,
          },
        },
        vaccinations: {
          select: {
            id: true,
            vaccineId: true,
            vaccineName: true,
            doseNumber: true,
            dateAdministered: true,
            vaccinationCenter: true,
            vaccinatedByName: true,
            providerId: true,
            provider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            doseNumber: "asc",
          },
        },
        boosterDoses: {
          select: {
            id: true,
            vaccineId: true,
            dateAdministered: true,
            vaccinationCenter: true,
            vaccinatedByName: true,
            providerId: true,
            provider: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Failed to fetch certificate:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
      { status: 500 }
    );
  }
} 