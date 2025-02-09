import { Metadata } from "next";
import { format } from "date-fns";
import VaccinationCertificatePrint from "./print";
import PrintButton from "./print-button";
import DownloadButton from "./download-button";
import { decryptNumber } from "@/lib/crypto";

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
  boosterDoses?: Array<{
    id: string;
    dateAdministered: string;
    vaccinationCenter: string;
    vaccinatedByName: string;
  }>;
}

async function getCertificate(certificateNo: string): Promise<Certificate | null> {
  try {
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
  } catch (error) {
    console.error("Failed to fetch certificate:", error);
    return null;
  }
}

export default async function VerifyCertificatePage({
  params,
}: VerifyCertificatePageProps) {
  const { certificateNo } = await params;
  
  // First try to get certificate with the encrypted number
  let certificate = await getCertificate(certificateNo);
  
  // If not found, try with decrypted number
  if (!certificate) {
    try {
      const decryptedNumber = decryptNumber(certificateNo);
      if (decryptedNumber && decryptedNumber !== 0) {
        certificate = await getCertificate(decryptedNumber.toString());
      }
    } catch (error) {
      console.error("Failed to decrypt certificate number:", error);
    }
  }

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-100 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2 text-red-800">Certificate Not Found</h2>
          <p className="text-red-600">
            No certificate found with the provided number
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <VaccinationCertificatePrint certificate={certificate} />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white print:hidden">
        <div className="container mx-auto py-10">
          <div className="mb-8">
            <div className="text-center bg-white rounded-xl shadow-sm border p-8 hover:shadow-md transition-all duration-300">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_200%] animate-[gradient_6s_ease-in-out_infinite]">
                Certificate #{certificate.certificateNo}
              </h1>
              <p className="text-gray-600 mt-2">
                Vaccination Certificate Verification
              </p>
              {!certificate.isActive && (
                <div className="mt-4 inline-block rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm font-medium text-red-700 animate-pulse">
                  This certificate is no longer active
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-8">
              {/* Vaccination Details Card */}
              <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 overflow-hidden">
                <div className="border-b border-amber-100 bg-white/50 p-4">
                  <h2 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Vaccination Details
                  </h2>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-amber-800">Vaccine</dt>
                      <dd className="text-sm font-semibold text-gray-900">{certificate.vaccine.name}</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-amber-800">Total Doses Required</dt>
                      <dd className="text-sm font-semibold text-gray-900">{certificate.vaccine.totalDose}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Vaccination Status Overview */}
              <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:scale-105 transition-transform duration-300">
                    <div className="text-blue-800 font-semibold mb-2">Required Doses</div>
                    <div className="text-2xl font-bold text-blue-900">{certificate.vaccine.totalDose}</div>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:scale-105 transition-transform duration-300">
                    <div className="text-green-800 font-semibold mb-2">Doses Received</div>
                    <div className="text-2xl font-bold text-green-900">{certificate.vaccinations.length}</div>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:scale-105 transition-transform duration-300">
                    <div className="text-purple-800 font-semibold mb-2">Booster Doses</div>
                    <div className="text-2xl font-bold text-purple-900">{certificate.boosterDoses?.length || 0}</div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  {certificate.vaccinations.length === certificate.vaccine.totalDose ? (
                    <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-200 animate-[fadeIn_0.5s_ease-out] hover:scale-105 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>All Required Doses Completed</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 animate-[fadeIn_0.5s_ease-out] hover:scale-105 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{certificate.vaccine.totalDose - certificate.vaccinations.length} Doses Remaining</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-center">
                  <div className="w-full max-w-md bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out animate-[progressBar_1.5s_ease-out_forwards] bg-gradient-to-r from-green-500 to-green-600"
                      style={{
                        width: `${(certificate.vaccinations.length / certificate.vaccine.totalDose) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Next Dose Due Date (if applicable) */}
                {certificate.vaccinations.length > 0 && 
                 certificate.vaccinations.length < certificate.vaccine.totalDose && (
                  <div className="mt-6 flex justify-center">
                    <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                      <span className="font-medium">Next Dose Due: </span>
                      {format(
                        new Date(certificate.vaccinations[certificate.vaccinations.length - 1].dateAdministered),
                        "PPP"
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Patient Information Card */}
              <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100 overflow-hidden">
                <div className="border-b border-blue-100 bg-white/50 p-4">
                  <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Patient Information
                  </h2>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-blue-800">Name</dt>
                      <dd className="text-sm font-semibold text-gray-900">{certificate.patientName}</dd>
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
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-blue-800">Nationality</dt>
                      <dd className="text-sm font-semibold text-gray-900">{certificate.nationality}</dd>
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
                  </dl>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Vaccination History Card */}
              <div className="rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 overflow-hidden">
                <div className="border-b border-green-100 bg-white/50 p-4">
                  <h2 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Vaccination History
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
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
                            <dt className="text-sm font-medium text-green-800">Dose Number</dt>
                            <dd className="text-sm font-semibold text-gray-900">{vaccination.doseNumber}</dd>
                          </div>
                          <div className="space-y-1">
                            <dt className="text-sm font-medium text-green-800">Date Administered</dt>
                            <dd className="text-sm font-semibold text-gray-900">
                              {format(new Date(vaccination.dateAdministered), "PPP")}
                            </dd>
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
                  </div>
                </div>
              </div>

              {/* Booster Doses Card */}
              <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 overflow-hidden">
                <div className="border-b border-purple-100 bg-white/50 p-4">
                  <h2 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Booster Doses
                  </h2>
                </div>
                <div className="p-6">
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
                            <span className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-800">
                              Booster Dose #{index + 1}
                            </span>
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
