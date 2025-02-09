"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration mismatch by mounting on client-side only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageSize: pageSize,
        pageIndex: currentPage - 1,
      },
    },
    manualPagination: true,
    pageCount: pageCount,
  });

  // Return loading state or null while client-side hydration is happening
  if (!isMounted) return null;

  return (
    <div>
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
      <div className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {pageCount} ({data.length} items)
          </div>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select rows" />
            </SelectTrigger>
            <SelectContent>
              {[10, 50, 100, 500].map((size) => (
                <SelectItem
                  key={size}
                  value={size.toString()}
                  className="bg-background hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                >
                  Show {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="min-w-[80px] transition-transform duration-200 hover:scale-105"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            className="min-w-[80px] transition-transform duration-200 hover:scale-105"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
