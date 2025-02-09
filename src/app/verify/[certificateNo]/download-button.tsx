"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

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

export default function DownloadButton({ certificate }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const element = document.getElementById("certificate-print");
      if (!element) return;

      // Dynamically import html2pdf only when needed
      const html2pdf = (await import("html2pdf.js")).default;

      const opt = {
        margin: 1,
        filename: `vaccination-certificate-${certificate.certificateNo}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className="flex items-center gap-2"
      disabled={isLoading}
    >
      <DownloadIcon className="h-4 w-4" />
      {isLoading ? "Generating PDF..." : "Download PDF"}
    </Button>
  );
}
