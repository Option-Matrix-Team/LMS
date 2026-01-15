"use client";

import {
  BookOpen,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { addBook, deleteBook } from "@/lib/actions/books";
import {
  deleteBookThumbnail,
  updateBookWithThumbnail,
  uploadBookThumbnail,
} from "@/lib/actions/image-upload";
import { searchBooks } from "@/lib/actions/search";
import { compressImage, isValidImageType } from "@/lib/image-utils";
import type { Book } from "@/lib/types";

interface CatalogClientProps {
  initialBooks: Book[];
}

export function CatalogClient({ initialBooks }: CatalogClientProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const handleSearch = useCallback(async (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setSearchQuery(query);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchBooks(query);
        setBooks(results as Book[]);
      } catch (error) {
        console.error("Search error:", error);
        // Keep current books on error
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!isValidImageType(file)) {
        toast.error("Invalid image type. Use JPEG, PNG, WebP, GIF, or AVIF");
        return;
      }

      // Max 10MB before compression
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image too large. Maximum size is 10MB");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // First add the book
      const result = await addBook(formData);

      // If there's an image, compress and upload it
      if (selectedImage && result.bookId) {
        setIsUploading(true);

        // Compress image in browser before upload (converts to WebP)
        const compressedImage = await compressImage(selectedImage, {
          maxWidth: 400,
          maxHeight: 600,
          quality: 0.8,
        });

        const imageFormData = new FormData();
        imageFormData.append("image", compressedImage);

        const uploadResult = await uploadBookThumbnail(imageFormData);

        if ("url" in uploadResult) {
          await updateBookWithThumbnail(result.bookId, uploadResult.url);
        } else {
          toast.error(uploadResult.error || "Failed to upload image");
        }
        setIsUploading(false);
      }

      toast.success("Book added successfully");
      setIsAddDialogOpen(false);
      setImagePreview(null);
      setSelectedImage(null);
      window.location.reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add book";
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleDeleteBook = async (id: string, thumbnailUrl?: string | null) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      // Delete thumbnail if exists
      if (thumbnailUrl) {
        await deleteBookThumbnail(thumbnailUrl);
      }

      await deleteBook(id);
      setBooks(books.filter((b) => b.id !== id));
      toast.success("Book deleted");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete book";
      toast.error(message);
    }
  };

  const clearImageSelection = () => {
    setImagePreview(null);
    setSelectedImage(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Book Catalog</h1>
          <p className="text-muted-foreground">
            Manage your library's book collection
          </p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              clearImageSelection();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleAddBook}>
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
                <DialogDescription>
                  Enter the book details to add it to your catalog.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-[1fr_140px] gap-4">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Book Name *</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="author">Author *</Label>
                      <Input id="author" name="author" required />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="grid gap-2">
                    <Label>Cover Image</Label>
                    <div className="relative">
                      {imagePreview ? (
                        <div className="relative w-full h-[140px] border rounded-lg overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={clearImageSelection}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-[140px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">
                            Upload Cover
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input id="isbn" name="isbn" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="total_copies">Total Copies</Label>
                    <Input
                      id="total_copies"
                      name="total_copies"
                      type="number"
                      min="1"
                      defaultValue="1"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location in Library</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Shelf A, Row 3"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" />
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
                <Button type="submit" disabled={isLoading || isUploading}>
                  {isLoading || isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isUploading ? "Uploading..." : "Adding..."}
                    </>
                  ) : (
                    "Add Book"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No books found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : "Add your first book to get started"}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Cover</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  {book.thumbnail_url ? (
                    <Image
                      src={book.thumbnail_url}
                      alt={book.name}
                      width={40}
                      height={56}
                      className="w-10 h-14 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{book.name}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.isbn || "-"}</TableCell>
                <TableCell>{book.location || "-"}</TableCell>
                <TableCell>
                  <span
                    className={
                      book.available_copies > 0
                        ? "text-green-600"
                        : "text-destructive"
                    }
                  >
                    {book.available_copies} / {book.total_copies}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      handleDeleteBook(book.id, book.thumbnail_url)
                    }
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
