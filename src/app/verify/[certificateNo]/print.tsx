/* eslint-disable @next/next/no-img-element */
"use client";

import { encryptText } from "@/lib/crypto";
import { formatCertificateNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import QRCode from "react-qr-code";

export interface Certificate {
  id: string;
  certificateNo: number;
  patientName: string;
  fatherName: string;
  motherName: string;
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
    provider: {
      id: string;
      name: string;
    };
  }>;
  boosterDoses?: Array<{
    id: string;
    dateAdministered: string;
    vaccinationCenter: string;
    vaccinatedByName: string;
    provider: {
      id: string;
      name: string;
    };
  }>;
}

interface VaccinationCertificatePrintProps {
  certificate: Certificate;
  isShowOnScreen: boolean;
}

export default function VaccinationCertificatePrint({
  certificate,
  isShowOnScreen,
}: VaccinationCertificatePrintProps) {
  const qrValue = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${encryptText(
    certificate.certificateNo.toString()
  )}`;

  // Helper function to find vaccination by dose number
  const getVaccinationByDose = (doseNumber: number) => {
    return certificate.vaccinations.find((v) => v.doseNumber === doseNumber);
  };

  return (
    <div
      id="certificate-print"
      className={`${isShowOnScreen ? "block" : "hidden"} print:block`}
    >
      <div className="certificate-container">
        <img src="/pad-top.jpg" alt="Logo" className="logo" />

        {/* Single Combined Table */}
        <table className="certificate-table">
          <tbody>
            {/* Certificate Header */}
            <tr>
              <td className="cert-no-cell" colSpan={4}>
                Certificate No:{" "}
                {formatCertificateNumber(certificate.certificateNo)}
              </td>
              <td colSpan={4} className="date-cell">
                Date: {formatDate(certificate.dateAdministered, "dd/MM/yyyy")}
              </td>
            </tr>

            {/* Beneficiary Details Section */}
            <tr className="section-header">
              <td colSpan={8}>Beneficiary Details</td>
            </tr>
            <tr>
              <td className="label-cell" colSpan={2}>
                Name:
              </td>
              <td colSpan={2}>{certificate.patientName}</td>
              <td className="label-cell" colSpan={2}>
                Father&apos;s Name:
              </td>
              <td colSpan={2}>{certificate.fatherName}</td>
            </tr>
            <tr>
              <td className="label-cell" colSpan={2}>
                Mother&apos;s Name:
              </td>
              <td colSpan={2}>{certificate.motherName}</td>
              <td className="label-cell" colSpan={2}>
                Date of Birth:
              </td>
              <td colSpan={2}>
                {formatDate(certificate.dateOfBirth, "dd/MM/yyyy")}
              </td>
            </tr>
            <tr>
              <td className="label-cell" colSpan={2}>
                Gender:
              </td>
              <td colSpan={2}>{certificate.gender}</td>
              <td className="label-cell" colSpan={2}>
                NID No:
              </td>
              <td colSpan={2}>{certificate.nidNumber}</td>
            </tr>
            <tr>
              <td className="label-cell" colSpan={2}>
                Passport No:
              </td>
              <td colSpan={2}>{certificate.passportNumber}</td>
              <td className="label-cell" colSpan={2}>
                Nationality:
              </td>
              <td colSpan={2}>{certificate.nationality}</td>
            </tr>

            {/* Vaccination Details Section */}
            <tr className="section-header">
              <td colSpan={8}>Vaccination Details</td>
            </tr>
            <tr>
              <td className="label-cell" colSpan={2}>
                Name of Vaccine:
              </td>
              <td colSpan={2}>{certificate.vaccine.name} (Pfizer)</td>
              <td className="label-cell" colSpan={2}>
                Vaccination Center:
              </td>
              <td colSpan={2}>Popular Medical Centre and Hospital.</td>
            </tr>

            {/* Regular Doses */}
            {Array.from({ length: Math.ceil(certificate.vaccine.totalDose / 2) }).map((_, index) => {
              const firstDoseNumber = index * 2 + 1;
              const secondDoseNumber = index * 2 + 2;
              const firstDose = getVaccinationByDose(firstDoseNumber);
              const secondDose = getVaccinationByDose(secondDoseNumber);
              const showSecondDose = secondDoseNumber <= certificate.vaccine.totalDose;

              return (
                <tr key={`dose-pair-${index}`}>
                  <td colSpan={1}>Dose {firstDoseNumber}</td>
                  <td className="text-center" colSpan={1}>{firstDose ? "✓" : "☐"}</td>
                  <td colSpan={2}>Given Date: {firstDose?.dateAdministered ? formatDate(firstDose.dateAdministered, "dd/MM/yyyy") : ""}</td>
                  {showSecondDose ? (
                    <>
                      <td colSpan={1}>Dose {secondDoseNumber}</td>
                      <td className="text-center" colSpan={1}>{secondDose ? "✓" : "☐"}</td>
                      <td colSpan={2}>Given Date: {secondDose?.dateAdministered ? formatDate(secondDose.dateAdministered, "dd/MM/yyyy") : ""}</td>
                    </>
                  ) : (
                    <td colSpan={4}></td>
                  )}
                </tr>
              );
            })}

            {/* Booster Row */}
            {(!certificate.boosterDoses || certificate.boosterDoses.length === 0) && (
              <tr>
                <td colSpan={1}>Booster</td>
                <td className="text-center" colSpan={1}>☐</td>
                <td colSpan={2}></td>
                <td colSpan={4}></td>
              </tr>
            )}
            {certificate.boosterDoses?.map((booster, index) => (
              <tr key={`booster-${index}`}>
                <td colSpan={1}>Booster {index + 1}</td>
                <td className="text-center" colSpan={1}>✓</td>
                <td colSpan={2}>Given Date: {formatDate(booster.dateAdministered, "dd/MM/yyyy")}</td>
                {index % 2 === 0 && certificate.boosterDoses!.length > index + 1 ? (
                  <>
                    <td colSpan={1}>Booster {index + 2}</td>
                    <td className="text-center" colSpan={1}>✓</td>
                    <td colSpan={2}>Given Date: {formatDate(certificate.boosterDoses![index + 1].dateAdministered, "dd/MM/yyyy")}</td>
                  </>
                ) : (
                  <td colSpan={4}></td>
                )}
              </tr>
            ))}

            {/* Email Row */}
            <tr>
              <td colSpan={8} className="email-cell">
                E-mail:{" "}
                <a href="mailto:popularsylhet2005@gmail.com">
                  popularsylhet2005@gmail.com
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        {certificate.vaccine.totalDose === certificate.vaccinations.length && (
          <p className="completion-text">
            Above mentioned Bangladeshi resident has completed{" "}
            {certificate.gender === "MALE" ? "his" : "her"}{" "}
            <span className="underline">{certificate.vaccine.name}</span>{" "}
            vaccination on{" "}
            {formatDate(
              certificate.vaccinations[certificate.vaccinations.length - 1]
                .dateAdministered,
              "dd/MM/yyyy"
            )}{" "}
            from Popular Medical centre and Hospital, Sylhet.
          </p>
        )}

        <div className="footer">
          <QRCode value={qrValue} size={128} />
          <p>
            This certification is issued for acknowledgement to respective
            authority.
          </p>
          <p>
            (Uploaded in website:{" "}
            <a href="http://www.popularsylhet.com">www.popularsylhet.com</a>)
          </p>
        </div>
      </div>

      <style>{`
        .certificate-container {
          font-family: "Times New Roman", serif;
          margin: 0 auto;
          padding: 20px;
        }

        .logo {
          display: block;
          width: 100%;
          height: auto;
          margin-bottom: 20px;
        }

        .certificate-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          table-layout: fixed;
        }

        .certificate-table td {
          border: 1px solid #000;
          padding: 4px 6px;
          height: 24pt;
          font-weight: bold;
          font-size: 12pt;
          vertical-align: middle;
        }

        .section-header td {
          font-size: 12pt;
          font-weight: bold;
          text-align: center;
          background-color: #f8f8f8;
          padding: 4px;
          height: 20pt;
        }

        .label-cell {
          background-color: #f8f8f8;
          padding: 4px;
        }

        .text-center {
          text-align: center;
        }

        .email-cell {
          text-align: center;
        }

        .email-cell a {
          color: blue;
          text-decoration: underline;
        }

        .completion-text {
          text-align: center;
          margin: 20px 0;
          font-weight: bold;
          font-size: 12pt;
        }

        .footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }

        .footer p {
          margin: 5px 0;
          font-weight: bold;
          font-size: 12pt;
        }

        .footer a {
          color: blue;
          text-decoration: underline;
        }

        .underline {
          text-decoration: underline;
        }

        @media print {
          .certificate-container {
            padding: 0;
            width: 100%;
          }

          .logo {
            width: 100%;
            height: auto;
          }
          
          .section-header td,
          .label-cell,
          .dose-header td {
            background-color: #f8f8f8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
