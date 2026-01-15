"use client";

import { format, formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { extendBorrowing, returnBook } from "@/lib/actions/borrowings";
import type { BorrowingWithRelations } from "@/lib/types";

interface OverdueClientProps {
  initialBorrowings: BorrowingWithRelations[];
}

export function OverdueClient({ initialBorrowings }: OverdueClientProps) {
  const [borrowings, setBorrowings] = useState<BorrowingWithRelations[]>(initialBorrowings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReturnBook = async (borrowingId: string) => {
    if (!confirm("Confirm book return?")) return;

    setLoadingId(borrowingId);
    try {
      await returnBook(borrowingId);
      setBorrowings(borrowings.filter((b) => b.id !== borrowingId));
      toast.success("Book returned successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to return book");
    } finally {
      setLoadingId(null);
    }
  };

  const handleExtend = async (borrowingId: string) => {
    setLoadingId(borrowingId);
    try {
      await extendBorrowing(borrowingId);
      toast.success("Borrowing extended successfully");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to extend borrowing");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overdue Books</h1>
        <p className="text-muted-foreground">
          Members with books past their due date
        </p>
      </div>

      {borrowings.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium">No overdue books</h3>
          <p className="text-muted-foreground">
            All borrowed books are within their due dates
          </p>
        </div>
      ) : (
        <>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                {borrowings.length} overdue book(s)
              </span>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Overdue By</TableHead>
                <TableHead>Extended</TableHead>
                <TableHead className="w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowings.map((borrowing) => (
                <TableRow key={borrowing.id}>
                  <TableCell className="font-medium">
                    {borrowing.books?.name || "Unknown"}
                  </TableCell>
                  <TableCell>{borrowing.members?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{borrowing.phone_at_borrow}</div>
                      <div className="text-muted-foreground">
                        {borrowing.members?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-destructive font-medium">
                    {format(new Date(borrowing.due_date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-destructive">
                    {formatDistanceToNow(new Date(borrowing.due_date))}
                  </TableCell>
                  <TableCell>
                    {borrowing.extended_at ? (
                      <span className="text-muted-foreground">Yes</span>
                    ) : (
                      <span className="text-green-600">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!borrowing.extended_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExtend(borrowing.id)}
                          disabled={loadingId === borrowing.id}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Extend
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturnBook(borrowing.id)}
                        disabled={loadingId === borrowing.id}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Return
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
