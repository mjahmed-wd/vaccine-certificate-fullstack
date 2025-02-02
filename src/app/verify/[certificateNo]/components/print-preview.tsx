"use client";

import { CertificateWithDetails } from "@/lib/api/certificates";
import { format } from "date-fns";
import { useParams } from "next/navigation";
/* eslint-disable @next/next/no-img-element */
import QRCode from "react-qr-code";

interface PrintPreviewProps {
  certificate: CertificateWithDetails;
}

const PrintPreview = ({ certificate }: PrintPreviewProps) => {
  const { certificateNo } = useParams();
  const qrValue = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificate.certificateNo}`;

  return (
    <div className="min-h-screen bg-white print:min-h-0 hidden print:block">
      <div className="w-[210mm] mx-auto p-8 print:p-4">
        <div
          id="certificate"
          className="border border-gray-200 rounded-lg p-8 font-sans bg-white print:border-0 print:p-0 print:m-0"
        >
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6 print:pb-4 print:mb-6">
            <div className="flex items-center space-x-4">
              <img
                src="/popular-logo.png"
                alt="Popular Medical Centre logo"
                className="w-20 h-20 object-contain print:w-16 print:h-16"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1">
                  POPULAR MEDICAL CENTRE & HOSPITAL
                </h1>
                <p className="text-xs text-gray-600">
                  Sobhanighat, Sylhet | Phone: 09636772211
                  <br />
                  Email: popularsylhet2005@gmail.com | www.popularsylhet.com
                </p>
              </div>
            </div>
            <div className="print:block">
              <QRCode
                value={qrValue}
                size={120}
                className="bg-white print:!block"
                style={{ pageBreakInside: "avoid" }}
              />
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-8 print:mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Vaccination Certificate
            </h2>
            <p className="text-gray-600 font-medium">
              Certificate No: {certificateNo}
            </p>
          </div>

          {/* Beneficiary Details */}
          <div className="mb-8 print:mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Beneficiary Details
            </h3>
            <div className="grid grid-cols-3 gap-4 print:gap-3">
              <DetailItem label="Full Name" value={certificate.patientName} />
              <DetailItem
                label="Date of Birth"
                value={format(new Date(certificate.dateOfBirth), "dd-MM-yyyy")}
              />
              <DetailItem label="Gender" value={certificate.gender} />
              <DetailItem label="Nationality" value={certificate.nationality} />
              {certificate.nidNumber && (
                <DetailItem label="NID No" value={certificate.nidNumber} />
              )}
              {certificate.passportNumber && (
                <DetailItem
                  label="Passport No"
                  value={certificate.passportNumber}
                />
              )}
            </div>
          </div>

          {/* Vaccination Details Table */}
          <div className="mb-8 print:mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Vaccination History
            </h3>
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse print:text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-600 font-medium w-[15%] print:py-1">
                      Dose
                    </th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium w-[25%] print:py-1">
                      Vaccine Name
                    </th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium w-[18%] print:py-1 whitespace-nowrap">
                      Date
                    </th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium w-[22%] print:py-1">
                      Center
                    </th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium w-[20%] print:py-1">
                      Vaccinator
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {certificate.vaccinations
                    .slice()
                    .reverse()
                    .map((vaccination) => (
                      <tr
                        key={vaccination.id}
                        className="border-b border-gray-100"
                      >
                        <td className="py-2 px-3 text-gray-800 print:py-1 whitespace-nowrap">
                          {vaccination.doseNumber}
                          {getDoseNumberSuffix(vaccination.doseNumber)} Dose
                        </td>
                        <td className="py-2 px-3 text-gray-800 print:py-1">
                          {vaccination.vaccineName || "N/A"}
                        </td>
                        <td className="py-2 px-3 text-gray-800 print:py-1 whitespace-nowrap">
                          {format(new Date(vaccination.dateAdministered), "dd-MM-yyyy")}
                        </td>
                        <td className="py-2 px-3 text-gray-800 print:py-1">
                          {vaccination.vaccinationCenter || "N/A"}
                        </td>
                        <td className="py-2 px-3 text-gray-800 print:py-1">
                          {vaccination.vaccinatedByName || "N/A"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Section */}
          <div className="text-center border-t border-gray-100 pt-6 print:pt-4 print:mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Verify this certificate at: {process.env.NEXT_PUBLIC_APP_URL}/verify/{certificateNo}
            </p>
            <p className="text-xs text-gray-500 italic print:mb-0">
              This is a system-generated certificate and does not require a signature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 p-3 rounded print:bg-transparent print:p-1">
    <div className="text-sm text-gray-600 mb-1 print:mb-0">{label}</div>
    <div className="text-gray-800 font-medium">{value}</div>
  </div>
);

const getDoseNumberSuffix = (num: number): string => {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
};

export default PrintPreview;
