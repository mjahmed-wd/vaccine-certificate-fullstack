"use client";

import { CertificateWithDetails } from "@/lib/api/certificates";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PrintPreview from "../components/print-preview";

const DownloadPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [certificate, setCertificate] = useState<CertificateWithDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { certificateNo } = useParams();

  const fetchCertificate = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/certificates/by-number/${certificateNo}`
      );
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
        const html2pdf = (await import("html2pdf.js")).default;
        const element = document.getElementById("certificate");
        if (element) {
          const opt = {
            margin: 10,
            filename: `vaccination_certificate_${certificateNo}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          };

          await html2pdf().set(opt).from(element).save();
          router.push(
            `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificateNo}`
          );
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
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

  return <PrintPreview certificate={certificate} />;
};
export default DownloadPage;
