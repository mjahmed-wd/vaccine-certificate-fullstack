import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<Record<string, string>> }
) {
  const { certificateNo } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isNaN(parseInt(certificateNo, 10))) {
      return NextResponse.json(
        { error: "Invalid certificate number" },
        { status: 400 }
      );
    }

    const certificate = await db.certificate.findUnique({
      where: {
        certificateNo: parseInt(certificateNo, 10),
      },
      include: {
        vaccine: true,
        vaccinations: {
          include: {
            provider: true,
          },
        },
        boosterDoses: {
          include: {
            provider: true,
            vaccine: true,
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
