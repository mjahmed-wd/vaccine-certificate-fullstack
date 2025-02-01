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
      previousCertificateNo,
      dateAdministered,
    } = json;

    // Get vaccine details
    const vaccine = await db.vaccine.findUnique({
      where: { id: vaccineId },
      select: { name: true, totalDose: true },
    });

    if (!vaccine) {
      return NextResponse.json(
        { error: "Vaccine not found" },
        { status: 404 }
      );
    }

    // Validate dose number
    if (doseNumber > vaccine.totalDose) {
      return NextResponse.json(
        { error: `Dose number cannot be greater than ${vaccine.totalDose}` },
        { status: 400 }
      );
    }

    // If it's not the first dose, validate previous certificate
    if (doseNumber > 1) {
      if (!previousCertificateNo) {
        return NextResponse.json(
          { error: "Previous certificate number is required for doses after first dose" },
          { status: 400 }
        );
      }

      const previousCertificate = await db.certificate.findUnique({
        where: { certificateNo: parseInt(previousCertificateNo) },
        include: {
          vaccinations: true,
          vaccine: true,
        },
      });

      if (!previousCertificate) {
        return NextResponse.json(
          { error: "Previous certificate not found" },
          { status: 404 }
        );
      }

      // Validate that the vaccine matches
      if (previousCertificate.vaccineId !== vaccineId) {
        return NextResponse.json(
          { 
            error: "Vaccine mismatch", 
            details: {
              currentVaccine: vaccine.name,
              previousVaccine: previousCertificate.vaccine.name,
              certificateDetails: {
                patientName: previousCertificate.patientName,
                certificateNo: previousCertificate.certificateNo,
                vaccineId: previousCertificate.vaccineId
              }
            }
          },
          { status: 400 }
        );
      }

      // Create certificate with previous vaccination records and deactivate previous certificate
      const [deactivatedPrevious, certificate] = await db.$transaction([
        // Deactivate previous certificate
        db.certificate.update({
          where: { certificateNo: parseInt(previousCertificateNo) },
          data: { isActive: false },
        }),
        // Create new certificate
        db.certificate.create({
          data: {
            nidNumber: previousCertificate.nidNumber,
            passportNumber: previousCertificate.passportNumber,
            nationality: previousCertificate.nationality,
            patientName: previousCertificate.patientName,
            dateOfBirth: previousCertificate.dateOfBirth,
            gender: previousCertificate.gender,
            vaccineId,
            doseNumber,
            dateAdministered: new Date(dateAdministered),
            vaccinations: {
              create: [
                // Include previous vaccination records
                ...previousCertificate.vaccinations.map((v) => ({
                  vaccineId: v.vaccineId,
                  vaccineName: v.vaccineName,
                  doseNumber: v.doseNumber,
                  dateAdministered: v.dateAdministered,
                  vaccinationCenter: v.vaccinationCenter,
                  vaccinatedById: v.vaccinatedById,
                  vaccinatedByName: v.vaccinatedByName,
                })),
                // Add new vaccination record
                {
                  vaccineId,
                  vaccineName: vaccine.name,
                  doseNumber,
                  dateAdministered: new Date(dateAdministered),
                  vaccinationCenter: session.user.center,
                  vaccinatedById: session.user.id,
                  vaccinatedByName: `${session.user.firstName} ${session.user.lastName}`,
                },
              ],
            },
          },
          include: {
            vaccine: true,
            vaccinations: true,
          },
        }),
      ]);

      return NextResponse.json(certificate);
    }

    // Create certificate for first dose
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
