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
  const certificate = await db.certificate
    .findUnique({
      where: {
        certificateNo: parseInt(params.certificateNo),
      },
      include: {
        vaccine: true,
        vaccinations: {
          include: {
            vaccine: true,
            vaccinatedBy: {
              select: {
                firstName: true,
                lastName: true,
                center: true,
              },
            },
          },
        },
      },
    })
    .catch(() => null)

  if (!certificate) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Certificate #{certificate.certificateNo}
          </h1>
          <p className="text-muted-foreground">
            Vaccination certificate verification
          </p>
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
            <h2 className="text-lg font-semibold">Vaccination Details</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Vaccine
                </dt>
                <dd className="text-sm">{certificate.vaccine.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Dose Number
                </dt>
                <dd className="text-sm">{certificate.doseNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Date Administered
                </dt>
                <dd className="text-sm">
                  {format(new Date(certificate.dateAdministered), "PPP")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Status
                </dt>
                <dd className="text-sm">
                  {certificate.isActive ? "Active" : "Inactive"}
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
                      <dd className="text-sm">{vaccination.vaccine.name}</dd>
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
                      <dd className="text-sm">
                        {vaccination.vaccinatedBy.firstName}{" "}
                        {vaccination.vaccinatedBy.lastName}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 