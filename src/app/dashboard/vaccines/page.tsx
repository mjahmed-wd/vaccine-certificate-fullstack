import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Vaccines",
};

async function getVaccines() {
  const vaccines = await db.vaccine.findMany({
    include: {
      providers: true
    },
    orderBy: {
      name: "asc",
    },
  });

  return vaccines;
}

export default async function VaccinesPage() {
  const vaccines = await getVaccines();

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold">Vaccines</h1>
        <Link href="/dashboard/vaccines/create">
          <Button>Add Vaccine</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={vaccines} />
    </div>
  );
}