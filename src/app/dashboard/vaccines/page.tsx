import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Vaccines",
};

export default async function VaccinesPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const vaccines = await db.vaccine.findMany({
    include: {
      providers: true
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold">Vaccines</h1>
        {session.user.role === "ADMIN" && (
          <Link href="/dashboard/vaccines/create">
            <Button>Add Vaccine</Button>
          </Link>
        )}
      </div>
      <DataTable columns={columns} data={vaccines} />
    </div>
  );
}