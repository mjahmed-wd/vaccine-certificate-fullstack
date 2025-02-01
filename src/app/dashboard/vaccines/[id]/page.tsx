import React from "react";
import EditVaccineForm from "./edit-vaccine-form";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditVaccinePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <EditVaccineForm id={resolvedParams.id} />;
}
