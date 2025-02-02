"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useRouter, useParams } from "next/navigation";
import { CertificateWithDetails } from "@/lib/api/certificates";
import { format } from "date-fns";

const DownloadPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [certificate, setCertificate] = useState<CertificateWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { certificateNo } = useParams();
  const qrValue = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificateNo}`;

  const fetchCertificate = useCallback(async () => {
    try {
      const response = await fetch(`/api/certificates/by-number/${certificateNo}`);
      if (!response.ok) throw new Error("Failed to fetch certificate");
      const data = await response.json();
      setCertificate(data);
    } catch (error) {
      console.error("Error fetching certificate:", error);
    } finally {
      setLoading(false);
    }
  }, [certificateNo]);

  useEffect(() => {
    setIsClient(true);
    fetchCertificate();
  }, [fetchCertificate]);

  const handleDownload = useCallback(async () => {
    if (isClient) {
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.getElementById("certificate");
        if (element) {
          const opt = {
            margin: 10,
            filename: `vaccination_certificate_${certificateNo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          
          await html2pdf().set(opt).from(element).save();
          router.back();
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  }, [isClient, router, certificateNo]);

  useEffect(() => {
    if (!loading && certificate && isClient) {
      handleDownload();
    }
  }, [loading, certificate, handleDownload, isClient]);

  if (loading || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div
        id="certificate"
        className="border border-gray-200 rounded-lg p-8 font-sans max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b border-gray-200 pb-6 gap-4">
          <div className="flex items-center space-x-4">
            <img
              src="/popular-logo.png"
              alt="Popular Medical Centre logo"
              className="w-20 h-20 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">
                POPULAR MEDICAL CENTRE & HOSPITAL SYLHET
              </h1>
              <p className="text-xs text-gray-600">
                Sobhanighat, Sylhet | Phone: 09636772211
                <br />
                Email: popularsylhet2005@gmail.com | www.popularsylhet.com
              </p>
            </div>
          </div>
          <QRCode value={qrValue} size={120} className="bg-white" />
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Vaccination Certificate
          </h2>
          <p className="text-gray-600 font-medium">
            Certificate No: {certificateNo}
          </p>
        </div>

        {/* Beneficiary Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Beneficiary Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Vaccination History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Dose
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Vaccine Name
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Center
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
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
                      <td className="py-3 px-4 text-gray-800">
                        {vaccination.doseNumber}
                        {getDoseNumberSuffix(vaccination.doseNumber)} Dose
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {vaccination.vaccineName || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {format(
                          new Date(vaccination.dateAdministered),
                          "dd-MM-yyyy"
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {vaccination.vaccinationCenter || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {vaccination.vaccinatedByName || "N/A"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Section */}
        <div className="text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600 mb-2">
            Verify this certificate at: {process.env.NEXT_PUBLIC_APP_URL}
            /verify/{certificateNo}
          </p>
          <p className="text-xs text-gray-500 italic">
            This is a system-generated certificate and does not require a
            signature.
          </p>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 p-3 rounded">
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="text-gray-800 font-medium">{value}</div>
  </div>
);

const getDoseNumberSuffix = (num: number): string => {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
};

export default DownloadPage;
