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
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Certificate } from "./columns";

interface DataTableProps<TData extends Certificate, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  filterInfo?: {
    searchField?: string;
    searchQuery?: string;
    fromDate?: string;
    toDate?: string;
  };
}

export function DataTable<TData extends Certificate, TValue>({
  columns,
  data,
  pageCount,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  filterInfo,
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let yPos = 15;

    // Add hospital pad header
    const pageWidth = doc.internal.pageSize.width;
    const imageWidth = pageWidth * 0.9; // 90% of page width
    const leftMargin = (pageWidth - imageWidth) / 2; // Center the image
    doc.addImage("/pad-top.jpg", "JPEG", leftMargin, yPos, imageWidth, 40);
    yPos += 45; // Adjust yPos after the header image

    // Remove the horizontal line and adjust spacing
    yPos += 5;

    // Report title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Vaccination Certificates Report",
      doc.internal.pageSize.width / 2,
      yPos,
      { align: "center" }
    );
    yPos += 5;

    // Add a line separator after the report title
    doc.setLineWidth(0.5);
    doc.line(14, yPos + 3, doc.internal.pageSize.width - 14, yPos + 3);
    yPos += 13;

    // Generation timestamp
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, yPos);
    yPos += 10;

    // Add filter information if any
    if (filterInfo) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);

      // Add a "Filters Applied:" header if any filters are active
      if (filterInfo.searchQuery || filterInfo.fromDate || filterInfo.toDate) {
        doc.setFont("helvetica", "bold");
        doc.text("Filters Applied:", 14, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
      }

      // Show search information
      if (filterInfo.searchQuery) {
        const searchFieldMap: Record<string, string> = {
          certificateNo: "Certificate Number",
          patientName: "Patient Name",
          nidNumber: "NID Number",
          passportNumber: "Passport Number",
        };
        const fieldName =
          searchFieldMap[filterInfo.searchField || ""] ||
          filterInfo.searchField;
        doc.text(
          `Search: ${fieldName} = "${filterInfo.searchQuery}"`,
          14,
          yPos
        );
        yPos += 5;
      }

      // Show date range information
      if (filterInfo.fromDate || filterInfo.toDate) {
        const fromDate = filterInfo.fromDate
          ? new Date(filterInfo.fromDate).toLocaleDateString()
          : "Any";
        const toDate = filterInfo.toDate
          ? new Date(filterInfo.toDate).toLocaleDateString()
          : "Any";
        doc.text(`Date Range: From ${fromDate} to ${toDate}`, 14, yPos);
        yPos += 5;
      }

      // Add pagination information
      doc.text(
        `Page ${currentPage} of ${pageCount} (${data.length} items per page)`,
        14,
        yPos
      );
      yPos += 5;

      doc.setTextColor(0, 0, 0);
    }
    yPos += 5;

    // Prepare the data for PDF
    const headers = [
      "Certificate No",
      "Patient Name",
      "NID Number",
      "Passport Number",
      "Nationality",
      "Vaccine",
      "Dose Taken",
      "Booster Doses",
      "Date Administered",
    ];

    const rows = data.map((item: Certificate) => [
      item.certificateNo,
      item.patientName,
      item.nidNumber || "-",
      item.passportNumber || "-",
      item.nationality,
      item.vaccine?.name || "-",
      `${item.vaccinations?.length || 0} / ${item.vaccine?.totalDose || 0}`,
      item.boosterDoses?.length || 0,
      new Date(item.dateAdministered).toLocaleDateString(),
    ]);

    // Generate the table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: yPos,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 124, 2] }, // Using the green color from your theme
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Save the PDF
    doc.save("vaccination-certificates.pdf");
  };

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
          <div className="text-sm text-black">
            Page {currentPage} of {pageCount} ({data.length} items)
          </div>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select rows" className="text-black" />
            </SelectTrigger>
            <SelectContent>
              {[10, 50, 100, 500].map((size) => (
                <SelectItem
                  key={size}
                  value={size.toString()}
                  className="bg-background hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground text-black"
                >
                  Show {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="icon"
            className="h-9 w-9 text-black hover:bg-[#007C02] hover:text-white transition-colors"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="min-w-[80px] text-black transition-transform duration-200 hover:scale-105 hover:text-white"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            className="min-w-[80px] text-black transition-transform duration-200 hover:scale-105 hover:text-white"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
