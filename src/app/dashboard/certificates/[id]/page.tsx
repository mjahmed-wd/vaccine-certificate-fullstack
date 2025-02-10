import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCertificate } from "@/lib/api/certificates";
import { format } from "date-fns";
import QRCode from "react-qr-code";
import { encryptText } from "@/lib/crypto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "View Certificate",
  description: "View vaccination certificate details",
};

interface ViewCertificatePageProps {
  params: Promise<Record<string, string>>;
}

export default async function ViewCertificatePage({
  params,
}: ViewCertificatePageProps) {
  const { id } = await params;
  const certificate = await getCertificate(id).catch(() => null);

  if (!certificate) {
    notFound();
  }

  const qrValue = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${encryptText(
    certificate.certificateNo.toString()
  )}`;

  return (
    <div className="container mx-auto py-10">
      {/* Header Section */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Certificate #{certificate.certificateNo}
            </h1>
            <p className="text-muted-foreground mt-1">
              View vaccination certificate details
            </p>
          </div>
          <div className="flex gap-4">
            <Link href={`/dashboard/certificates/${certificate.id}/edit`}>
              <Button variant="outline">Edit Certificate</Button>
            </Link>
            <Badge
              variant={certificate.isActive ? "default" : "destructive"}
              className="text-sm py-1 px-3"
            >
              {certificate.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-8">
          {/* Patient Information Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
            <CardHeader className="border-b border-blue-100 bg-white/50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-blue-800">Patient Name</dt>
                  <dd className="text-sm font-semibold text-gray-900">{certificate.patientName}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-blue-800">Father&apos;s Name</dt>
                  <dd className="text-sm font-semibold text-gray-900">{certificate.fatherName}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-blue-800">Mother&apos;s Name</dt>
                  <dd className="text-sm font-semibold text-gray-900">{certificate.motherName}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-blue-800">Date of Birth</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {format(new Date(certificate.dateOfBirth), "PPP")}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-blue-800">Gender</dt>
                  <dd className="text-sm font-semibold text-gray-900">{certificate.gender}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-blue-800">Nationality</dt>
                  <dd className="text-sm font-semibold text-gray-900">{certificate.nationality}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-blue-800">Phone Number</dt>
                  <dd className="text-sm font-semibold text-gray-900">{certificate.phoneNumber}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-blue-800">Permanent Address</dt>
                  <dd className="text-sm font-semibold text-gray-900">{certificate.permanentAddress}</dd>
                </div>
                {certificate.nidNumber && (
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-blue-800">NID Number</dt>
                    <dd className="text-sm font-semibold text-gray-900">{certificate.nidNumber}</dd>
                  </div>
                )}
                {certificate.passportNumber && (
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-blue-800">Passport Number</dt>
                    <dd className="text-sm font-semibold text-gray-900">{certificate.passportNumber}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Vaccination Details Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <CardHeader className="border-b border-amber-100 bg-white/50">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Vaccination Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-amber-800">Vaccine</dt>
                  <dd className="text-sm font-semibold text-gray-900">{certificate.vaccine?.name}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-amber-800">Provider</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {certificate.vaccinations[certificate.vaccinations.length - 1]?.provider?.name || "N/A"}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-amber-800">Dose Number</dt>
                  <dd className="text-sm font-semibold text-gray-900">{certificate.doseNumber}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-amber-800">Date Administered</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {format(new Date(certificate.dateAdministered), "PPP")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Vaccination History Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardHeader className="border-b border-green-100 bg-white/50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Regular Vaccination History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {certificate.vaccinations.map((vaccination, index) => (
                <div
                  key={vaccination.id}
                  className="relative rounded-xl border border-green-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="absolute -left-2 -top-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-sm font-bold text-white shadow-lg">
                      #{index + 1}
                    </span>
                  </div>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4">
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-green-800">Vaccine</dt>
                      <dd className="text-sm font-semibold text-gray-900">{vaccination.vaccineName}</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-green-800">Provider</dt>
                      <dd className="text-sm font-semibold text-gray-900">{vaccination.provider?.name}</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-green-800">Date Administered</dt>
                      <dd className="text-sm font-semibold text-gray-900">
                        {format(new Date(vaccination.dateAdministered), "PPP")}
                      </dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-green-800">Dose Number</dt>
                      <dd className="text-sm font-semibold text-gray-900">{vaccination.doseNumber}</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-green-800">Vaccination Center</dt>
                      <dd className="text-sm font-semibold text-gray-900">{vaccination.vaccinationCenter}</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-green-800">Vaccinated By</dt>
                      <dd className="text-sm font-semibold text-gray-900">{vaccination.vaccinatedByName}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Booster Doses Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
            <CardHeader className="border-b border-purple-100 bg-white/50">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Booster Doses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {certificate.boosterDoses && certificate.boosterDoses.length > 0 ? (
                <div className="space-y-4">
                  {certificate.boosterDoses.map((booster, index) => (
                    <div
                      key={booster.id}
                      className="relative rounded-xl border border-purple-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="absolute -left-2 -top-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white shadow-lg">
                          B{index + 1}
                        </span>
                      </div>
                      <div className="mb-4 flex items-center">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                          Booster Dose #{index + 1}
                        </Badge>
                      </div>
                      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <dt className="text-sm font-medium text-purple-800">Date Administered</dt>
                          <dd className="text-sm font-semibold text-gray-900">
                            {format(new Date(booster.dateAdministered), "PPP")}
                          </dd>
                        </div>
                        <div className="space-y-1">
                          <dt className="text-sm font-medium text-purple-800">Vaccination Center</dt>
                          <dd className="text-sm font-semibold text-gray-900">{booster.vaccinationCenter}</dd>
                        </div>
                        <div className="space-y-1">
                          <dt className="text-sm font-medium text-purple-800">Vaccinated By</dt>
                          <dd className="text-sm font-semibold text-gray-900">{booster.vaccinatedByName}</dd>
                        </div>
                        <div className="space-y-1">
                          <dt className="text-sm font-medium text-purple-800">Provider</dt>
                          <dd className="text-sm font-semibold text-gray-900">{booster.vaccinatedByName}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-purple-200 bg-white/50 p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <p className="mt-4 text-sm text-purple-800">No booster doses administered yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Code Section */}
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
            <CardHeader className="border-b border-rose-100 bg-white/50">
              <CardTitle className="flex items-center gap-2 text-rose-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-center rounded-xl border border-rose-100 p-8 bg-white shadow-sm">
                <QRCode value={qrValue} />
              </div>
              <div className="mt-4 text-center">
                <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                  Scan to Verify
                </Badge>
                <p className="text-sm text-rose-600 mt-2">
                  Use this QR code to verify the certificate authenticity
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
