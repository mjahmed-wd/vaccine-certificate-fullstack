'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Vaccine {
  id: string;
  name: string;
  totalDose: number;
}

export default function VaccinesPage() {
  const router = useRouter();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/vaccines')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setVaccines(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load vaccines');
        setIsLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vaccine?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vaccines/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete vaccine');
      }

      setVaccines(vaccines.filter(vaccine => vaccine.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vaccine');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Vaccine Inventory</h1>
          <p className="mt-2 text-md text-gray-600">
            Manage vaccine inventory and track available doses in the system.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/vaccines/create"
            className="inline-flex items-center justify-center rounded-lg transform transition-all duration-200 ease-in-out 
                       bg-[#007C02] hover:bg-[#007C02]/90 px-6 py-3 text-sm font-semibold text-white shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-[#007C02] focus:ring-offset-2"
          >
            <span className="mr-2">+</span> Add New Vaccine
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 transition-all duration-300 ease-in-out">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="ml-3 text-sm font-medium text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Vaccine Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Available Doses
                </th>
                <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin h-8 w-8 border-4 border-[#007C02] rounded-full border-t-transparent"></div>
                      <span className="text-gray-600">Loading vaccines...</span>
                    </div>
                  </td>
                </tr>
              ) : vaccines.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No vaccines found in the inventory.
                  </td>
                </tr>
              ) : (
                vaccines.map((vaccine) => (
                  <tr 
                    key={vaccine.id}
                    className="hover:bg-gray-50 transition-colors duration-200 ease-in-out"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vaccine.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {vaccine.totalDose} Doses
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button
                        onClick={() => router.push(`/dashboard/vaccines/${vaccine.id}`)}
                        className="text-[#007C02] hover:text-[#007C02]/90 transform transition-all duration-150 ease-in-out hover:scale-105"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vaccine.id)}
                        className="text-red-600 hover:text-red-900 transform transition-all duration-150 ease-in-out hover:scale-105"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}