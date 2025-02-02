import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCertificate } from "@/lib/api/certificates"
import { format } from "date-fns"
import QRCode from "react-qr-code"

export const metadata: Metadata = {
  title: "View Certificate",
  description: "View vaccination certificate details",
}

interface ViewCertificatePageProps {
  params: Promise<Record<string, string>>;
}

export default async function ViewCertificatePage({
  params,
}: ViewCertificatePageProps) {
  // Await params before using
  const { id } = await params;
  const certificate = await getCertificate(id).catch(() => null)

  if (!certificate) {
    notFound()
  }

  const qrValue = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificate.certificateNo}`

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Certificate #{certificate.certificateNo}
            </h1>
            <p className="text-muted-foreground">
              View vaccination certificate details
            </p>
          </div>
          <div className="flex gap-4">
            <Link href={`/dashboard/certificates/${certificate.id}/edit`}>
              <Button>Edit Certificate</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                <dd className="text-sm">{certificate.vaccine?.name}</dd>
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
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">QR Code</h2>
            <div className="flex justify-center rounded-lg border p-8">
              <QRCode value={qrValue} />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan this QR code to verify the certificate
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 