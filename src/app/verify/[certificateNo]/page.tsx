import { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import VaccinationCertificatePrint from "./print";
import PrintButton from "./print-button";
import DownloadButton from "./download-button";

export const metadata: Metadata = {
  title: "Verify Certificate",
  description: "Verify vaccination certificate",
};

interface VerifyCertificatePageProps {
  params: Promise<{
    certificateNo: string;
  }>;
}

interface Certificate {
  id: string;
  certificateNo: number;
  patientName: string;
  nidNumber?: string | null;
  passportNumber?: string | null;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  vaccineId: string;
  doseNumber: number;
  dateAdministered: string;
  isActive: boolean;
  vaccine: {
    id: string;
    name: string;
    totalDose: number;
  };
  vaccinations: Array<{
    id: string;
    vaccineId: string;
    vaccineName: string;
    doseNumber: number;
    dateAdministered: string;
    vaccinationCenter: string;
    vaccinatedByName: string;
  }>;
}

async function getCertificate(certificateNo: string): Promise<Certificate | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/verify/${certificateNo}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function VerifyCertificatePage({
  params,
}: VerifyCertificatePageProps) {
  const { certificateNo } = await params;
  const certificate = await getCertificate(certificateNo);

  if (!certificate) {
    notFound();
  }

  return (
    <div className="">
      <VaccinationCertificatePrint />

      <div className="min-h-screen bg-background print:hidden">
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

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                    <dd className="text-sm">{certificate.patientName}</dd>
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
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Nationality
                    </dt>
                    <dd className="text-sm">{certificate.nationality}</dd>
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
                </dl>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">Vaccination Details</h2>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Vaccine
                    </dt>
                    <dd className="text-sm">{certificate.vaccine.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Total Doses Required
                    </dt>
                    <dd className="text-sm">{certificate.vaccine.totalDose}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Vaccination History</h2>
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
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <PrintButton />
            <DownloadButton certificate={certificate} />
          </div>
        </div>
      </div>
    </div>
  );
}
