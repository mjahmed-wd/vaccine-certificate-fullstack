import { Certificate } from "@/app/dashboard/certificates/columns"
import { Vaccine } from "./vaccines"

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export interface CertificateWithDetails extends Certificate {
  vaccine: Vaccine
  vaccinations: Array<{
    id: string
    vaccineId: string
    doseNumber: number
    dateAdministered: string
    vaccinationCenter: string
    vaccine: Vaccine
    vaccinatedBy: {
      firstName: string
      lastName: string
      center: string
    }
  }>
}

export async function getCertificates(): Promise<Certificate[]> {
  const response = await fetch(`${API_BASE_URL}/api/certificates`)
  if (!response.ok) {
    throw new Error("Failed to fetch certificates")
  }
  return response.json()
}

export async function getCertificate(id: string): Promise<CertificateWithDetails> {
  const response = await fetch(`${API_BASE_URL}/api/certificates/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch certificate")
  }
  return response.json()
}

export async function createCertificate(
  data: Omit<Certificate, "id" | "certificateNo" | "isActive">
): Promise<Certificate> {
  const response = await fetch(`${API_BASE_URL}/api/certificates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error("Failed to create certificate")
  }
  return response.json()
}

export async function updateCertificate(
  id: string,
  data: Partial<Omit<Certificate, "id" | "certificateNo">>
): Promise<Certificate> {
  const response = await fetch(`${API_BASE_URL}/api/certificates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error("Failed to update certificate")
  }
  return response.json()
}

export async function deleteCertificate(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/certificates/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete certificate")
  }
} 