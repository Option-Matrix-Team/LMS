import type { Metadata } from "next";
import {
  AlertCircle,
  BookMarked,
  BookOpen,
  Building2,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your library overview and statistics",
};
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import getSupabaseAdmin from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const adminClient = getSupabaseAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile using admin client
  const { data: profile } = await adminClient
    .from("profiles")
    .select("*, libraries(*)")
    .eq("id", user.id)
    .single();

  const libraryId = profile?.library_id;
  const isSystemOperator = profile?.role === "system_operator";

  // Stats for library users
  let bookCount = 0;
  let memberCount = 0;
  let activeBorrowings = 0;
  let overdueCount = 0;

  // Stats for system operators
  let libraryCount = 0;
  let totalUsers = 0;
  let libraryStats: {
    id: string;
    name: string;
    books: number;
    members: number;
    users: number;
    borrowings: number;
  }[] = [];

  if (isSystemOperator) {
    // System operator stats
    const [librariesRes, usersRes] = await Promise.all([
      adminClient.from("libraries").select("id, name"),
      adminClient.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    libraryCount = librariesRes.data?.length || 0;
    totalUsers = usersRes.count || 0;

    // Get stats per library
    if (librariesRes.data) {
      libraryStats = await Promise.all(
        librariesRes.data.map(async (library) => {
          const [booksRes, membersRes, usersRes, borrowingsRes] =
            await Promise.all([
              adminClient
                .from("books")
                .select("id", { count: "exact", head: true })
                .eq("library_id", library.id),
              adminClient
                .from("members")
                .select("id", { count: "exact", head: true })
                .eq("library_id", library.id),
              adminClient
                .from("profiles")
                .select("id", { count: "exact", head: true })
                .eq("library_id", library.id),
              adminClient
                .from("borrowings")
                .select("id, books!inner(library_id)", {
                  count: "exact",
                  head: true,
                })
                .eq("books.library_id", library.id)
                .is("returned_at", null),
            ]);

          return {
            id: library.id,
            name: library.name,
            books: booksRes.count || 0,
            members: membersRes.count || 0,
            users: usersRes.count || 0,
            borrowings: borrowingsRes.count || 0,
          };
        }),
      );
    }
  } else if (libraryId) {
    // Regular user stats
    const [booksRes, membersRes, borrowingsRes, overdueRes] = await Promise.all(
      [
        adminClient
          .from("books")
          .select("id", { count: "exact", head: true })
          .eq("library_id", libraryId),
        adminClient
          .from("members")
          .select("id", { count: "exact", head: true })
          .eq("library_id", libraryId),
        adminClient
          .from("borrowings")
          .select("id, books!inner(library_id)", { count: "exact", head: true })
          .eq("books.library_id", libraryId)
          .is("returned_at", null),
        adminClient
          .from("borrowings")
          .select("id, books!inner(library_id)", { count: "exact", head: true })
          .eq("books.library_id", libraryId)
          .is("returned_at", null)
          .lt("due_date", new Date().toISOString()),
      ],
    );

    bookCount = booksRes.count || 0;
    memberCount = membersRes.count || 0;
    activeBorrowings = borrowingsRes.count || 0;
    overdueCount = overdueRes.count || 0;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.name || user?.email}
        </p>
      </div>

      {isSystemOperator ? (
        <>
          {/* System Operator Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Libraries
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{libraryCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active library organizations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users across all libraries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Books
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {libraryStats.reduce((sum, lib) => sum + lib.books, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Books across all libraries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Borrowings
                </CardTitle>
                <BookMarked className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {libraryStats.reduce((sum, lib) => sum + lib.borrowings, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently borrowed books
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Library Statistics Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Library Overview</CardTitle>
                  <CardDescription>
                    Statistics for each library organization
                  </CardDescription>
                </div>
                <Link href="/libraries">
                  <Button variant="outline" size="sm">
                    Manage Libraries
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {libraryStats.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No libraries created yet
                  </p>
                  <Link href="/libraries">
                    <Button className="mt-4">Create First Library</Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Library</TableHead>
                      <TableHead className="text-center">Users</TableHead>
                      <TableHead className="text-center">Books</TableHead>
                      <TableHead className="text-center">Members</TableHead>
                      <TableHead className="text-center">
                        Active Borrowings
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {libraryStats.map((lib) => (
                      <TableRow key={lib.id}>
                        <TableCell className="font-medium">
                          {lib.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {lib.users}
                        </TableCell>
                        <TableCell className="text-center">
                          {lib.books}
                        </TableCell>
                        <TableCell className="text-center">
                          {lib.members}
                        </TableCell>
                        <TableCell className="text-center">
                          {lib.borrowings}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/libraries" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Create New Library
                  </Button>
                </Link>
                <Link href="/users" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users & Roles
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Role:</span>
                    <span className="font-medium">System Operator</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookCount}</div>
              <p className="text-xs text-muted-foreground">Books in catalog</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberCount}</div>
              <p className="text-xs text-muted-foreground">
                Registered members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Borrowings
              </CardTitle>
              <BookMarked className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBorrowings}</div>
              <p className="text-xs text-muted-foreground">
                Books currently borrowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {overdueCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Books past due date
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
