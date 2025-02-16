"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { formatCertificateNumber } from "@/lib/utils";

export type Certificate = {
  id: string;
  certificateNo: number;
  patientName: string;
  fatherName: string;
  motherName: string;
  permanentAddress: string;
  phoneNumber: string;
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
    vaccinatedById: string;
    vaccinatedByName: string;
  }>;
  boosterDoses: Array<{
    id: string;
    vaccineId: string;
    dateAdministered: string;
    vaccinationCenter: string;
    vaccinatedById: string;
    vaccinatedByName: string;
  }>;
};

export const columns: ColumnDef<Certificate>[] = [
  {
    accessorKey: "certificateNo",
    header: "Certificate No",
    cell: ({ row }) => {
      const certificateNo = row.getValue("certificateNo");
      return formatCertificateNumber(certificateNo as number);
    },
  },
  {
    accessorKey: "patientName",
    header: "Patient Name",
  },
  {
    accessorKey: "nidNumber",
    header: "NID Number",
  },
  {
    accessorKey: "passportNumber",
    header: "Passport Number",
  },
  {
    accessorKey: "nationality",
    header: "Nationality",
  },
  {
    accessorKey: "vaccine.name",
    header: "Vaccine",
  },
  {
    id: "vaccinations",
    header: "Dose Taken",
    cell: ({ row }) => {
      const doseCount = row.original.vaccinations?.length || 0;
      const totalDoses = row.original.vaccine.totalDose || 0;
      const isComplete = doseCount === totalDoses;
      
      return (
        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded ${
          isComplete 
            ? "text-white bg-green-600" 
            : "text-white bg-red-600"
        }`}>
          {doseCount} / {totalDoses}
        </span>
      );
    },
  },
  {
    id: "boosterDoses",
    header: "Booster Doses",
    cell: ({ row }) => {
      const boosterCount = row.original.boosterDoses?.length || 0;
      return (
        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded ${
          boosterCount > 0 
            ? "text-white bg-green-600" 
            : "text-white bg-gray-600"
        }`}>
          {boosterCount}
        </span>
      );
    },
  },
  {
    accessorKey: "dateAdministered",
    header: "Date Administered",
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateAdministered"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const certificate = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-black bg-transparent">
              <DotsHorizontalIcon className="h-4 w-4 text-black" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white shadow-md rounded-md z-10 border border-gray-300"
          >
            <Link href={`/dashboard/certificates/${certificate.id}`}>
              <DropdownMenuItem className="cursor-pointer bg-white text-black hover:bg-gray-100">
                View details
              </DropdownMenuItem>
            </Link>
            <Link href={`/dashboard/certificates/${certificate.id}/edit`}>
              <DropdownMenuItem className="cursor-pointer bg-white text-black hover:bg-gray-100">
                Edit
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
