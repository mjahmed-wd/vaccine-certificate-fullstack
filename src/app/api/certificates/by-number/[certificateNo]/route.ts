import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: {
    certificateNo: string;
  };
}
export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Await the params object to ensure proper access
    const { certificateNo } = await params;

    const certificate = await db.certificate.findUnique({
      where: {
        certificateNo: parseInt(certificateNo),
      },
      include: {
        vaccinations: true,
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Check if the certificate is inactive
    if (!certificate.isActive) {
      return NextResponse.json(
        { error: "Certificate is inactive" },
        { status: 400 } // 400 for a bad request due to inactive certificate
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
