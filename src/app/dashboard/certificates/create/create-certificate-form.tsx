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
import { getVaccines, type Vaccine } from "@/lib/api/vaccines";

const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  nidNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  vaccineId: z.string().min(1, "Vaccine is required"),
  doseNumber: z.coerce.number().min(1, "Dose number is required"),
  dateAdministered: z.string().min(1, "Date administered is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCertificateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);

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
      dateAdministered: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
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

          <FormField
            control={form.control}
            name="vaccineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vaccine</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vaccine" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white shadow-md rounded-md z-10">
                    {vaccines.map((vaccine) => (
                      <SelectItem
                        key={vaccine.id}
                        value={vaccine.id}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        {vaccine.name}
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
                    placeholder="Enter dose number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
          <Button type="submit">Create Certificate</Button>
        </div>
      </form>
    </Form>
  );
}
