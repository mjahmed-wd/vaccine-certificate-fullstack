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

const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  nidNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  vaccineId: z.string().min(1, "Vaccine is required"),
  doseNumber: z.coerce.number().min(1, "Dose number is required"),
  previousCertificateNo: z.string().optional(),
  dateAdministered: z.string().min(1, "Date administered is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface PreviousCertificateDetails extends Certificate {
  vaccine?: {
    name: string;
  };
}

export function CreateCertificateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [previousCertificateDetails, setPreviousCertificateDetails] =
    useState<PreviousCertificateDetails | null>(null);
  const [isValidatingCertificate, setIsValidatingCertificate] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
      nidNumber: "",
      passportNumber: "",
      nationality: "",
      dateOfBirth: "",
      gender: "MALE",
      vaccineId: "",
      doseNumber: 1,
      previousCertificateNo: "",
      dateAdministered: new Date().toISOString().split("T")[0],
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

    setIsValidatingCertificate(true);
    setValidationError(null);
    setPreviousCertificateDetails(null);

    try {
      const certificateResponse = await fetch(
        `/api/certificates/by-number/${previousNo}`
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
      console.log({ prevData });
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

      // Set form values and store certificate details
      form.setValue("patientName", certificateData.patientName);
      form.setValue("nidNumber", certificateData.nidNumber || "");
      form.setValue("passportNumber", certificateData.passportNumber || "");
      form.setValue("nationality", certificateData.nationality);
      form.setValue(
        "dateOfBirth",
        new Date(certificateData.dateOfBirth).toISOString().split("T")[0]
      );
      form.setValue("gender", certificateData.gender);
      setValidationError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError("Failed to validate certificate");
      }
      // setPreviousCertificateDetails(null);
      // setPreviousCertificateDetails(null);
    } finally {
      setIsValidatingCertificate(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Validate dose number against vaccine total dose
      if (selectedVaccine && data.doseNumber > selectedVaccine.totalDose) {
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

      await createCertificate(data);
      toast({
        title: "Success",
        description: "Certificate created successfully",
      });
      router.push("/dashboard/certificates");
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create certificate",
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
                <FormLabel>Vaccine</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset dose number when vaccine changes
                    form.setValue("doseNumber", 1);
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
                      <SelectItem key={vaccine.id} value={vaccine.id}>
                        {vaccine.name} (Total Doses: {vaccine.totalDose})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dose Number</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={selectedVaccine?.totalDose}
                    placeholder="Enter dose number"
                    {...field}
                  />
                </FormControl>
                {selectedVaccine && (
                  <p className="text-xs text-muted-foreground">
                    Maximum doses: {selectedVaccine.totalDose}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {watchDoseNumber > 1 && (
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
                      <p className="text-sm text-muted-foreground">Last Dose</p>
                      <p className="font-medium">
                        {previousCertificateDetails.doseNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="font-medium">
                        {new Date(
                          previousCertificateDetails.dateOfBirth
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Nationality
                      </p>
                      <p className="font-medium">
                        {previousCertificateDetails.nationality}
                      </p>
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
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patient name" {...field} />
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
                    <FormLabel>Passport Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter passport number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
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
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
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
                    <FormLabel>Gender</FormLabel>
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
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
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
                <FormLabel>Date Administered</FormLabel>
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
