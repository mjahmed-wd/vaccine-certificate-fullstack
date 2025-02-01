import { Metadata } from "next"
import { CreateCertificateForm } from "./create-certificate-form"

export const metadata: Metadata = {
  title: "Create Certificate",
  description: "Create a new vaccination certificate",
}

export default function CreateCertificatePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create Certificate</h1>
        <p className="text-muted-foreground">
          Create a new vaccination certificate for a patient
        </p>
      </div>
      <CreateCertificateForm />
    </div>
  )
} 