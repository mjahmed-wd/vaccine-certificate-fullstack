/* eslint-disable @next/next/no-img-element */
"use client";

import { encryptText } from "@/lib/crypto";
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
  return (
    <div
      id="certificate-print"
      className={`${isShowOnScreen ? "block" : "hidden"} print:block`}
      style={{ fontFamily: "Times New Roman" }}
    >
      <div className="">
        <img src="/pad-top.jpg" alt="Logo" />

        <hr className="border-t-2 border-black mt-2" />
        <hr className="border-t-2 border-black" style={{ marginTop: "2px" }} />
        {/* <img src="/pad-bar.jpg" alt="Bar" className="mt-2"/> */}
        <h2
          className="font-serif font-bold text-center text-black underline mb-4"
          style={{ fontSize: "1.2rem" }}
        >
          Vaccination Certificate
        </h2>
        <table className="c13">
          <tbody>
            <tr className="c55">
              <td className="c67" colSpan={4} rowSpan={1}>
                <p className="c23">
                  <span className="c0">
                    &nbsp;Certificate No: {certificate.certificateNo}
                  </span>
                </p>
                <p className="c23 c24">
                  <span className="c0"></span>
                </p>
              </td>
              <td className="c31" colSpan={1} rowSpan={1}>
                <p className="c23">
                  <span className="c0">
                    &nbsp;Date:{" "}
                    {formatDate(certificate.dateAdministered, "dd/MM/yyyy")}
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c55">
              <td className="c35" colSpan={2} rowSpan={1}>
                <p className="c48">
                  <span className="c0">Beneficiary Details</span>
                </p>
              </td>
              <td className="c38" colSpan={3} rowSpan={1}>
                <p className="c4">
                  <span className="c0">Vaccination Details</span>
                </p>
              </td>
            </tr>
            <tr className="c70">
              <td className="c32" colSpan={1} rowSpan={1}>
                <p className="c23 c69">
                  <span className="c0">Name:</span>
                </p>
              </td>
              <td className="c15" colSpan={1} rowSpan={1}>
                <p className="c10">
                  <span className="c0">{certificate.patientName}</span>
                </p>
              </td>
              <td className="c14" colSpan={1} rowSpan={1}>
                <p className="c10">
                  <span className="c0">Name of</span>
                </p>
                <p className="c10">
                  <span className="c0">Vaccine</span>
                </p>
              </td>
              <td className="c39" colSpan={2} rowSpan={1}>
                <p className="c10">
                  <span className="c0">{certificate.vaccine.name}</span>
                </p>
                <p className="c10">
                  <span className="c0">
                    ({certificate.vaccinations?.[0]?.provider?.name})
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c85">
              <td className="c32" colSpan={1} rowSpan={1}>
                <p className="c10">
                  <span className="c0">Father&apos;s Name:</span>
                </p>
                <p className="c23 c57 c69">
                  <span className="c0"></span>
                </p>
              </td>
              <td className="c15" colSpan={1} rowSpan={1}>
                <p className="c9">
                  <span className="c0">{certificate.fatherName}</span>
                </p>
              </td>
              <td className="c14" colSpan={1} rowSpan={1}>
                <p className="c10">
                  <span className="c0">Vaccination Center:</span>
                </p>
              </td>
              <td className="c39" colSpan={2} rowSpan={1}>
                <p className="c56">
                  <span className="c0">
                    Popular Medical Centre and Hospital.
                  </span>
                </p>
              </td>
            </tr>
            <tr className="c27">
              <td className="c32" colSpan={1} rowSpan={1}>
                <p className="c45">
                  <span className="c0">&nbsp; Mother&apos;s Name:</span>
                </p>
              </td>
              <td className="c15" colSpan={1} rowSpan={1}>
                <p className="c7">
                  <span className="c0">{certificate.motherName}</span>
                </p>
              </td>
              <td className="c14" colSpan={3} rowSpan={1}>
                <p className="c10">
                  <span className="c0">Vaccination Details</span>
                </p>
              </td>
            </tr>
            {/* Generate rows for regular doses */}
            {Array.from({ length: certificate.vaccine.totalDose }).map(
              (_, index) => {
                const doseNumber = index + 1;
                const vaccination = certificate.vaccinations.find(
                  (v) => v.doseNumber === doseNumber
                );

                return (
                  <tr key={`dose-${doseNumber}`} className="c18">
                    {doseNumber === 1 && (
                      <>
                        <td
                          className="c32"
                          colSpan={1}
                          rowSpan={certificate.vaccine.totalDose}
                        >
                          <p className="c10">
                            <span className="c0">Date of Birth:</span>
                          </p>
                        </td>
                        <td
                          className="c50"
                          colSpan={1}
                          rowSpan={certificate.vaccine.totalDose}
                        >
                          <p className="c7">
                            <span className="c0">
                              {formatDate(
                                certificate.dateOfBirth,
                                "dd/MM/yyyy"
                              )}
                            </span>
                          </p>
                        </td>
                      </>
                    )}
                    <td className="c11" colSpan={1}>
                      <p className="c10">
                        <span className="c0">Dose {doseNumber}</span>
                      </p>
                    </td>
                    <td className="c43" colSpan={1}>
                      <p className="c2">
                        {" "}
                        {vaccination ? (
                          <span className="c0">✓</span>
                        ) : (
                          <span className="c0">☐</span>
                        )}
                      </p>
                    </td>
                    <td className="c75" colSpan={1}>
                      <p className="c10">
                        <span className="c0">
                          Given Date:{" "}
                          {vaccination
                            ? formatDate(
                                vaccination.dateAdministered,
                                "dd/MM/yyyy"
                              )
                            : ""}
                        </span>
                      </p>
                    </td>
                  </tr>
                );
              }
            )}

            {/* Generate rows for booster doses */}
            {certificate.boosterDoses &&
              certificate.boosterDoses.length > 0 &&
              certificate.boosterDoses.map((booster, index) => (
                <tr key={`booster-${index}`} className="c18">
                  {index === 0 && (
                    <>
                      <td
                        className="c32"
                        colSpan={1}
                        rowSpan={certificate.boosterDoses?.length || 1}
                      >
                        <p className="c10">
                          <span className="c0">Gender:</span>
                        </p>
                      </td>
                      <td
                        className="c50"
                        colSpan={1}
                        rowSpan={certificate.boosterDoses?.length || 1}
                      >
                        <p className="c7">
                          <span className="c0">{certificate.gender}</span>
                        </p>
                      </td>
                    </>
                  )}
                  <td className="c11" colSpan={1}>
                    <p className="c10">
                      <span className="c0">
                        {certificate.boosterDoses!.length === 1
                          ? "Booster Dose"
                          : `Booster Dose ${index + 1}`}
                      </span>
                    </p>
                  </td>
                  <td className="c43" colSpan={1}>
                    <p className="c2">
                      <span className="c0">✓</span>
                    </p>
                  </td>
                  <td className="c75" colSpan={1}>
                    <p className="c10">
                      <span className="c0">
                        Given Date:{" "}
                        {formatDate(booster.dateAdministered, "dd/MM/yyyy")}
                      </span>
                    </p>
                  </td>
                </tr>
              ))}

            <tr className="c80">
              <td className="c32" colSpan={1} rowSpan={1}>
                <p className="c10">
                  <span className="c0">NID No:</span>
                </p>
              </td>
              <td className="c15" colSpan={1} rowSpan={1}>
                <p className="c9">
                  <span className="c0">{certificate.nidNumber}</span>
                </p>
              </td>
              <td className="c38" colSpan={3} rowSpan={3}>
                <p className="c12 c57">
                  <span className="c0"></span>
                </p>
                <p className="c12 c57">
                  <span className="c0"></span>
                </p>
                <p className="c12">
                  <span className="c0">E-mail: </span>
                  <span className="c83">
                    <a
                      className="c40"
                      href="mailto:popularsylhet2005@gmail.com"
                    >
                      popularsylhet2005@gmail.com
                    </a>
                  </span>
                </p>
                <p className="c57 c78">
                  <span className="c0"></span>
                </p>
              </td>
            </tr>
            <tr className="c62">
              <td className="c32" colSpan={1} rowSpan={1}>
                <p className="c10">
                  <span className="c0">Passport No:</span>
                </p>
              </td>
              <td className="c15" colSpan={1} rowSpan={1}>
                <p className="c23 c59">
                  <span className="c0">{certificate.passportNumber}</span>
                </p>
              </td>
            </tr>
            <tr className="c41">
              <td className="c32" colSpan={1} rowSpan={1}>
                <p className="c5">
                  <span className="c0">Nationality:</span>
                </p>
              </td>
              <td className="c15" colSpan={1} rowSpan={1}>
                <p className="c7">
                  <span className="c0">{certificate.nationality}</span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="c6">
          <span className="c0"></span>
        </p>
        {certificate.vaccine.totalDose === certificate.vaccinations.length && (
          <p className="c20">
            <span className="c0">
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Above mentioned
              Bangladeshi resident has completed{" "}
              {certificate.gender === "MALE" ? "his" : "her"}{" "}
              <span className="underline">{certificate.vaccine.name}</span>{" "}
              vaccination DD/MM/Year from Popular Medical centre and Hospital,
              Sylhet.
            </span>
          </p>
        )}
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="flex items-center justify-center">
            <QRCode value={qrValue} size={128} />
          </div>
          <div>
            <p className="c20">
              <span className="c0">
                This certification is issued for acknowledgement to respective
                authority.
              </span>
            </p>
            <p className="c20">
              <span className="c0">(Uploaded in website: </span>
              <span className="c73">
                <a
                  className="c40"
                  href="https://www.google.com/url?q=http://www.popularsylhet.com&amp;sa=D&amp;source=editors&amp;ust=1739210034126707&amp;usg=AOvVaw2SYQ0XBiCbDyiad1eGkN5z"
                >
                  www.popularsylhet.com
                </a>
              </span>
              <span className="c0">)</span>
            </p>
          </div>
        </div>
        <p className="c6">
          <span className="c0"></span>
        </p>
        <p className="c6">
          <span className="c0"></span>
        </p>
        <p className="c16">
          <span className="c0"></span>
        </p>
        <p className="c16">
          <span className="c0"></span>
        </p>
        <p className="c16">
          <span className="c0"></span>
        </p>
        <p className="c52">
          <span className="c0">&nbsp;</span>
        </p>
      </div>
    </div>
  );
}
