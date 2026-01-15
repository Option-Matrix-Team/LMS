"use client";

import { format } from "date-fns";
import { Building2, Copy, Plus, Trash2 } from "lucide-react";
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
import { createLibrary, deleteLibrary } from "@/lib/actions/libraries";
import type { Library } from "@/lib/types";

interface LibrariesClientProps {
  initialLibraries: Library[];
}

export function LibrariesClient({ initialLibraries }: LibrariesClientProps) {
  const [libraries, setLibraries] = useState<Library[]>(initialLibraries);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddLibrary = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createLibrary(formData);
      toast.success("Library created successfully");
      setIsAddDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to create library");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLibrary = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this library? This will also delete all books, members, and borrowings associated with it.",
      )
    )
      return;

    try {
      await deleteLibrary(id);
      setLibraries(libraries.filter((l) => l.id !== id));
      toast.success("Library deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete library");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Library ID copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Libraries</h1>
          <p className="text-muted-foreground">Manage library organizations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Library
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAddLibrary}>
              <DialogHeader>
                <DialogTitle>Create New Library</DialogTitle>
                <DialogDescription>
                  Create a new library organization. You can assign admins after
                  creation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Library Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Central Library"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="e.g., 123 Main Street"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Library"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {libraries.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No libraries yet</h3>
          <p className="text-muted-foreground">
            Create your first library to get started
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Library ID</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {libraries.map((library) => (
              <TableRow key={library.id}>
                <TableCell className="font-medium">{library.name}</TableCell>
                <TableCell>{library.address || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] truncate">
                      {library.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => copyToClipboard(library.id)}
                      title="Copy Library ID"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {library.created_at
                    ? format(new Date(library.created_at), "MMM d, yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeleteLibrary(library.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
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
