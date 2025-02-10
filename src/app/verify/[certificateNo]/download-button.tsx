"use client";

import { DownloadIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

interface DownloadButtonProps {
  certificate: Certificate;
}

export default function DownloadButton({}: DownloadButtonProps) {
  const { certificateNo } = useParams();
  return (
    <Link
      href={`/verify/${certificateNo}/download`}
      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
      style={{ height: "38px" }}
      aria-label="Download PDF certificate"
    >
      <DownloadIcon className="h-4 w-4" />
      <span className="text-sm font-medium">Download PDF</span>
    </Link>
  );
}
