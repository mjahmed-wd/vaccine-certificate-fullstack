import React from "react";
import EditVaccineForm from "./edit-vaccine-form";

interface PageProps {
  params: Promise<Record<string, string>>;
}

export default async function EditVaccinePage({ params }: PageProps) {
  const { id } = await params;
  return <EditVaccineForm id={id} />;
}
