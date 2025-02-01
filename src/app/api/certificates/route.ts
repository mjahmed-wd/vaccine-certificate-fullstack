import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const certificates = await db.certificate.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Failed to fetch certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
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
    const {
      nidNumber,
      passportNumber,
      nationality,
      patientName,
      dateOfBirth,
      gender,
      vaccineId,
      doseNumber,
      dateAdministered,
    } = json;

    // Get vaccine details
    const vaccine = await db.vaccine.findUnique({
      where: { id: vaccineId },
      select: { name: true },
    });

    if (!vaccine) {
      return NextResponse.json(
        { error: "Vaccine not found" },
        { status: 404 }
      );
    }

    const certificate = await db.certificate.create({
      data: {
        nidNumber,
        passportNumber,
        nationality,
        patientName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        vaccineId,
        doseNumber,
        dateAdministered: new Date(dateAdministered),
        vaccinations: {
          create: {
            vaccineId,
            vaccineName: vaccine.name,
            doseNumber,
            dateAdministered: new Date(dateAdministered),
            vaccinationCenter: session.user.center,
            vaccinatedById: session.user.id,
            vaccinatedByName: `${session.user.firstName} ${session.user.lastName}`,
          },
        },
      },
      include: {
        vaccine: true,
        vaccinations: true,
      },
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Failed to create certificate:", error);
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    );
  }
}
