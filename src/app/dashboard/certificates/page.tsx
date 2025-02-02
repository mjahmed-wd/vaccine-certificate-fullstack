import { getCertificates } from "@/lib/api/certificates"
import { Metadata } from "next"
import { columns } from "./columns"
import { DataTable } from "./data-table"

export const metadata: Metadata = {
  title: "Certificates",
  description: "Manage vaccination certificates",
}

// Make the page dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CertificatesPage() {
  try {
    const certificates = await getCertificates()

    return (
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={certificates} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return (
      <div className="container mx-auto py-10">
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          Failed to load certificates. Please try again later.
        </div>
      </div>
    )
  }
} 