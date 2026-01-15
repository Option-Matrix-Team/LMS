"use client";

import { format } from "date-fns";
import { BookMarked, Plus, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { issueBook, returnBook } from "@/lib/actions/borrowings";
import type { Book, BorrowingWithRelations, Member } from "@/lib/types";

interface BorrowingsClientProps {
  initialBorrowings: BorrowingWithRelations[];
  books: Book[];
  members: Member[];
}

export function BorrowingsClient({
  initialBorrowings,
  books,
  members,
}: BorrowingsClientProps) {
  const [borrowings, setBorrowings] = useState<BorrowingWithRelations[]>(initialBorrowings);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [phone, setPhone] = useState("");

  const availableBooks = books.filter((b) => b.available_copies > 0);

  const filteredMembers = members.filter(
    (m) =>
      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.phone && m.phone.includes(memberSearch)),
  );

  const handleIssueBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMember || !selectedBook || !phone) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("book_id", selectedBook);
      formData.append("member_id", selectedMember.id);
      formData.append("phone", phone);

      await issueBook(formData);
      toast.success("Book issued successfully");
      setIsIssueDialogOpen(false);
      setSelectedMember(null);
      setSelectedBook("");
      setPhone("");
      setMemberSearch("");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to issue book");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnBook = async (borrowingId: string) => {
    if (!confirm("Confirm book return?")) return;

    try {
      await returnBook(borrowingId);
      setBorrowings(borrowings.filter((b) => b.id !== borrowingId));
      toast.success("Book returned successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to return book");
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Borrowings</h1>
          <p className="text-muted-foreground">Manage book loans</p>
        </div>
        <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Issue Book
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleIssueBook}>
              <DialogHeader>
                <DialogTitle>Issue Book</DialogTitle>
                <DialogDescription>
                  Find member by email or phone, select a book, and update phone
                  number.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Member Search */}
                <div className="grid gap-2">
                  <Label>Find Member (Email or Phone) *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email or phone..."
                      value={memberSearch}
                      onChange={(e) => {
                        setMemberSearch(e.target.value);
                        setSelectedMember(null);
                      }}
                      className="pl-10"
                    />
                  </div>
                  {memberSearch &&
                    !selectedMember &&
                    filteredMembers.length > 0 && (
                      <div className="border rounded-md max-h-32 overflow-y-auto">
                        {filteredMembers.map((m) => (
                          <div
                            key={m.id}
                            className="p-2 hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setSelectedMember(m);
                              setMemberSearch(m.name);
                              setPhone(m.phone || "");
                            }}
                          >
                            <div className="font-medium">{m.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {m.email} • {m.phone || "No phone"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  {selectedMember && (
                    <div className="p-2 bg-muted rounded-md text-sm">
                      Selected: <strong>{selectedMember.name}</strong> (
                      {selectedMember.email})
                    </div>
                  )}
                </div>

                {/* Phone Update */}
                <div className="grid gap-2">
                  <Label htmlFor="phone">
                    Phone Number (Required for each borrow) *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Book Selection */}
                <div className="grid gap-2">
                  <Label htmlFor="book">Select Book *</Label>
                  <select
                    id="book"
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    required
                  >
                    <option value="">Choose a book...</option>
                    {availableBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.name} by {book.author} ({book.available_copies}{" "}
                        available)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsIssueDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !selectedMember}>
                  {isLoading ? "Issuing..." : "Issue Book"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {borrowings.length === 0 ? (
        <div className="text-center py-12">
          <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No active borrowings</h3>
          <p className="text-muted-foreground">
            Issue a book to a member to get started
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Borrowed</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {borrowings.map((borrowing) => (
              <TableRow key={borrowing.id}>
                <TableCell className="font-medium">
                  {borrowing.books?.name || "Unknown"}
                </TableCell>
                <TableCell>{borrowing.members?.name || "Unknown"}</TableCell>
                <TableCell>{borrowing.phone_at_borrow}</TableCell>
                <TableCell>
                  {borrowing.borrowed_at
                    ? format(new Date(borrowing.borrowed_at), "MMM d, yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      isOverdue(borrowing.due_date)
                        ? "text-destructive font-medium"
                        : ""
                    }
                  >
                    {format(new Date(borrowing.due_date), "MMM d, yyyy")}
                    {isOverdue(borrowing.due_date) && " (Overdue)"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReturnBook(borrowing.id)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Return
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
