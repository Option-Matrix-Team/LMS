"use client";

import { BookOpen, Clock, Loader2, RefreshCw, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { updateBorrowingPolicy } from "@/lib/actions/policies";

interface BorrowingPolicy {
  library_id: string;
  max_books_per_member: number;
  borrow_duration_days: number;
  extension_duration_days: number;
}

interface PoliciesClientProps {
  initialPolicy: BorrowingPolicy;
  isAdmin: boolean;
}

export function PoliciesClient({
  initialPolicy,
  isAdmin,
}: PoliciesClientProps) {
  const [policy, setPolicy] = useState<BorrowingPolicy>(initialPolicy);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateBorrowingPolicy({
        max_books_per_member: policy.max_books_per_member,
        borrow_duration_days: policy.borrow_duration_days,
        extension_duration_days: policy.extension_duration_days,
      });
      toast.success("Borrowing policy updated successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update policy";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Borrowing Policies</h1>
        <p className="text-muted-foreground">
          Configure borrowing rules for your library
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Max Books Per Member */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                Max Books
              </CardTitle>
              <CardDescription>
                Maximum books a member can borrow at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="max_books">Books per member</Label>
                <Input
                  id="max_books"
                  type="number"
                  min={1}
                  max={50}
                  value={policy.max_books_per_member}
                  onChange={(e) =>
                    setPolicy({
                      ...policy,
                      max_books_per_member: parseInt(e.target.value) || 1,
                    })
                  }
                  disabled={!isAdmin || isLoading}
                  className="text-lg font-semibold"
                />
              </div>
            </CardContent>
          </Card>

          {/* Borrow Duration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Borrow Duration
              </CardTitle>
              <CardDescription>How long members can keep books</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="borrow_duration">Days</Label>
                <Input
                  id="borrow_duration"
                  type="number"
                  min={1}
                  max={365}
                  value={policy.borrow_duration_days}
                  onChange={(e) =>
                    setPolicy({
                      ...policy,
                      borrow_duration_days: parseInt(e.target.value) || 14,
                    })
                  }
                  disabled={!isAdmin || isLoading}
                  className="text-lg font-semibold"
                />
              </div>
            </CardContent>
          </Card>

          {/* Extension Duration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <RefreshCw className="h-5 w-5" />
                Extension
              </CardTitle>
              <CardDescription>
                Extra days when borrowing is extended (0 to disable)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="extension_duration">Days</Label>
                <Input
                  id="extension_duration"
                  type="number"
                  min={0}
                  max={30}
                  value={policy.extension_duration_days}
                  onChange={(e) =>
                    setPolicy({
                      ...policy,
                      extension_duration_days: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={!isAdmin || isLoading}
                  className="text-lg font-semibold"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {isAdmin ? (
          <div className="mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="mt-6 text-sm text-muted-foreground">
            Only Library Admins can update borrowing policies.
          </div>
        )}
      </form>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Policy Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              • Members can borrow up to{" "}
              <strong>{policy.max_books_per_member} books</strong> at a time
            </li>
            <li>
              • Books are due after{" "}
              <strong>{policy.borrow_duration_days} days</strong>
            </li>
            <li>
              •{" "}
              {policy.extension_duration_days > 0 ? (
                <>
                  Members can extend once for{" "}
                  <strong>{policy.extension_duration_days} extra days</strong>
                </>
              ) : (
                <>
                  Extensions are <strong>disabled</strong>
                </>
              )}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
