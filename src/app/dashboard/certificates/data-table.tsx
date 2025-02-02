"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const searchFields = [
  { value: "certificateNo", label: "Certificate No" },
  { value: "patientName", label: "Patient Name" },
  { value: "nidNumber", label: "NID Number" },
  { value: "passportNumber", label: "Passport Number" },
] as const;

type SearchField = (typeof searchFields)[number]["value"];

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [isMounted, setIsMounted] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("patientName");
  const [isSearching, setIsSearching] = useState(false);

  // Handle hydration mismatch by mounting on client-side only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      table.setPageIndex(0);
      table.getColumn(searchField)?.setFilterValue(searchQuery);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/certificates/search?field=${searchField}&query=${encodeURIComponent(
          searchQuery
        )}`
      );
      const searchData = await response.json();
      if (!response.ok) {
        throw new Error(searchData.error || "Failed to search certificates");
      }
      table.setPageIndex(0);
      table.getColumn(searchField)?.setFilterValue(searchQuery);
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

  // Return loading state or null while client-side hydration is happening
  if (!isMounted) {
    return (
      <div className="w-full space-y-6 overflow-hidden rounded-lg bg-white p-4 shadow-sm transition-all">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 overflow-hidden rounded-lg bg-white p-4 shadow-sm transition-all">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900 transition-colors duration-300 hover:text-[#007C02]">
          Certificates
        </h2>
        <Link href="/dashboard/certificates/create">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg transform transition-all duration-200 ease-in-out 
                       bg-[#007C02] hover:bg-[#007C02]/90 px-6 py-3 text-sm font-semibold text-white shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-[#007C02] focus:ring-offset-2 focus:ring-offset-[#007C02]/20"
          >
            <span className="mr-2">+</span> New Certificate
          </button>
        </Link>
      </div>

      {/* Search Section */}
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
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* Table Section */}
      <div className="relative overflow-x-auto rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-gray-50 transition-colors duration-200 hover:bg-gray-100"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-[#007C02]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 transition-colors duration-200 hover:text-[#007C02]"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-gray-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
        <div className="text-sm text-gray-500">
          Showing {table.getRowModel().rows.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="min-w-[80px] transition-transform duration-200 hover:scale-105"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="min-w-[80px] transition-transform duration-200 hover:scale-105"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
