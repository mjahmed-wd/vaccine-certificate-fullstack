import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const id = (await params).id;
  try {
    const certificate = await db.certificate.findUnique({
      where: {
        id,
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
            vaccinatedById: true,
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
            vaccinatedById: true,
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await params;
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
      isActive,
      fatherName,
      motherName,
      phoneNumber,
      permanentAddress,
    } = json;

    const certificate = await db.certificate.update({
      where: {
        id: id,
      },
      data: {
        nidNumber,
        passportNumber,
        nationality,
        patientName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        isActive,
        fatherName,
        motherName,
        phoneNumber,
        permanentAddress,
      },
      include: {
        vaccine: true,
        vaccinations: true,
      },
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Failed to update certificate:", error);
    return NextResponse.json(
      { error: "Failed to update certificate" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.certificate.update({
      where: {
        id: id,
      },
      data: {
        isActive: false,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete certificate:", error);
    return NextResponse.json(
      { error: "Failed to delete certificate" },
      { status: 500 }
    );
  }
}
