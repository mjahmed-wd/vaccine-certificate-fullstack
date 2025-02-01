/* eslint-disable @next/next/no-img-element */
import React from "react";

const VaccinationCertificatePrint = () => {
  return (
    <div id="certificate" className="border-2 border-black p-8 font-sans max-w-2xl mx-auto bg-white hidden print:block">
      <div className="flex items-center justify-between mb-5">
        <img src="/bd-logo.png" alt="Government of Bangladesh logo" className="w-20 h-auto" />
        <div className="text-right">
          <h2 className="m-0">Government of the Peoples&apos; Republic of Bangladesh</h2>
          <h3 className="m-0">Government Employees Hospital</h3>
          <p className="my-1">Fulbaria, Dhaka-1000</p>
          <p className="my-1">
            <a href="http://www.skh.gov.bd">www.skh.gov.bd</a>
          </p>
          <p className="my-1">
            Email: <a href="mailto:geh@mopa.gov.bd">geh@mopa.gov.bd</a>
          </p>
        </div>
      </div>

      <div className="text-center mb-5">
        <h1>Meningococcal Vaccination Certificate</h1>
      </div>

      <div className="flex justify-between">
        <div className="w-1/2">
          <h3>Beneficiary Details</h3>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="p-1 border border-black text-left">Certificate No:</td>
                <td className="p-1 border border-black text-left">01</td>
              </tr>
              <tr>
                <td className="p-1 border border-black text-left">NID No:</td>
                <td className="p-1 border border-black text-left">8244932557</td>
              </tr>
              <tr>
                <td className="p-1 border border-black text-left">Passport No:</td>
                <td className="p-1 border border-black text-left">D00017716</td>
              </tr>
              <tr>
                <td className="p-1 border border-black text-left">Nationality:</td>
                <td className="p-1 border border-black text-left">Bangladeshi</td>
              </tr>
              <tr>
                <td className="p-1 border border-black text-left">Name:</td>
                <td className="p-1 border border-black text-left">SALEH UDDIN AHMED</td>
              </tr>
              <tr>
                <td className="p-1 border border-black text-left">Date of Birth:</td>
                <td className="p-1 border border-black text-left">01-01-1949</td>
              </tr>
              <tr>
                <td className="p-1 border border-black text-left">Gender:</td>
                <td className="p-1 border border-black text-left">Male</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="w-1/2">
          <h3>Vaccination Details</h3>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="p-1 border border-black text-left">Date of Vaccination:</td>
                <td className="p-1 border border-black text-left">30-12-2024</td>
              </tr>
              <tr>
                <td className="p-1 border border-black text-left">Name of Vaccine:</td>
                <td className="p-1 border border-black text-left">Nimenrix (Pfizer)</td>
              </tr>
              <tr>
                <td className="p-1 border border-black text-left">Vaccination Center:</td>
                <td className="p-1 border border-black text-left">Government Employees Hospital</td>
              </tr>
              <tr>
                <td className="p-1 border border-black text-left">Vaccinated by:</td>
                <td className="p-1 border border-black text-left">Mansura Akter (EPI Technician)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 text-center">
        <p>
          To verify this certificate, please visit:
          <a href="http://www.skh.gov.bd" className="text-blue-500 no-underline">
            www.skh.gov.bd
          </a>{" "}
          or email:
          <a href="mailto:geh@mopa.gov.bd" className="text-blue-500 no-underline">
            geh@mopa.gov.bd
          </a>
        </p>
        <p>
          Name of the Physician: Dr. Md. Zia Uddin
          <br />
          BM&DC Reg No: A-52808
          <br />
          Designation: Resident Physician (RP)
          <br />
          Government Employees Hospital
          <br />
          Ministry of Public Administration
          <br />
          Bangladesh
        </p>
      </div>
    </div>
  );
};

export default VaccinationCertificatePrint;
