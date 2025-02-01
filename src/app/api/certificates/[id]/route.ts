import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const certificate = await db.certificate.findUnique({
      where: {
        id: params.id,
      },
      include: {
        vaccine: true,
        vaccinations: {
          orderBy: {
            doseNumber: "asc",
          },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("Failed to fetch certificate:", error)
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const {
      nidNumber,
      passportNumber,
      nationality,
      patientName,
      dateOfBirth,
      gender,
      isActive,
    } = json

    const certificate = await db.certificate.update({
      where: {
        id: params.id,
      },
      data: {
        nidNumber,
        passportNumber,
        nationality,
        patientName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        isActive,
      },
      include: {
        vaccine: true,
        vaccinations: true,
      },
    })

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("Failed to update certificate:", error)
    return NextResponse.json(
      { error: "Failed to update certificate" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.certificate.update({
      where: {
        id: params.id,
      },
      data: {
        isActive: false,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Failed to delete certificate:", error)
    return NextResponse.json(
      { error: "Failed to delete certificate" },
      { status: 500 }
    )
  }
} 