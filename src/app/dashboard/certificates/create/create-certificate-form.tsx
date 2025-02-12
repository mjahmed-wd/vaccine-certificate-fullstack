"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCertificate } from "@/lib/api/certificates";
import { useToast } from "@/components/ui/use-toast";
import { getVaccines, type Vaccine, getVaccineById } from "@/lib/api/vaccines";
import { type Certificate } from "@prisma/client";
import { useSession } from "next-auth/react";
import { getOriginalCertificateNumber } from "@/lib/utils";

interface VaccineWithProviders extends Vaccine {
  providers: Array<{
    id: string;
    name: string;
  }>;
}

const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  nidNumber: z.string().optional(),
  passportNumber: z.string().min(1, "Passport number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  vaccineId: z.string().min(1, "Vaccine is required"),
  providerId: z.string().min(1, "Provider is required"),
  doseNumber: z.coerce.number().min(1, "Dose number is required"),
  previousCertificateNo: z
    .string()
    .refine((val) => !val || !isNaN(parseInt(val)), {
      message: "Previous certificate number must be a valid number",
    })
    .optional(),
  dateAdministered: z.string().min(1, "Date administered is required"),
  isBoosterDose: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface PreviousCertificateDetails extends Certificate {
  vaccine?: {
    name: string;
  };
  vaccinations: Array<{
    id: string;
    vaccineId: string;
    vaccineName: string;
    doseNumber: number;
    dateAdministered: string;
    vaccinationCenter: string;
    vaccinatedByName: string;
    provider: {
      name: string;
    };
  }>;
  boosterDoses: Array<{
    id: string;
    vaccineId: string;
    dateAdministered: string;
    vaccinationCenter: string;
    vaccinatedByName: string;
    provider: {
      name: string;
    };
    vaccine: {
      name: string;
    };
  }>;
}

export function CreateCertificateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [vaccines, setVaccines] = useState<VaccineWithProviders[]>([]);
  const [selectedVaccine, setSelectedVaccine] =
    useState<VaccineWithProviders | null>(null);
  const [previousCertificateDetails, setPreviousCertificateDetails] =
    useState<PreviousCertificateDetails | null>(null);
  const [isValidatingCertificate, setIsValidatingCertificate] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAllDosesCompleted, setIsAllDosesCompleted] = useState(false);

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const data = await getVaccines();
        setVaccines(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to fetch vaccines",
          variant: "destructive",
        });
      }
    };

    fetchVaccines();
  }, [toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      fatherName: "",
      motherName: "",
      permanentAddress: "",
      phoneNumber: "",
      nidNumber: "",
      passportNumber: "",
      nationality: "Bangladeshi",
      dateOfBirth: "",
      gender: "MALE",
      vaccineId: "",
      providerId: "",
      doseNumber: 1,
      previousCertificateNo: "",
      dateAdministered: new Date().toISOString().split("T")[0],
      isBoosterDose: false,
    },
  });

  const watchDoseNumber = form.watch("doseNumber");
  const watchVaccineId = form.watch("vaccineId");

  useEffect(() => {
    if (watchVaccineId) {
      const vaccine = vaccines.find((v) => v.id === watchVaccineId);
      setSelectedVaccine(vaccine || null);
    }
  }, [watchVaccineId, vaccines]);

  const handleCheckPreviousCertificate = async () => {
    const previousNo = form.getValues("previousCertificateNo");

    if (!previousNo) {
      toast({
        title: "Error",
        description: "Please enter previous certificate number",
        variant: "destructive",
      });
      return;
    }

    const originalCertificateNumber = getOriginalCertificateNumber(previousNo);

    setIsValidatingCertificate(true);
    setValidationError(null);
    setPreviousCertificateDetails(null);
    setIsAllDosesCompleted(false);

    try {
      const certificateResponse = await fetch(
        `/api/certificates/by-number/${parseInt(originalCertificateNumber.toString(), 10)}`
      );
      const certificateData = await certificateResponse.json();
      if (certificateData.error) {
        throw new Error(certificateData.error);
      }
      const vaccineResponse = await getVaccineById(certificateData.vaccineId);
      const vaccineName = vaccineResponse?.name;

      const prevData = {
        ...certificateData,
        vaccine: {
          name: vaccineName,
        },
      };
      setPreviousCertificateDetails(prevData);

      if (!certificateResponse.ok) {
        throw new Error(certificateData.error || "Failed to fetch certificate");
      }

      if (certificateData.vaccineId !== watchVaccineId) {
        setValidationError(
          `Vaccine mismatch: This certificate is for ${certificateData.vaccine.name}. Please select the same vaccine or create a new certificate.`
        );
        return;
      }

      // Check if all required doses are completed
      const allDosesCompleted =
        certificateData.vaccine.totalDose ===
        certificateData.vaccinations.length;
      // certificateData.vaccinations.length >= certificateData.doseNumber;
      setIsAllDosesCompleted(allDosesCompleted);

      // If not all doses are completed, disable booster dose option
      if (!allDosesCompleted) {
        form.setValue("isBoosterDose", false);
      }

      // Set form values and store certificate details
      form.setValue("patientName", certificateData.patientName);
      form.setValue("fatherName", certificateData.fatherName || "");
      form.setValue("motherName", certificateData.motherName || "");
      form.setValue("permanentAddress", certificateData.permanentAddress || "");
      form.setValue("phoneNumber", certificateData.phoneNumber || "");
      form.setValue("nidNumber", certificateData.nidNumber || "");
      form.setValue("passportNumber", certificateData.passportNumber || "");
      form.setValue("nationality", certificateData.nationality);
      form.setValue(
        "dateOfBirth",
        new Date(certificateData.dateOfBirth).toISOString().split("T")[0]
      );
      form.setValue("gender", certificateData.gender);

      // Set the next dose number based on whether all doses are completed
      if (allDosesCompleted) {
        // If all doses are completed, don't increment the dose number
        form.setValue("doseNumber", certificateData.doseNumber);
      } else {
        // If doses are not completed, set next dose number
        const nextDoseNumber = certificateData.vaccinations.length + 1;
        form.setValue("doseNumber", nextDoseNumber);
      }
      setValidationError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError("Failed to validate certificate");
      }
    } finally {
      setIsValidatingCertificate(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (!session || status !== "authenticated") {
        toast({
          title: "Error",
          description: "You must be logged in to create a certificate",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // Validate required fields
      if (
        !data.patientName ||
        !data.nationality ||
        !data.dateOfBirth ||
        !data.gender ||
        !data.vaccineId ||
        !data.providerId ||
        !data.dateAdministered
      ) {
        const missingFields = Object.entries({
          patientName: !data.patientName,
          nationality: !data.nationality,
          dateOfBirth: !data.dateOfBirth,
          gender: !data.gender,
          vaccineId: !data.vaccineId,
          providerId: !data.providerId,
          dateAdministered: !data.dateAdministered,
        })
          .filter(([, missing]) => missing)
          .map(([field]) => field);

        console.error("Missing required fields:", missingFields);

        toast({
          title: "Error",
          description: `Missing required fields: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // Validate dose number against vaccine total dose only if it's not a booster dose
      if (
        selectedVaccine &&
        !data.isBoosterDose &&
        data.doseNumber > selectedVaccine.totalDose
      ) {
        toast({
          title: "Error",
          description: `Dose number cannot be greater than ${selectedVaccine.totalDose} for ${selectedVaccine.name}`,
          variant: "destructive",
        });
        return;
      }

      // Validate previous certificate number for doses > 1
      if (data.doseNumber > 1 && !data.previousCertificateNo) {
        toast({
          title: "Error",
          description:
            "Previous certificate number is required for doses after first dose",
          variant: "destructive",
        });
        return;
      }

      // Format dates
      const formattedData = {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
        dateAdministered: new Date(data.dateAdministered).toISOString(),
      };

      let response;

      if (data.isBoosterDose && data.previousCertificateNo) {
        // Add booster dose to existing certificate
        const updateResponse = await fetch(
          `/api/certificates/${previousCertificateDetails?.id}/booster`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              vaccineId: data.vaccineId,
              providerId: data.providerId,
              dateAdministered: formattedData.dateAdministered,
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || "Failed to add booster dose");
        }

        response = await updateResponse.json();
      } else if (data.doseNumber === 1) {
        // Create new certificate
        response = await createCertificate(formattedData);
      } else {
        // Add subsequent dose to existing certificate
        const updateResponse = await fetch(
          `/api/certificates/${previousCertificateDetails?.id}/vaccinations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              vaccineId: data.vaccineId,
              providerId: data.providerId,
              doseNumber: data.doseNumber,
              dateAdministered: formattedData.dateAdministered,
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || "Failed to update certificate");
        }

        response = await updateResponse.json();
      }

      // Check if response is an error response
      if ("error" in response) {
        throw new Error(
          typeof response.error === "string"
            ? response.error
            : "Failed to process certificate"
        );
      }

      toast({
        title: "Success",
        description:
          data.doseNumber === 1
            ? "Certificate created successfully"
            : "Certificate updated successfully",
      });

      router.push("/dashboard/certificates");
      router.refresh();
    } catch (error) {
      console.error("Certificate processing error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process certificate",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="vaccineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Vaccine <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset dose number and provider when vaccine changes
                    form.setValue("doseNumber", 1);
                    form.setValue("providerId", "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vaccine" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vaccines.map((vaccine) => (
                      <SelectItem
                        key={vaccine.id}
                        value={vaccine.id}
                        className="bg-background hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                      >
                        {vaccine.name} (Total Doses: {vaccine.totalDose})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedVaccine && selectedVaccine.providers.length > 0 && (
            <FormField
              control={form.control}
              name="providerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Provider <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedVaccine.providers.map((provider) => (
                        <SelectItem
                          key={provider.id}
                          value={provider.id}
                          className="bg-background hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                        >
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="doseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is this a subsequent dose?</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={field.value > 1}
                        onChange={(e) => {
                          field.onChange(e.target.checked ? 2 : 1);
                          if (!e.target.checked) {
                            form.setValue("previousCertificateNo", "");
                            form.setValue("isBoosterDose", false);
                            setPreviousCertificateDetails(null);
                            setValidationError(null);
                            setIsAllDosesCompleted(false);
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        This is not the first dose
                      </span>
                    </div>
                  </FormControl>
                  {selectedVaccine && (
                    <p className="text-xs text-muted-foreground">
                      Total doses required: {selectedVaccine.totalDose}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAllDosesCompleted && form.watch("doseNumber") > 1 && (
              <FormField
                control={form.control}
                name="isBoosterDose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is this a booster dose?</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                          }}
                        />
                        <span className="text-sm text-muted-foreground">
                          This is a booster dose
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {form.watch("doseNumber") > 1 && (
            <div className="col-span-2 space-y-4">
              <div className="flex gap-4 items-end">
                <FormField
                  control={form.control}
                  name="previousCertificateNo"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Previous Certificate Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter previous certificate number"
                          disabled={isValidatingCertificate}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  onClick={handleCheckPreviousCertificate}
                  disabled={isValidatingCertificate}
                >
                  {isValidatingCertificate
                    ? "Checking..."
                    : "Check Certificate"}
                </Button>
              </div>
              {validationError && (
                <div className="p-4 border border-red-600 rounded-lg bg-red-100">
                  <p className="text-red-600 font-medium">{validationError}</p>
                </div>
              )}

              {previousCertificateDetails && (
                <div className="space-y-6">
                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-lg font-semibold mb-4">
                      Previous Certificate Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Patient Name
                        </p>
                        <p className="font-medium">
                          {previousCertificateDetails.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Certificate Number
                        </p>
                        <p className="font-medium">
                          {previousCertificateDetails.certificateNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vaccine</p>
                        <p className="font-medium">
                          {previousCertificateDetails.vaccine?.name ||
                            "Vaccine not found"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Doses Received
                        </p>
                        <p className="font-medium">
                          {previousCertificateDetails.vaccinations.length} of{" "}
                          {selectedVaccine?.totalDose}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Booster Doses
                        </p>
                        <p className="font-medium">
                          {previousCertificateDetails.boosterDoses?.length || 0}
                        </p>
                      </div>
                      {!isAllDosesCompleted && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Next Dose Number
                          </p>
                          <p className="font-medium">
                            {previousCertificateDetails.vaccinations.length + 1}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg bg-card">
                    <h3 className="text-lg font-semibold mb-4">
                      Previous Vaccination History
                    </h3>
                    <div className="space-y-4">
                      {previousCertificateDetails.vaccinations?.map(
                        (vaccination) => (
                          <div
                            key={vaccination.id}
                            className="p-4 border rounded-lg"
                          >
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                  Vaccine
                                </dt>
                                <dd className="text-sm">
                                  {vaccination.vaccineName}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                  Provider
                                </dt>
                                <dd className="text-sm">
                                  {vaccination.provider.name}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                  Dose Number
                                </dt>
                                <dd className="text-sm">
                                  {vaccination.doseNumber}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                  Date Administered
                                </dt>
                                <dd className="text-sm">
                                  {new Date(
                                    vaccination.dateAdministered
                                  ).toLocaleDateString()}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                  Vaccination Center
                                </dt>
                                <dd className="text-sm">
                                  {vaccination.vaccinationCenter}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                  Vaccinated By
                                </dt>
                                <dd className="text-sm">
                                  {vaccination.vaccinatedByName}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        )
                      )}

                      {previousCertificateDetails.boosterDoses?.length > 0 && (
                        <>
                          <h4 className="text-md font-semibold mt-6 mb-4">
                            Booster Doses
                          </h4>
                          {previousCertificateDetails.boosterDoses.map(
                            (booster) => (
                              <div
                                key={booster.id}
                                className="p-4 border rounded-lg bg-muted"
                              >
                                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                  <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                      Vaccine
                                    </dt>
                                    <dd className="text-sm">
                                      {booster.vaccine.name}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                      Provider
                                    </dt>
                                    <dd className="text-sm">
                                      {booster.provider.name}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                      Date Administered
                                    </dt>
                                    <dd className="text-sm">
                                      {new Date(
                                        booster.dateAdministered
                                      ).toLocaleDateString()}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                      Vaccination Center
                                    </dt>
                                    <dd className="text-sm">
                                      {booster.vaccinationCenter}
                                    </dd>
                                  </div>
                                  <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                      Vaccinated By
                                    </dt>
                                    <dd className="text-sm">
                                      {booster.vaccinatedByName}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                            )
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {watchDoseNumber === 1 && (
            <>
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Patient Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patient name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Father&apos;s Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter father's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mother&apos;s Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mother's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permanentAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Permanent Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter permanent address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nidNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter NID number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Passport Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter passport number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter nationality" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Date of Birth <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Gender <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          className="bg-background hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                          value="MALE"
                        >
                          Male
                        </SelectItem>
                        <SelectItem
                          className="bg-background hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                          value="FEMALE"
                        >
                          Female
                        </SelectItem>
                        <SelectItem
                          className="bg-background hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                          value="OTHER"
                        >
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="dateAdministered"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Date Administered <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              watchDoseNumber > 1 &&
              (!previousCertificateDetails || Boolean(validationError))
            }
          >
            Create Certificate
          </Button>
        </div>
      </form>
    </Form>
  );
}
