"use client";

import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  Crown,
  Plus,
  Trash2,
  User,
  UserCog,
} from "lucide-react";
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
import {
  addLibrarianByEmail,
  removeLibrarian,
  updateLibrarianRole,
} from "@/lib/actions/librarians";
import type { Profile } from "@/lib/types";

interface LibrariansClientProps {
  initialLibrarians: Profile[];
  currentUserId: string;
}

export function LibrariansClient({
  initialLibrarians,
  currentUserId,
}: LibrariansClientProps) {
  const [librarians, setLibrarians] = useState<Profile[]>(initialLibrarians);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleAddLibrarian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const result = await addLibrarianByEmail(email);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Librarian added successfully");
        setIsAddDialogOpen(false);
        setEmail("");
        window.location.reload();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add librarian";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLibrarian = async (id: string) => {
    if (!confirm("Remove this staff member from your library?")) return;

    try {
      const result = await removeLibrarian(id);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        setLibrarians(librarians.filter((l) => l.id !== id));
        toast.success("Staff member removed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove staff member";
      toast.error(message);
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole =
      currentRole === "library_admin" ? "librarian" : "library_admin";
    const action = currentRole === "library_admin" ? "demote" : "promote";

    if (!confirm(`Are you sure you want to ${action} this staff member?`))
      return;

    try {
      const result = await updateLibrarianRole(id, newRole);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        setLibrarians(
          librarians.map((l) => (l.id === id ? { ...l, role: newRole } : l)),
        );
        toast.success(`Staff member ${action}d successfully`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update role";
      toast.error(message);
    }
  };

  const getRoleBadge = (role: string, isCurrentUser: boolean) => {
    const baseClasses =
      "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium";

    if (role === "library_admin") {
      return (
        <span
          className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}
        >
          <Crown className="h-3 w-3" />
          Admin {isCurrentUser && "(You)"}
        </span>
      );
    }
    return (
      <span
        className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200`}
      >
        <User className="h-3 w-3" />
        Librarian
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage librarians in your library
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <form onSubmit={handleAddLibrarian}>
              <DialogHeader>
                <DialogTitle>Add Staff Member</DialogTitle>
                <DialogDescription>
                  Add an existing user to your library as a librarian. They need
                  to have signed up first.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="librarian@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                  {isLoading ? "Adding..." : "Add to Library"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {librarians.length === 0 ? (
        <div className="text-center py-12">
          <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No staff members yet</h3>
          <p className="text-muted-foreground">
            Add librarians to help manage your library
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {librarians.map((librarian) => {
              const isCurrentUser = librarian.id === currentUserId;

              return (
                <TableRow key={librarian.id}>
                  <TableCell className="font-medium">
                    {librarian.email}
                  </TableCell>
                  <TableCell>{librarian.name || "-"}</TableCell>
                  <TableCell>
                    {getRoleBadge(librarian.role, isCurrentUser)}
                  </TableCell>
                  <TableCell>
                    {librarian.created_at
                      ? format(new Date(librarian.created_at), "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {!isCurrentUser && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            handleToggleRole(librarian.id, librarian.role)
                          }
                          title={
                            librarian.role === "library_admin"
                              ? "Demote to Librarian"
                              : "Promote to Admin"
                          }
                        >
                          {librarian.role === "library_admin" ? (
                            <ArrowDown className="h-4 w-4 text-orange-500" />
                          ) : (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveLibrarian(librarian.id)}
                          className="text-destructive hover:text-destructive"
                          title="Remove from library"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
