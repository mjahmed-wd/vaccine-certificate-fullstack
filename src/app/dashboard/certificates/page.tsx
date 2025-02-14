'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Certificate, columns } from "./columns";
import { DataTable } from "./data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const searchFields = [
  { value: "certificateNo", label: "Certificate No" },
  { value: "patientName", label: "Patient Name" },
  { value: "nidNumber", label: "NID Number" },
  { value: "passportNumber", label: "Passport Number" },
] as const;

type SearchField = (typeof searchFields)[number]["value"];

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("patientName");
  const [isSearching, setIsSearching] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCertificates = useCallback(async (page?: number, limit?: number) => {
    try {
      const response = await fetch(
        `/api/certificates?page=${page || currentPage}&limit=${limit || pageSize}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data, meta } = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setCertificates(data);
      setTotalPages(meta.pageCount);
      setError(null);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load certificates. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchCertificates();
  }, [currentPage, fetchCertificates, pageSize]);

  const handleSearch = async () => {
    if (!searchQuery.trim() && !fromDate && !toDate) {
      fetchCertificates();
      return;
    }
    setIsSearching(true);
    try {
      const url = `/api/certificates/search?`;
      const params = new URLSearchParams();
      
      if (searchQuery.trim()) {
        params.append('field', searchField);
        params.append('query', searchQuery);
      }
      
      if (fromDate) {
        params.append('fromDate', fromDate);
      }
      
      if (toDate) {
        params.append('toDate', toDate);
      }
      
      params.append('limit', pageSize.toString());
      params.append('page', currentPage.toString());
      
      const response = await fetch(`${url}${params.toString()}`);
      const { data, meta } = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to search certificates");
      }
      setCertificates(data);
      setTotalPages(meta.pageCount);
    } catch {
      toast({
        title: "Error",
        description: "Failed to search certificates",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    fetchCertificates(1, newPageSize);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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
        {/* Search Section - Always visible */}
        <div className="p-4 border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
              <Input
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-[200px] flex-1 transition-colors duration-200 focus:border-[#007C02] focus:ring-[#007C02]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <Select
                value={searchField}
                onValueChange={(value: SearchField) => setSearchField(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px] transition-colors duration-200 focus:border-[#007C02] focus:ring-[#007C02]">
                  <SelectValue placeholder="Search by..." />
                </SelectTrigger>
                <SelectContent>
                  {searchFields.map((field) => (
                    <SelectItem
                      key={field.value}
                      value={field.value}
                      className="bg-background hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                    >
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Date Range Filters */}
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full sm:w-[180px] transition-colors duration-200 focus:border-[#007C02] focus:ring-[#007C02]"
                  placeholder="From Date"
                />
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full sm:w-[180px] transition-colors duration-200 focus:border-[#007C02] focus:ring-[#007C02]"
                  placeholder="To Date"
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full sm:w-auto transition-transform duration-200 hover:scale-105"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
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
          <DataTable 
            columns={columns} 
            data={certificates}
            pageCount={totalPages}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            filterInfo={{
              searchField,
              searchQuery,
              fromDate,
              toDate
            }}
          />
        )}
      </div>
    </div>
  );
}