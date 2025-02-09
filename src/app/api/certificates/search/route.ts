import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { type Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const query = searchParams.get("query");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const take = limit ? parseInt(limit, 10) : 10;
    const skip = page ? (parseInt(page, 10) - 1) * take : 0;

    // Build the where clause based on the search field and date range
    let where: Prisma.CertificateWhereInput = {};

    // Add search criteria if provided
    if (field && query) {
      where = field === "certificateNo"
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
    }

    // Add date range criteria if provided
    if (fromDate || toDate) {
      where.updatedAt = {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate + 'T23:59:59') }),
      };
    }

    // Special handling for certificate number
    if (field === "certificateNo") {
      const certificateNo = parseInt(query || "");
      if (isNaN(certificateNo)) {
        return NextResponse.json(
          { error: "Invalid certificate number" },
          { status: 400 }
        );
      }
    }

    // Get total count
    const total = await db.certificate.count({ where });

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
            totalDose: true,
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
        boosterDoses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });

    return NextResponse.json({
      data: certificates,
      meta: {
        total,
        page: page ? parseInt(page, 10) : 1,
        pageSize: take,
        pageCount: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error("Failed to search certificates:", error);
    return NextResponse.json(
      { error: "Failed to search certificates" },
      { status: 500 }
    );
  }
}
