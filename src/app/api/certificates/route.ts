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
      console.log("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    console.log("Received request data:", JSON.stringify(json, null, 2));

    const {
      nidNumber,
      passportNumber,
      nationality,
      patientName,
      dateOfBirth,
      gender,
      vaccineId,
      providerId,
      doseNumber,
      previousCertificateNo,
      dateAdministered,
    } = json;

    // Log all extracted data
    console.log("Extracted data:", {
      nidNumber,
      passportNumber,
      nationality,
      patientName,
      dateOfBirth,
      gender,
      vaccineId,
      providerId,
      doseNumber,
      previousCertificateNo,
      dateAdministered,
      sessionUser: {
        id: session.user.id,
        center: session.user.center,
        name: `${session.user.firstName} ${session.user.lastName}`
      }
    });

    // Validate required fields
    if (!patientName || !nationality || !dateOfBirth || !gender || !vaccineId || !providerId || !dateAdministered) {
      console.log("Missing required fields:", {
        patientName: !patientName,
        nationality: !nationality,
        dateOfBirth: !dateOfBirth,
        gender: !gender,
        vaccineId: !vaccineId,
        providerId: !providerId,
        dateAdministered: !dateAdministered
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const birthDate = new Date(dateOfBirth);
    const administeredDate = new Date(dateAdministered);
    const currentDate = new Date();

    console.log("Date validation:", {
      birthDate,
      administeredDate,
      currentDate,
      isBirthDateValid: !isNaN(birthDate.getTime()),
      isAdministeredDateValid: !isNaN(administeredDate.getTime())
    });

    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date of birth format" },
        { status: 400 }
      );
    }

    if (isNaN(administeredDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid administered date format" },
        { status: 400 }
      );
    }

    if (birthDate > currentDate) {
      console.log("Date of birth is in future");
      return new NextResponse(
        JSON.stringify({ 
          error: "Date of birth cannot be in the future",
          providedDate: dateOfBirth,
          currentDate: currentDate.toISOString()
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (administeredDate > currentDate) {
      console.log("Date administered is in future");
      return new NextResponse(
        JSON.stringify({ 
          error: "Date administered cannot be in the future",
          providedDate: dateAdministered,
          currentDate: currentDate.toISOString()
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get vaccine details with providers
    const vaccine = await db.vaccine.findUnique({
      where: { id: vaccineId },
      include: {
        providers: true,
      },
    });

    console.log("Found vaccine:", JSON.stringify(vaccine, null, 2));

    if (!vaccine) {
      return NextResponse.json(
        { error: "Vaccine not found" },
        { status: 404 }
      );
    }

    // Verify provider exists and is associated with the vaccine
    const provider = vaccine.providers.find(p => p.id === providerId);
    console.log("Provider check:", {
      providerId,
      foundProvider: provider ? provider.id : null,
      allProviders: vaccine.providers.map(p => ({ id: p.id, name: p.name }))
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Invalid provider for the selected vaccine" },
        { status: 400 }
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
        where: { certificateNo: previousCertificateNo },
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
      const [, certificate] = await db.$transaction([
        // Deactivate previous certificate
        db.certificate.update({
          where: { certificateNo: previousCertificateNo },
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
                  providerId: v.providerId,
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
                  providerId,
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
            providerId,
          },
        },
      },
      include: {
        vaccine: true,
        vaccinations: {
          include: {
            provider: true
          }
        },
      },
    });

    if (!certificate) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to create certificate record" }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify(certificate),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Failed to create certificate:", error);
    
    let errorMessage = "Failed to create certificate";
    let statusCode = 500;
    const details = error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof Error && 'code' in error) {
      const prismaError = error as { code: string };
      switch (prismaError.code) {
        case 'P2002':
          errorMessage = 'A certificate with this number already exists';
          statusCode = 400;
          break;
        case 'P2003':
          errorMessage = 'Invalid reference (foreign key constraint failed)';
          statusCode = 400;
          break;
        case 'P2025':
          errorMessage = 'Record not found';
          statusCode = 404;
          break;
        default:
          errorMessage = `Database error: ${prismaError.code}`;
      }
    }

    return NextResponse.json({ 
      error: errorMessage,
      details,
      timestamp: new Date().toISOString()
    }, { 
      status: statusCode 
    });
  }
}
