"use client";


/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from "react";
import PrintPreview from "./components/print-preview";
import { CertificateWithDetails } from "@/lib/api/certificates";
import { useParams } from "next/navigation";

const VaccinationCertificatePrint = () => {
  const [certificate, setCertificate] = useState<CertificateWithDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
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
    fetchCertificate();
  }, [fetchCertificate]);

  if (loading || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <PrintPreview certificate={certificate} />;
};

export default VaccinationCertificatePrint;
