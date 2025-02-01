import { Metadata } from "next"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Verify Certificate",
  description: "Verify vaccination certificate",
}

interface VerifyCertificatePageProps {
  params: {
    certificateNo: string
  }
}

export default async function VerifyCertificatePage({
  params,
}: VerifyCertificatePageProps) {
  // Await params before using
  const { certificateNo } = await params;
  
  const certificate = await db.certificate
    .findUnique({
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
          },
          orderBy: {
            doseNumber: "asc",
          },
        },
      },
    })
    .catch(() => null)

  if (!certificate) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Certificate #{certificate.certificateNo}
            </h1>
            <p className="text-muted-foreground">
              Vaccination Certificate Verification
            </p>
            {!certificate.isActive && (
              <div className="mt-4 inline-block rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
                This certificate is no longer active
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Patient Information</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Patient Name
                  </dt>
                  <dd className="text-sm">{certificate.patientName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </dt>
                  <dd className="text-sm">
                    {format(new Date(certificate.dateOfBirth), "PPP")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Gender
                  </dt>
                  <dd className="text-sm">{certificate.gender}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Nationality
                  </dt>
                  <dd className="text-sm">{certificate.nationality}</dd>
                </div>
                {certificate.nidNumber && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      NID Number
                    </dt>
                    <dd className="text-sm">{certificate.nidNumber}</dd>
                  </div>
                )}
                {certificate.passportNumber && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Passport Number
                    </dt>
                    <dd className="text-sm">{certificate.passportNumber}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Current Vaccination Status</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Vaccine
                  </dt>
                  <dd className="text-sm">{certificate.vaccine.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Total Doses Received
                  </dt>
                  <dd className="text-sm">{certificate.doseNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Last Dose Date
                  </dt>
                  <dd className="text-sm">
                    {format(new Date(certificate.dateAdministered), "PPP")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Certificate Status
                  </dt>
                  <dd className="text-sm">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        certificate.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {certificate.isActive ? "Active" : "Inactive"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Vaccination History</h2>
              <div className="space-y-4">
                {certificate.vaccinations.map((vaccination) => (
                  <div
                    key={vaccination.id}
                    className="rounded-lg border p-4"
                  >
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Vaccine
                        </dt>
                        <dd className="text-sm">{vaccination.vaccineName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Dose Number
                        </dt>
                        <dd className="text-sm">{vaccination.doseNumber}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Date Administered
                        </dt>
                        <dd className="text-sm">
                          {format(new Date(vaccination.dateAdministered), "PPP")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Vaccination Center
                        </dt>
                        <dd className="text-sm">{vaccination.vaccinationCenter}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Vaccinated By
                        </dt>
                        <dd className="text-sm">{vaccination.vaccinatedByName}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground text-center">
                This is an official digital verification page for vaccination certificates.
                The information shown here is retrieved directly from our secure database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 