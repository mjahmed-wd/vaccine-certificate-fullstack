"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { useSession } from "next-auth/react";

export type Vaccine = {
  id: string;
  name: string;
  totalDose: number;
  providers: { id: string; name: string }[];
};

const ActionCell = ({ row }: { row: Row<Vaccine> }) => {
  const session = useSession();
  if (session.data?.user.role !== "ADMIN") {
    return null;
  }
  return <DataTableRowActions row={row} />;
};

export const columns: ColumnDef<Vaccine>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "totalDose",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Doses" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            {row.getValue("totalDose")} Doses
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "providers",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Providers" />
    ),
    cell: ({ row }) => {
      const providers = row.original.providers;
      return (
        <div className="flex flex-wrap gap-1">
          {providers.map((provider) => (
            <span
              key={provider.id}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
            >
              {provider.name}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} />,
  },
]; 