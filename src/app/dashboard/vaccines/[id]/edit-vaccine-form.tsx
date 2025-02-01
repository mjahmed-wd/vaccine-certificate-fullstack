'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../../components/ui/input';

const vaccineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  totalDose: z.coerce.number().min(1, 'Total doses must be at least 1'),
});

type VaccineFormValues = z.infer<typeof vaccineSchema>;

interface EditVaccineFormProps {
  id: string;
}

export default function EditVaccineForm({ id }: EditVaccineFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VaccineFormValues>({
    resolver: zodResolver(vaccineSchema),
  });

  // Load vaccine data
  useEffect(() => {
    fetch(`/api/vaccines/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }
        reset(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load vaccine');
        setIsLoading(false);
      });
  }, [id, reset]);

  const onSubmit = async (data: VaccineFormValues) => {
    try {
      const response = await fetch(`/api/vaccines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update vaccine');
      }

      router.push('/dashboard/vaccines');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vaccine');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Vaccine</h3>
            <p className="mt-1 text-sm text-gray-600">
              Update vaccine information.
            </p>
          </div>
        </div>

        <div className="mt-5 md:col-span-2 md:mt-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="shadow sm:overflow-hidden sm:rounded-md">
              <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <Input
                      {...register('name')}
                      label="Vaccine Name"
                      error={errors.name?.message}
                    />
                  </div>

                  <div className="col-span-6">
                    <Input
                      type="number"
                      {...register('totalDose')}
                      label="Total Doses Required"
                      error={errors.totalDose?.message}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 