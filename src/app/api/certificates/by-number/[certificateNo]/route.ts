import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
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
    // TODO: Uncomment this when we have a way to deactivate certificates
    // if (!certificate.isActive) {
    //   return NextResponse.json(
    //     { error: "Certificate is inactive" },
    //     { status: 400 } // 400 for a bad request due to inactive certificate
    //   );
    // }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Failed to fetch certificate:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
      { status: 500 }
    );
  }
}
