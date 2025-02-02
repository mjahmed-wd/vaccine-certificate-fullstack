import { Metadata } from "next"
import { EditCertificateForm } from "./edit-certificate-form"
import { getCertificate } from "@/lib/api/certificates"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit Certificate",
  description: "Edit vaccination certificate",
}

interface EditCertificatePageProps {
  params: Promise<Record<string, string>>;
}

export default async function EditCertificatePage({
  params,
}: EditCertificatePageProps) {
  const { id } = await params;
  const certificate = await getCertificate(id).catch(() => null)

  if (!certificate) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Edit Certificate</h1>
        <p className="text-muted-foreground">
          Edit vaccination certificate details
        </p>
      </div>
      <EditCertificateForm certificate={certificate} />
    </div>
  )
} 