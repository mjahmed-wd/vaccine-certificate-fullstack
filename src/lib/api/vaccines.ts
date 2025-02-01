const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export interface Vaccine {
  id: string
  name: string
  totalDose: number
  createdAt: string
  updatedAt: string
}

export async function getVaccines(): Promise<Vaccine[]> {
  const response = await fetch(`${API_BASE_URL}/api/vaccines`)
  if (!response.ok) {
    throw new Error("Failed to fetch vaccines")
  }
  return response.json()
}

export async function getVaccine(id: string): Promise<Vaccine> {
  const response = await fetch(`${API_BASE_URL}/api/vaccines/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch vaccine")
  }
  return response.json()
}

export async function createVaccine(data: Pick<Vaccine, "name" | "totalDose">): Promise<Vaccine> {
  const response = await fetch(`${API_BASE_URL}/api/vaccines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error("Failed to create vaccine")
  }
  return response.json()
}

export async function updateVaccine(
  id: string,
  data: Partial<Pick<Vaccine, "name" | "totalDose">>
): Promise<Vaccine> {
  const response = await fetch(`${API_BASE_URL}/api/vaccines/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error("Failed to update vaccine")
  }
  return response.json()
}

export async function deleteVaccine(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/vaccines/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete vaccine")
  }
} 