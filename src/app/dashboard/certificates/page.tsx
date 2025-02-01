import { Metadata } from "next"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { getCertificates } from "@/lib/api/certificates"

export const metadata: Metadata = {
  title: "Certificates",
  description: "Manage vaccination certificates",
}

export default async function CertificatesPage() {
  const certificates = await getCertificates()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={certificates} />
    </div>
  )
} 