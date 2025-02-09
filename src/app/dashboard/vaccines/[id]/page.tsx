"use client";

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
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";
import { use } from "react";

const vaccineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  totalDose: z.coerce.number().min(1, "Total doses must be at least 1"),
  providers: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Provider name is required")
  }))
});

type VaccineFormValues = z.infer<typeof vaccineSchema>;

interface Vaccine {
  id: string;
  name: string;
  totalDose: number;
  providers: { id: string; name: string }[];
}

export default function EditVaccinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [newProvider, setNewProvider] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<VaccineFormValues>({
    resolver: zodResolver(vaccineSchema),
    defaultValues: {
      name: "",
      totalDose: 1,
      providers: []
    },
  });

  useEffect(() => {
    const fetchVaccine = async () => {
      try {
        const response = await fetch(`/api/vaccines/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch vaccine");
        }
        const vaccine: Vaccine = await response.json();
        
        form.reset({
          name: vaccine.name,
          totalDose: vaccine.totalDose,
          providers: vaccine.providers
        });
      } catch (err) {
        console.error("Failed to fetch vaccine:", err);
        toast({
          title: "Error",
          description: "Failed to fetch vaccine details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVaccine();
  }, [id, form, toast]);

  const providers = form.watch("providers") || [];

  const addProvider = () => {
    if (!newProvider.trim()) return;
    
    const currentProviders = form.getValues("providers") || [];
    form.setValue("providers", [...currentProviders, { name: newProvider.trim() }]);
    setNewProvider("");
  };

  const removeProvider = (index: number) => {
    const currentProviders = form.getValues("providers") || [];
    form.setValue("providers", currentProviders.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: VaccineFormValues) => {
    try {
      const response = await fetch(`/api/vaccines/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update vaccine");
      }

      toast({
        title: "Success",
        description: "Vaccine updated successfully",
      });

      router.push("/dashboard/vaccines");
      router.refresh();
    } catch (err) {
      console.error("Failed to update vaccine:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update vaccine",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Edit Vaccine
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Update vaccine details and manage its providers.
            </p>
          </div>
        </div>

        <div className="mt-5 md:col-span-2 md:mt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <FormField
                        control={form.control}
                        name="totalDose"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Dose *</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Providers *
                      </label>
                      <div className="mt-1 flex space-x-2">
                        <Input
                          value={newProvider}
                          onChange={(e) => setNewProvider(e.target.value)}
                          placeholder="Enter provider name"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addProvider();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addProvider}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {providers.length > 0 && (
                      <div className="border rounded-md p-4">
                        <div className="space-y-2">
                          {providers.map((provider, index) => (
                            <div
                              key={provider.id || index}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                              <span>{provider.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProvider(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="mr-3"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting || providers.length === 0}
                  >
                    Update Vaccine
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
