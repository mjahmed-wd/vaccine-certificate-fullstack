'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.nativeEnum(Role),
  center: z.string().min(1, 'Center is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

type UserFormValues = z.infer<typeof userSchema>;

interface EditUserFormProps {
  id: string;
}

export default function EditUserForm({ id }: EditUserFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  // Load user data
  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }
        const { ...formData } = data;
        reset(formData);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load user');
        setIsLoading(false);
      });
  }, [id, reset]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      if (!data.password) {
        delete data.password;
      }

      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      router.push('/dashboard/users');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
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
            <h3 className="text-lg font-medium leading-6 text-gray-900">Edit User</h3>
            <p className="mt-1 text-sm text-gray-600">
              Update user information. Leave password blank to keep it unchanged.
            </p>
          </div>
        </div>

        <div className="mt-5 md:col-span-2 md:mt-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="shadow sm:overflow-hidden sm:rounded-md">
              <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      {...register('firstName')}
                      label="First name"
                      error={errors.firstName?.message}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      {...register('lastName')}
                      label="Last name"
                      error={errors.lastName?.message}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      {...register('username')}
                      label="Username"
                      disabled
                      error={errors.username?.message}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      type="password"
                      {...register('password')}
                      label="Password"
                      helperText="Leave blank to keep unchanged"
                      error={errors.password?.message}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <Select
                      {...register('role')}
                      label="Role"
                      error={errors.role?.message}
                    >
                      <option value={Role.TECHNICIAN}>Technician</option>
                      <option value={Role.ADMIN}>Admin</option>
                    </Select>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      {...register('center')}
                      label="Vaccination Center"
                      error={errors.center?.message}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <Input
                      {...register('phone')}
                      label="Phone Number"
                      error={errors.phone?.message}
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