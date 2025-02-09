"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pen, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface Vaccine {
  id: string;
  name: string;
  totalDose: number;
  providers: { id: string; name: string }[];
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const { toast } = useToast();
  const vaccine = row.original as Vaccine;

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/vaccines/${vaccine.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete vaccine");
      }

      toast({
        title: "Success",
        description: "Vaccine deleted successfully",
      });

      router.refresh();
    } catch (err) {
      console.error("Failed to delete vaccine:", err);
      toast({
        title: "Error",
        description: "Failed to delete vaccine",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => router.push(`/dashboard/vaccines/${vaccine.id}`)}
        >
          <Pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete}>
          <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 