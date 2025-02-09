'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Certificate, columns } from "./columns";
import { DataTable } from "./data-table";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setCertificates(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load certificates. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchCertificates();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Vaccination Certificates</h1>
          <p className="mt-2 text-md text-gray-600">
            Manage and track vaccination certificates in the system.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/certificates/create"
            className="inline-flex items-center justify-center rounded-lg transform transition-all duration-200 ease-in-out 
                       bg-[#007C02] hover:bg-[#007C02]/90 px-6 py-3 text-sm font-semibold text-white shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-[#007C02] focus:ring-offset-2"
          >
            <span className="mr-2">+</span> New Certificate
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="ml-3 text-sm font-medium text-red-700">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
        {isLoading ? (
          <div className="px-6 py-8 text-center">
            <div className="flex justify-center items-center space-x-2">
              <div className="animate-spin h-8 w-8 border-4 border-[#007C02] rounded-full border-t-transparent"></div>
              <span className="text-gray-600">Loading certificates...</span>
            </div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No certificates found in the system.
          </div>
        ) : (
          <DataTable columns={columns} data={certificates} />
        )}
      </div>
    </div>
  );
}