"use client";

interface Certificate {
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
  }>;
  boosterDoses?: Array<{
    id: string;
    dateAdministered: string;
    vaccinationCenter: string;
    vaccinatedByName: string;
  }>;
}

interface VaccinationCertificatePrintProps {
  certificate: Certificate;
}

export default function VaccinationCertificatePrint({
  certificate,
}: VaccinationCertificatePrintProps) {
  return (
    <div
      id="certificate-print"
      className="hidden print:block"
      style={{ fontFamily: "Times New Roman" }}
    >
      <div className="">
        <img src="/pad-top.jpg" alt="Logo" />

        <hr className="border-t-2 border-black mt-2" />
        <hr className="border-t-2 border-black" style={{ marginTop: "2px" }} />
        <h2
          className="font-serif font-bold text-center underline mb-4"
          style={{ fontSize: "1.2rem" }}
        >
          Vaccination Certificate
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-black text-left p-2">
                Certificate No:
              </th>
              <th className="border border-black text-left p-2" colSpan={3}>
                Date: 04/02/2025
              </th>
            </tr>
            <tr>
              <th className="border border-black text-left p-2" colSpan={2}>
                Beneficiary Details
              </th>
              <th className="border border-black text-left p-2" colSpan={2}>
                Vaccination Details
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2">Name:</td>
              <td className="border border-black p-2">
                {certificate.patientName}
              </td>
              <td className="border border-black p-2">Name of Vaccine</td>
              <td className="border border-black p-2">
                Ingovax (Meningococcal Polysaccharide Vaccine BP)
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">Father&apos;s Name:</td>
              <td className="border border-black p-2">
                {certificate.fatherName}
              </td>
              <td className="border border-black p-2">Vaccination Center:</td>
              <td className="border border-black p-2">
                Popular Medical Centre and Hospital.
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">Mother&apos;s Name:</td>
              <td className="border border-black p-2">
                {certificate.motherName}
              </td>
              <td className="border border-black p-2">Dose 1</td>
              <td className="border border-black p-2">☐ Given Date:</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Date of Birth:</td>
              <td className="border border-black p-2">
                {certificate.dateOfBirth}
              </td>
              <td className="border border-black p-2">Dose 2</td>
              <td className="border border-black p-2">☐ Given Date:</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Gender:</td>
              <td className="border border-black p-2">{certificate.gender}</td>
              <td className="border border-black p-2">Dose 3</td>
              <td className="border border-black p-2">☐ Given Date:</td>
            </tr>
            <tr>
              <td className="border border-black p-2">NID No:</td>
              <td className="border border-black p-2">
                {certificate.nidNumber}
              </td>
              <td className="border border-black p-2">Dose 4</td>
              <td className="border border-black p-2">☐ Given Date:</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Passport No:</td>
              <td className="border border-black p-2">
                {certificate.passportNumber}
              </td>
              <td className="border border-black p-2">Booster Dose</td>
              <td className="border border-black p-2">☐ Given Date:</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Nationality:</td>
              <td className="border border-black p-2">
                {certificate.nationality}
              </td>
              <td className="border border-black p-2" colSpan={2}>
                E-mail: popularsylhet2005@gmail.com
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
